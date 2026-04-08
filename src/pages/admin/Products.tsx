import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from "@/store/slices/adminSlice";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";

type NoteType = "top" | "heart" | "base";
interface NoteEntry { type: NoteType; name: string }
interface SizeEntry { ml: number; price: number; stockQuantity: number }

const emptyForm = {
  name: "", tagline: "", category: "men" as Product["category"],
  description: "", stockQuantity: 0, isNew: false, isFeatured: false, isActive: true,
  sizes: [{ ml: 30, price: 0, stockQuantity: 100 }] as SizeEntry[],
  noteEntries: [{ type: "top" as NoteType, name: "" }] as NoteEntry[],
};

const AdminProducts = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.admin);
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => { dispatch(fetchAdminProducts()); }, [dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    const noteEntries: NoteEntry[] = [
      ...p.notes.top.map((n) => ({ type: "top" as NoteType, name: n })),
      ...p.notes.heart.map((n) => ({ type: "heart" as NoteType, name: n })),
      ...p.notes.base.map((n) => ({ type: "base" as NoteType, name: n })),
    ];
    setForm({
      name: p.name, tagline: p.tagline, category: p.category,
      description: p.description, stockQuantity: p.stockQuantity ?? 0,
      isNew: p.isNew, isFeatured: p.isFeatured, isActive: p.isActive ?? true,
      sizes: p.sizes.length ? p.sizes.map(s => ({ ml: s.ml, price: s.price, stockQuantity: s.stockQuantity ?? 100 })) : [{ ml: 30, price: 0, stockQuantity: 100 }],
      noteEntries: noteEntries.length ? noteEntries : [{ type: "top", name: "" }],
    });
    setExistingImages(p.images ?? []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (i: number) => {
    URL.revokeObjectURL(newImagePreviews[i]);
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    const notes = { top: [] as string[], heart: [] as string[], base: [] as string[] };
    form.noteEntries.forEach((n) => { if (n.name.trim()) notes[n.type].push(n.name.trim()); });

    const payload = {
      name: form.name, tagline: form.tagline, category: form.category,
      description: form.description, stockQuantity: form.stockQuantity,
      isNew: form.isNew, isFeatured: form.isFeatured, isActive: form.isActive,
      sizes: form.sizes.filter((s) => s.ml > 0 && s.price > 0).map(s => ({ ml: s.ml, price: s.price, stockQuantity: s.stockQuantity })),
      notes, images: [], price: Math.min(...form.sizes.map((s) => s.price)),
    };

    try {
      let saved: Product;
      if (editingId) {
        saved = await dispatch(updateProduct({ ...payload, id: editingId } as Product)).unwrap();
      } else {
        saved = await dispatch(createProduct(payload as Omit<Product, "id">)).unwrap();
      }

      for (const file of newImageFiles) {
        await dispatch(uploadProductImage({ id: saved.id, file })).unwrap();
      }

      toast({ title: editingId ? "Product updated" : "Product created" });
      setOpen(false);
    } catch {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await dispatch(deleteProduct(id));
    toast({ title: "Product deleted" });
  };

  const addSize = () => setForm((f) => ({ ...f, sizes: [...f.sizes, { ml: 0, price: 0, stockQuantity: 100 }] }));
  const removeSize = (i: number) => setForm((f) => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const updateSize = (i: number, field: keyof SizeEntry, val: number) =>
    setForm((f) => ({ ...f, sizes: f.sizes.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  const addNote = () => setForm((f) => ({ ...f, noteEntries: [...f.noteEntries, { type: "top", name: "" }] }));
  const removeNote = (i: number) => setForm((f) => ({ ...f, noteEntries: f.noteEntries.filter((_, idx) => idx !== i) }));
  const updateNote = (i: number, field: keyof NoteEntry, val: string) =>
    setForm((f) => ({ ...f, noteEntries: f.noteEntries.map((n, idx) => idx === i ? { ...n, [field]: val } : n) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl tracking-wider">Products</h1>
        <Button onClick={openCreate} className="gap-2"><Plus size={16} /> Create Product</Button>
      </div>

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider w-12">Image</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Stock</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">New</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Featured</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Active</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !products.length ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No products yet</TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center">
                      <ImagePlus size={13} className="text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell><Badge variant="outline" className="uppercase text-[10px]">{p.category}</Badge></TableCell>
                <TableCell>₹{p.sizes.length ? Math.min(...p.sizes.map((s) => s.price)).toLocaleString("en-IN") : p.price.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-xs">
                  {p.sizes.length ? p.sizes.map(s => `${s.ml}ml: ${s.stockQuantity ?? "—"}`).join(", ") : "—"}
                </TableCell>
                <TableCell>{p.isNew ? <Badge className="bg-primary text-primary-foreground text-[10px]">Yes</Badge> : "No"}</TableCell>
                <TableCell>{p.isFeatured ? <Badge className="bg-primary text-primary-foreground text-[10px]">Yes</Badge> : "No"}</TableCell>
                <TableCell>{p.isActive !== false ? <Badge className="bg-green-700 text-white text-[10px]">Active</Badge> : <Badge variant="outline" className="text-[10px]">Inactive</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">{editingId ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">Images</Label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {newImagePreviews.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded overflow-hidden border border-primary/50">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 hover:bg-background"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-16 h-16 rounded border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  <ImagePlus size={16} />
                  <span className="text-[9px] uppercase tracking-wide">Add</span>
                </button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider">Tagline</Label>
                <Input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as Product["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">MEN</SelectItem>
                  <SelectItem value="women">WOMEN</SelectItem>
                  <SelectItem value="unisex">UNISEX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Switch checked={form.isNew} onCheckedChange={(v) => setForm((f) => ({ ...f, isNew: v }))} />
                <Label className="text-xs uppercase tracking-wider">New</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
                <Label className="text-xs uppercase tracking-wider">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                <Label className="text-xs uppercase tracking-wider">Active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider">Sizes & Stock</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSize} className="text-xs gap-1"><Plus size={12} /> Add Size</Button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider px-1">
                <span className="w-20">ML</span>
                <span className="flex-1">Price (₹)</span>
                <span className="w-20">Stock</span>
                <span className="w-8" />
              </div>
              {form.sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="number" placeholder="ml" value={s.ml || ""} onChange={(e) => updateSize(i, "ml", Number(e.target.value))} className="w-20" />
                  <Input type="number" placeholder="₹ Price" value={s.price || ""} onChange={(e) => updateSize(i, "price", Number(e.target.value))} className="flex-1" />
                  <Input type="number" placeholder="Stock" value={s.stockQuantity ?? ""} onChange={(e) => updateSize(i, "stockQuantity", Number(e.target.value))} className="w-20" />
                  {form.sizes.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSize(i)}><X size={14} /></Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider">Scent Notes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addNote} className="text-xs gap-1"><Plus size={12} /> Add Note</Button>
              </div>
              {form.noteEntries.map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={n.type} onValueChange={(v) => updateNote(i, "type", v)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">TOP</SelectItem>
                      <SelectItem value="heart">HEART</SelectItem>
                      <SelectItem value="base">BASE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Note name" value={n.name} onChange={(e) => updateNote(i, "name", e.target.value)} className="flex-1" />
                  {form.noteEntries.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeNote(i)}><X size={14} /></Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} className="w-full">{editingId ? "Update Product" : "Create Product"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
