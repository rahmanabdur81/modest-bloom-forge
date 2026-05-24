
-- Validate cart stock. Input: jsonb array of { product_id, variation_id?, size?, quantity }
-- Returns: jsonb array of issues [{ product_id, variation_id, requested, available, name }]
CREATE OR REPLACE FUNCTION public.validate_cart_stock(items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  issues jsonb := '[]'::jsonb;
  v_available integer;
  v_name text;
  v_size text;
  v_qty integer;
  v_pid uuid;
  v_vid uuid;
  v_size_entry jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    v_pid := NULLIF(item->>'product_id','')::uuid;
    v_vid := NULLIF(item->>'variation_id','')::uuid;
    v_size := NULLIF(item->>'size','');
    v_qty := COALESCE((item->>'quantity')::int, 1);

    IF v_pid IS NULL THEN
      CONTINUE;
    END IF;

    IF v_vid IS NOT NULL THEN
      -- Variation product
      IF v_size IS NOT NULL THEN
        SELECT pv.size_stock, p.name INTO v_size_entry, v_name
        FROM product_variations pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = v_vid;

        SELECT COALESCE((elem->>'stock')::int, 0) INTO v_available
        FROM jsonb_array_elements(COALESCE(v_size_entry,'[]'::jsonb)) elem
        WHERE elem->>'size' = v_size
        LIMIT 1;

        v_available := COALESCE(v_available, 0);
      ELSE
        SELECT pv.stock, p.name INTO v_available, v_name
        FROM product_variations pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = v_vid;
      END IF;
    ELSE
      SELECT stock, name INTO v_available, v_name
      FROM products WHERE id = v_pid;
    END IF;

    v_available := COALESCE(v_available, 0);

    IF v_available < v_qty THEN
      issues := issues || jsonb_build_object(
        'product_id', v_pid,
        'variation_id', v_vid,
        'size', v_size,
        'name', COALESCE(v_name,'Item'),
        'requested', v_qty,
        'available', v_available
      );
    END IF;
  END LOOP;

  RETURN issues;
END;
$$;

-- Atomic stock decrement after successful order
-- Returns jsonb { ok: bool, issues: [...] }
CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  v_pid uuid;
  v_vid uuid;
  v_size text;
  v_qty integer;
  v_rows integer;
  v_size_stock jsonb;
  v_new_size_stock jsonb;
  v_size_avail integer;
  issues jsonb := '[]'::jsonb;
BEGIN
  -- Lock and validate first
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    v_pid := NULLIF(item->>'product_id','')::uuid;
    v_vid := NULLIF(item->>'variation_id','')::uuid;
    v_size := NULLIF(item->>'size','');
    v_qty := COALESCE((item->>'quantity')::int, 1);

    IF v_pid IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

    IF v_vid IS NOT NULL THEN
      -- Decrement variation row stock atomically
      UPDATE product_variations
      SET stock = stock - v_qty,
          updated_at = now()
      WHERE id = v_vid AND stock >= v_qty;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

      IF v_rows = 0 THEN
        issues := issues || jsonb_build_object('product_id', v_pid, 'variation_id', v_vid, 'reason', 'insufficient_variation_stock');
        CONTINUE;
      END IF;

      -- If size given, decrement that size_stock entry
      IF v_size IS NOT NULL THEN
        SELECT size_stock INTO v_size_stock FROM product_variations WHERE id = v_vid FOR UPDATE;

        SELECT COALESCE((elem->>'stock')::int, 0) INTO v_size_avail
        FROM jsonb_array_elements(COALESCE(v_size_stock,'[]'::jsonb)) elem
        WHERE elem->>'size' = v_size
        LIMIT 1;

        IF COALESCE(v_size_avail, 0) < v_qty THEN
          -- Roll back the variation stock decrement
          UPDATE product_variations SET stock = stock + v_qty WHERE id = v_vid;
          issues := issues || jsonb_build_object('product_id', v_pid, 'variation_id', v_vid, 'size', v_size, 'reason', 'insufficient_size_stock');
          CONTINUE;
        END IF;

        SELECT COALESCE(jsonb_agg(
          CASE WHEN elem->>'size' = v_size
            THEN jsonb_set(elem, '{stock}', to_jsonb(GREATEST(0, (elem->>'stock')::int - v_qty)))
            ELSE elem
          END
        ), '[]'::jsonb) INTO v_new_size_stock
        FROM jsonb_array_elements(COALESCE(v_size_stock,'[]'::jsonb)) elem;

        UPDATE product_variations SET size_stock = v_new_size_stock WHERE id = v_vid;
      END IF;
    ELSE
      UPDATE products
      SET stock = stock - v_qty,
          updated_at = now()
      WHERE id = v_pid AND stock >= v_qty;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

      IF v_rows = 0 THEN
        issues := issues || jsonb_build_object('product_id', v_pid, 'reason', 'insufficient_product_stock');
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', jsonb_array_length(issues) = 0, 'issues', issues);
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_cart_stock(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_for_order(jsonb) TO anon, authenticated, service_role;
