import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useAllCategories, buildCategoryTree } from "@/hooks/useCategories";
import AdminVariations from "@/components/AdminVariations";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  category_id: string | null;
  stock: number;
  image_url: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  features: string[] | null;
  is_new: boolean | null;
  is_active: boolean | null;
  avg_rating: number | null;
  review_count: number | null;
  product_type: string | null;
}

// Categories loaded from DB

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  original_price: null as number | null,
  category: "",
  category_id: null as string | null,
  stock: 0,
  image_url: "",
  images: [] as string[],
  colors: ["Black"],
  sizes: ["Standard"],
  features: [] as string[],
  is_new: false,
  is_active: true,
  product_type: "simple" as "simple" | "variation",
};

export default function AdminProducts() {
  const { data: dbCategories } = useAllCategories();
  const categoryTree = dbCategories ? buildCategoryTree(dbCategories) : [];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Comma-separated helpers
  const [colorsStr, setColorsStr] = useState("Black");
  const [sizesStr, setSizesStr] = useState("Standard");
  const [featuresStr, setFeaturesStr] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data || []) as Product[]);
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      toast.error("Image upload failed");
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setForm(prev => ({ ...prev, image_url: url }));
    setUploading(false);
  };

  const handleGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploading(false);
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price,
      category: product.category,
      category_id: product.category_id || null,
      stock: product.stock,
      image_url: product.image_url || "",
      images: product.images || [],
      colors: product.colors || ["Black"],
      sizes: product.sizes || ["Standard"],
      features: product.features || [],
      is_new: product.is_new || false,
      is_active: product.is_active !== false,
      product_type: (product.product_type as "simple" | "variation") || "simple",
    });
    setColorsStr((product.colors || ["Black"]).join(", "));
    setSizesStr((product.sizes || ["Standard"]).join(", "));
    setFeaturesStr((product.features || []).join(", "));
    setShowForm(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setColorsStr("Black");
    setSizesStr("Standard");
    setFeaturesStr("");
    setShowForm(true);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const slug = form.slug || generateSlug(form.name);
    const isVariation = form.product_type === "variation";
    const payload = {
      name: form.name,
      slug,
      description: form.description || null,
      price: form.price,
      original_price: form.original_price || null,
      category: form.category,
      category_id: form.category_id || null,
      stock: isVariation ? 0 : form.stock,
      image_url: form.image_url || null,
      images: form.images.length > 0 ? form.images : [],
      colors: isVariation ? [] : colorsStr.split(",").map(s => s.trim()).filter(Boolean),
      sizes: isVariation ? [] : sizesStr.split(",").map(s => s.trim()).filter(Boolean),
      features: featuresStr.split(",").map(s => s.trim()).filter(Boolean),
      is_new: form.is_new,
      is_active: form.is_active,
      product_type: form.product_type,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast.error("Update failed: " + error.message);
      else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error("Create failed: " + error.message);
      else toast.success("Product created!");
    }
    setSaving(false);
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Deleted"); fetchProducts(); }
  };

  if (loading) return <p className="text-center py-8 font-body text-muted-foreground">Loading products...</p>;

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{editingId ? "Edit Product" : "Add New Product"}</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
          {/* Product Type Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-2 block">Product Type *</label>
            <div className="flex gap-2">
              {(["simple", "variation"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, product_type: t }))}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded border text-sm font-body capitalize transition-colors ${
                    form.product_type === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-secondary"
                  }`}
                >
                  {t} Product
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              {form.product_type === "simple"
                ? "Single SKU with one image, price, and stock."
                : "Manage colors, sizes, images, stock and pricing per variation below."}
            </p>
          </div>

          {/* Main / Default Image */}
          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-2 block">
              Default Image {form.product_type === "variation" && "(auto-set from default variation)"}
            </label>
            <div className="flex items-center gap-4">
              {form.image_url ? (
                <img src={form.image_url} alt="Main" className="w-20 h-20 object-cover rounded border border-border" />
              ) : (
                <div className="w-20 h-20 bg-secondary rounded border border-border flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
                <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {/* Gallery — simple only */}
          {form.product_type === "simple" && (
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-2 block">Gallery Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-16 h-16 object-cover rounded border border-border" />
                    <button
                      onClick={() => removeGalleryImage(i)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
              </div>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImages} />
              <Button variant="outline" size="sm" disabled={uploading} onClick={() => galleryInputRef.current?.click()}>
                <Plus className="h-3 w-3 mr-1" /> Add Images
              </Button>
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Product Name *</label>
              <Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))} placeholder="e.g. Premium Silk Hijab" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Slug</label>
              <Input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="auto-generated" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Description</label>
            <Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
          </div>

          {/* Price/Stock/Category */}
          <div className={`grid grid-cols-2 ${form.product_type === "simple" ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-4`}>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
                {form.product_type === "variation" ? "Base Price (₹) *" : "Price (₹) *"}
              </label>
              <Input type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Original Price</label>
              <Input type="number" value={form.original_price || ""} onChange={e => setForm(prev => ({ ...prev, original_price: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            {form.product_type === "simple" && (
              <div>
                <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Stock</label>
                <Input type="number" value={form.stock} onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))} />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Category</label>
              <select
                className="w-full h-9 border border-border rounded px-3 text-sm font-body bg-background"
                value={form.category_id || ""}
                onChange={e => {
                  const catId = e.target.value || null;
                  const cat = dbCategories?.find(c => c.id === catId);
                  setForm(prev => ({
                    ...prev,
                    category_id: catId,
                    category: cat?.name || prev.category,
                  }));
                }}
              >
                <option value="">— Select Category —</option>
                {categoryTree.map(parent => (
                  <optgroup key={parent.id} label={parent.name}>
                    <option value={parent.id}>{parent.name}</option>
                    {parent.children.map(child => (
                      <option key={child.id} value={child.id}>
                        &nbsp;&nbsp;↳ {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Colors / Sizes — simple only. Features always */}
          {form.product_type === "simple" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Colors (comma separated)</label>
                <Input value={colorsStr} onChange={e => setColorsStr(e.target.value)} placeholder="Black, White, Beige" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Sizes (comma separated)</label>
                <Input value={sizesStr} onChange={e => setSizesStr(e.target.value)} placeholder="Standard, Large" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Features (comma separated)</label>
                <Input value={featuresStr} onChange={e => setFeaturesStr(e.target.value)} placeholder="Premium, Breathable" />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">Features (comma separated)</label>
              <Input value={featuresStr} onChange={e => setFeaturesStr(e.target.value)} placeholder="Premium, Breathable" />
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_new} onChange={e => setForm(prev => ({ ...prev, is_new: e.target.checked }))} className="rounded" />
              Mark as New
            </label>
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} className="rounded" />
              Active (visible in store)
            </label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
          </Button>
        </div>

        {editingId && form.product_type === "variation" && <AdminVariations productId={editingId} />}
        {!editingId && form.product_type === "variation" && (
          <p className="text-xs text-muted-foreground font-body text-center border border-dashed border-border rounded-lg p-4">
            Save the product first, then add color variations here.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Products ({products.length})</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3 w-3 mr-1" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-center py-8 font-body text-muted-foreground">No products yet. Add your first product!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-square bg-secondary relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                {!product.is_active && (
                  <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Inactive</span>
                )}
                {product.is_new && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="font-body text-sm font-medium truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm font-bold">₹{product.price}</span>
                  {product.original_price && (
                    <span className="font-body text-xs text-muted-foreground line-through">₹{product.original_price}</span>
                  )}
                </div>
                <p className="font-body text-xs text-muted-foreground">{product.category} • Stock: {product.stock}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openEdit(product)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
