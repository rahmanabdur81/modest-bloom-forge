-- Add product_type to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'simple';

-- Enrich product_variations
ALTER TABLE public.product_variations
  ADD COLUMN IF NOT EXISTS color_code text,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS size_stock jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Ensure only one default variation per product
CREATE UNIQUE INDEX IF NOT EXISTS product_variations_one_default_per_product
  ON public.product_variations (product_id)
  WHERE is_default = true;