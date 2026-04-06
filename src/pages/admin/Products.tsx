import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct } from "@/store/slices/adminSlice";
import { Product } from "@/types";
import { toast } from "@/hooks/use-toast";

type ProductForm = {
  name: string;
  tagline: string;
  price: number;
  category: "men" | "women" | "unisex";
  images: string[];
  sizes: { ml: number; price: number }[];
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  isNew: boolean;
  isFeatured: boolean;
};

const emptyProduct: ProductForm = {
  name: "",
  tagline: "",
  price: 0,
  category: "unisex",
  images: [""],
  sizes: [{ ml: 30, price: 0 }, { ml: 50, price: 0 }, { ml: 100, price: 0 }],
  description: "",
  notes: { top: [""], heart: [""], base: [""] },
  isNew: false,
  isFeatured: false,
};

const AdminProducts = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.admin);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      tagline: p.tagline,
      price: p.price,
      category: p.category,
      images: p.images.length ? p.images : [""],
      sizes: p.sizes,
      description: p.description,
      notes: {
        top: p.notes.top.length ? p.notes.top : [""],
        heart: p.notes.heart.length ? p.notes.heart : [""],
        base: p.notes.base.length ? p.notes.base : [""],
      },
      isNew: p.isNew,
      isFeatured: p.isFeatured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const cleaned = {
      ...form,
      images: form.images.filter(Boolean),
      notes: {
        top: form.notes.top.filter(Boolean),
        heart: form.notes.heart.filter(Boolean),
        base: form.notes.base.filter(Boolean),
      },
    };

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, ...cleaned } as Product)).unwrap();
        toast({ title: "Product updated" });
      } else {
        await dispatch(createProduct(cleaned)).unwrap();
        toast({ title: "Product created" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast({ title: "Product deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const updateNoteList = (layer: "top" | "heart" | "base", idx: number, value: string) => {
    const arr = [...form.notes[layer]];
    arr[idx] = value;
    setForm({ ...form, notes: { ...form.notes, [layer]: arr } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <Button onClick={openCreate} className="rounded-none uppercase tracking-widest text-xs gap-2">
          <Plus size={14} /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="border border-border">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">Name</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">Category</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">Price</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">Flags</th>
                <th className="text-right p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 capitalize">{p.category}</td>
                  <td className="p-4">₹{p.price}</td>
                  <td className="p-4 space-x-2">
                    {p.isNew && <span className="text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5">New</span>}
                    {p.isFeatured && <span className="text-[10px] uppercase tracking-wider bg-secondary text-foreground px-2 py-0.5">Featured</span>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">Tagline</label>
                <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Product["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">Base Price (₹)</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            {/* Sizes */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-2 block">Sizes</label>
              <div className="grid grid-cols-3 gap-3">
                {form.sizes.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input type="number" placeholder="ml" value={s.ml} onChange={(e) => {
                      const sizes = [...form.sizes];
                      sizes[i] = { ...sizes[i], ml: Number(e.target.value) };
                      setForm({ ...form, sizes });
                    }} className="w-20" />
                    <Input type="number" placeholder="₹" value={s.price} onChange={(e) => {
                      const sizes = [...form.sizes];
                      sizes[i] = { ...sizes[i], price: Number(e.target.value) };
                      setForm({ ...form, sizes });
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {(["top", "heart", "base"] as const).map((layer) => (
              <div key={layer}>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">{layer} Notes</label>
                <div className="flex flex-wrap gap-2">
                  {form.notes[layer].map((n, i) => (
                    <Input
                      key={i}
                      value={n}
                      onChange={(e) => updateNoteList(layer, i, e.target.value)}
                      className="w-32"
                      placeholder={`Note ${i + 1}`}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, notes: { ...form.notes, [layer]: [...form.notes[layer], ""] } })}
                  >
                    <Plus size={12} />
                  </Button>
                </div>
              </div>
            ))}

            {/* Images */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1 block">Image URLs</label>
              <div className="space-y-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={img}
                      onChange={(e) => {
                        const images = [...form.images];
                        images[i] = e.target.value;
                        setForm({ ...form, images });
                      }}
                      placeholder="https://..."
                    />
                    {form.images.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, images: [...form.images, ""] })}>
                  <Plus size={12} className="mr-1" /> Add Image
                </Button>
              </div>
            </div>

            {/* Flags */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm font-body">
                <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
                New
              </label>
              <label className="flex items-center gap-2 text-sm font-body">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured
              </label>
            </div>

            <Button onClick={handleSave} className="w-full rounded-none uppercase tracking-widest text-xs">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
