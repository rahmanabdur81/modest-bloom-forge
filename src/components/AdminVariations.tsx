import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Image as ImageIcon, Pencil, X, Check, Star } from "lucide-react";
import {
  useProductVariations,
  useSaveVariation,
  useDeleteVariation,
  type ProductVariation,
  type VariationSize,
} from "@/hooks/useProductVariations";

type Draft = {
  id?: string;
  color: string;
  color_code: string;
  image_url: string;
  images: string[];
  stock: number;
  price: string;
  sku: string;
  sort_order: number;
  is_default: boolean;
  size_stock: VariationSize[];
};

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const emptyDraft = (): Draft => ({
  color: "",
  color_code: "#000000",
  image_url: "",
  images: [],
  stock: 0,
  price: "",
  sku: "",
  sort_order: 0,
  is_default: false,
  size_stock: [],
});

export default function AdminVariations({ productId }: { productId: string }) {
  const { data: variations = [], isLoading } = useProductVariations(productId);
  const saveMut = useSaveVariation(productId);
  const delMut = useDeleteVariation(productId);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const mainRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `variations/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      toast.error("Upload failed");
      return null;
    }
    return supabase.storage.from("product-images").getPublicUrl(fileName).data.publicUrl;
  };

  const handleMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !draft) return;
    setUploading(true);
    const url = await uploadImage(f);
    if (url) {
      setDraft({
        ...draft,
        image_url: url,
        images: draft.images.length ? draft.images : [url],
      });
    }
    setUploading(false);
  };

  const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !draft) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const u = await uploadImage(f);
      if (u) urls.push(u);
    }
    setDraft({
      ...draft,
      images: [...draft.images, ...urls],
      image_url: draft.image_url || urls[0] || "",
    });
    setUploading(false);
  };

  const toggleSize = (size: string) => {
    if (!draft) return;
    const exists = draft.size_stock.find((s) => s.size === size);
    if (exists) {
      setDraft({ ...draft, size_stock: draft.size_stock.filter((s) => s.size !== size) });
    } else {
      setDraft({ ...draft, size_stock: [...draft.size_stock, { size, stock: 0 }] });
    }
  };

  const setSizeStock = (size: string, stock: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      size_stock: draft.size_stock.map((s) => (s.size === size ? { ...s, stock } : s)),
    });
  };

  const startEdit = (v: ProductVariation) => {
    setDraft({
      id: v.id,
      color: v.color,
      color_code: v.color_code ?? "#000000",
      image_url: v.image_url,
      images: v.images ?? [],
      stock: v.stock,
      price: v.price?.toString() ?? "",
      sku: v.sku ?? "",
      sort_order: v.sort_order,
      is_default: v.is_default ?? false,
      size_stock: v.size_stock ?? [],
    });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.color.trim() || !draft.image_url) {
      toast.error("Color name and main image are required");
      return;
    }
    try {
      // Auto-default if it's the first variation
      const shouldBeDefault = draft.is_default || (!draft.id && variations.length === 0);
      await saveMut.mutateAsync({
        id: draft.id,
        color: draft.color.trim(),
        color_code: draft.color_code || null,
        image_url: draft.image_url,
        images: draft.images,
        stock: Number(draft.stock) || 0,
        price: draft.price ? Number(draft.price) : null,
        sku: draft.sku || null,
        sort_order: Number(draft.sort_order) || 0,
        is_default: shouldBeDefault,
        size_stock: draft.size_stock,
      });

      // Sync product default image when marking default
      if (shouldBeDefault) {
        await supabase.from("products").update({ image_url: draft.image_url }).eq("id", productId);
      }
      toast.success(draft.id ? "Variation updated" : "Variation added");
      setDraft(null);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  const setDefault = async (v: ProductVariation) => {
    try {
      await supabase
        .from("product_variations")
        .update({ is_default: false })
        .eq("product_id", productId);
      await supabase
        .from("product_variations")
        .update({ is_default: true })
        .eq("id", v.id);
      await supabase.from("products").update({ image_url: v.image_url }).eq("id", productId);
      toast.success(`${v.color} set as default`);
      // refresh
      saveMut.reset();
      delMut.reset();
      // Invalidate query
      window.dispatchEvent(new Event("variations-changed"));
      location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this variation?")) return;
    try {
      await delMut.mutateAsync(id);
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold">Color Variations</h3>
          <p className="text-xs text-muted-foreground font-body">
            Each color: images, sizes with stock, price & default flag
          </p>
        </div>
        {!draft && (
          <Button size="sm" onClick={() => setDraft(emptyDraft())}>
            <Plus className="h-3 w-3 mr-1" /> Add Variation
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground font-body">Loading…</p>
      ) : variations.length === 0 && !draft ? (
        <p className="text-xs text-muted-foreground font-body">No variations yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {variations.map((v) => (
            <div key={v.id} className="border border-border rounded p-2 space-y-1 relative">
              {v.is_default && (
                <span className="absolute top-1 left-1 z-10 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                  <Star className="h-2 w-2 fill-current" /> Default
                </span>
              )}
              <img src={v.image_url} alt={v.color} className="w-full aspect-square object-cover rounded" />
              <div className="flex items-center gap-1">
                {v.color_code && (
                  <span
                    className="w-3 h-3 rounded-full border border-border shrink-0"
                    style={{ background: v.color_code }}
                  />
                )}
                <p className="font-body text-xs font-semibold truncate">{v.color}</p>
              </div>
              <p className="font-body text-[10px] text-muted-foreground">
                Stock: {v.stock}{v.price ? ` • ₹${v.price}` : ""}
              </p>
              {v.size_stock?.length > 0 && (
                <p className="font-body text-[10px] text-muted-foreground truncate">
                  Sizes: {v.size_stock.map((s) => `${s.size}(${s.stock})`).join(", ")}
                </p>
              )}
              <div className="flex gap-1">
                {!v.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px]"
                    title="Set as default"
                    onClick={() => setDefault(v)}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => startEdit(v)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] text-destructive" onClick={() => remove(v.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="border border-border rounded p-3 space-y-3 bg-background">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-semibold">{draft.id ? "Edit" : "New"} Variation</p>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
                Color Name *
              </label>
              <Input value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} placeholder="Red" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
                Color Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.color_code}
                  onChange={(e) => setDraft({ ...draft, color_code: e.target.value })}
                  className="h-9 w-12 rounded border border-border cursor-pointer bg-background"
                />
                <Input
                  value={draft.color_code}
                  onChange={(e) => setDraft({ ...draft, color_code: e.target.value })}
                  placeholder="#FF0000"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">SKU</label>
              <Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} placeholder="optional" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Total Stock</label>
              <Input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
                Price Override (₹)
              </label>
              <Input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                placeholder="leave blank to use product price"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Sort Order</label>
              <Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-2 block">
              Sizes (select & set stock)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_SIZES.map((s) => {
                const active = !!draft.size_stock.find((x) => x.size === s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-3 py-1 rounded border text-xs font-body transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {draft.size_stock.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {draft.size_stock.map((s) => (
                  <div key={s.size} className="flex items-center gap-2 border border-border rounded px-2 py-1">
                    <span className="font-body text-xs font-semibold w-8">{s.size}</span>
                    <Input
                      type="number"
                      value={s.stock}
                      onChange={(e) => setSizeStock(s.size, Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={draft.is_default}
              onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
              className="rounded"
            />
            Set as default variation (image shown in shop listing)
          </label>

          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Main Image *</label>
            <div className="flex items-center gap-3">
              {draft.image_url ? (
                <img src={draft.image_url} alt="" className="w-16 h-16 rounded object-cover border border-border" />
              ) : (
                <div className="w-16 h-16 rounded border border-border bg-secondary flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <input ref={mainRef} type="file" accept="image/*" hidden onChange={handleMain} />
              <Button variant="outline" size="sm" disabled={uploading} onClick={() => mainRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1" /> {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
              Gallery Images (click to set as main)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {draft.images.map((u, i) => (
                <div key={i} className="relative group">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, image_url: u })}
                    className={`block rounded overflow-hidden border-2 ${
                      draft.image_url === u ? "border-primary" : "border-border"
                    }`}
                    title={draft.image_url === u ? "Main image" : "Click to set as main"}
                  >
                    <img src={u} alt="" className="w-14 h-14 object-cover" />
                  </button>
                  <button
                    onClick={() => setDraft({ ...draft, images: draft.images.filter((_, j) => j !== i) })}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 text-[10px] flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={handleGallery} />
            <Button variant="outline" size="sm" disabled={uploading} onClick={() => galleryRef.current?.click()}>
              <Plus className="h-3 w-3 mr-1" /> Add Images
            </Button>
          </div>

          <Button onClick={save} disabled={saveMut.isPending} className="w-full sm:w-auto">
            <Check className="h-3 w-3 mr-1" /> {saveMut.isPending ? "Saving…" : "Save Variation"}
          </Button>
        </div>
      )}
    </div>
  );
}
