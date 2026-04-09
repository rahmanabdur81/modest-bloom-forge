import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, ChevronRight, FolderTree, Folder } from "lucide-react";
import {
  useAllCategories,
  buildCategoryTree,
  useCategoryMutations,
  CategoryTree,
} from "@/hooks/useCategories";

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CategoryNode({
  node,
  onDelete,
  depth = 0,
}: {
  node: CategoryTree;
  onDelete: (id: string, name: string) => void;
  depth?: number;
}) {
  return (
    <div>
      <div
        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        <div className="flex items-center gap-2">
          {node.children.length > 0 ? (
            <FolderTree className="h-4 w-4 text-primary" />
          ) : depth > 0 ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={`font-body text-sm ${depth === 0 ? "font-medium" : ""}`}>
            {node.name}
          </span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {node.slug}
          </span>
          {node.children.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              ({node.children.length} sub)
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
          onClick={() => onDelete(node.id, node.name)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {node.children.map((child) => (
        <CategoryNode key={child.id} node={child} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function AdminCategories() {
  const { data: categories, isLoading } = useAllCategories();
  const { createCategory, deleteCategory } = useCategoryMutations();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);

  const tree = categories ? buildCategoryTree(categories) : [];
  const parents = categories?.filter((c) => !c.parent_id) || [];

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    const slug = generateSlug(name);
    try {
      await createCategory.mutateAsync({ name: name.trim(), slug, parent_id: parentId });
      toast.success(`Category "${name}" created`);
      setName("");
      setParentId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete "${catName}"? This will also delete all subcategories.`)) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success(`"${catName}" deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (isLoading) {
    return <p className="text-center py-8 font-body text-muted-foreground">Loading categories...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="font-display text-base font-semibold">Add Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cotton"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-1 block">
              Parent (optional)
            </label>
            <select
              className="w-full h-10 border border-border rounded-md px-3 text-sm font-body bg-background"
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
            >
              <option value="">— None (Top-level) —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleCreate}
              disabled={createCategory.isPending}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              {createCategory.isPending ? "Creating..." : "Add Category"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="font-display text-base font-semibold mb-4">
          Category Tree ({categories?.length || 0})
        </h3>
        {tree.length === 0 ? (
          <p className="text-center py-8 font-body text-sm text-muted-foreground">
            No categories yet. Add your first category above!
          </p>
        ) : (
          <div className="space-y-0.5">
            {tree.map((node) => (
              <CategoryNode key={node.id} node={node} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
