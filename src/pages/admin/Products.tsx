import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
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
interface SizeEntry { ml: number; price: number }

const emptyForm = {
  name: "", tagline: "", category: "men" as Product["category"],
  description: "", stockQuantity: 0, isNew: false, isFeatured: false, isActive: true,
  sizes: [{ ml: 30, price: 0 }] as SizeEntry[],
  noteEntries: [{ type: "top" as NoteType, name: "" }] as NoteEntry[],
};

const AdminProducts = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.admin);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchAdminProducts()); }, [dispatch]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };

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
      sizes: p.sizes.length ? p.sizes : [{ ml: 30, price: 0 }],
      noteEntries: noteEntries.length ? noteEntries : [{ type: "top", name: "" }],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const notes = { top: [] as string[], heart: [] as string[], base: [] as string[] };
    form.noteEntries.forEach((n) => { if (n.name.trim()) notes[n.type].push(n.name.trim()); });

    const payload = {
      name: form.name, tagline: form.tagline, category: form.category,
      description: form.description, stockQuantity: form.stockQuantity,
      isNew: form.isNew, isFeatured: form.isFeatured, isActive: form.isActive,
      sizes: form.sizes.filter((s) => s.ml > 0 && s.price > 0),
      notes, images: [], price: Math.min(...form.sizes.map((s) => s.price)),
    };

    try {
      if (editingId) {
        await dispatch(updateProduct({ ...payload, id: editingId } as Product)).unwrap();
        toast({ title: "Product updated" });
      } else {
        await dispatch(createProduct(payload as Omit<Product, "id">)).unwrap();
        toast({ title: "Product created" });
      }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    try {
      await dispatch(uploadProductImage({ id: uploadingId, file })).unwrap();
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSize = () => setForm((f) => ({ ...f, sizes: [...f.sizes, { ml: 0, price: 0 }] }));
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

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products yet</TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell><Badge variant="outline" className="uppercase text-[10px]">{p.category}</Badge></TableCell>
                <TableCell>₹{p.sizes.length ? Math.min(...p.sizes.map((s) => s.price)).toLocaleString("en-IN") : p.price.toLocaleString("en-IN")}</TableCell>
                <TableCell>{p.stockQuantity ?? "—"}</TableCell>
                <TableCell>{p.isNew ? <Badge className="bg-primary text-primary-foreground text-[10px]">Yes</Badge> : "No"}</TableCell>
                <TableCell>{p.isFeatured ? <Badge className="bg-primary text-primary-foreground text-[10px]">Yes</Badge> : "No"}</TableCell>
                <TableCell>{p.isActive !== false ? <Badge className="bg-green-700 text-white text-[10px]">Active</Badge> : <Badge variant="outline" className="text-[10px]">Inactive</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setUploadingId(p.id); fileInputRef.current?.click(); }}>
                      <Upload size={14} />
                    </Button>
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
            <div className="grid grid-cols-2 gap-4">
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
                <Label className="text-xs uppercase tracking-wider">Stock Quantity</Label>
                <Input type="number" value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))} />
              </div>
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
                <Label className="text-xs uppercase tracking-wider">Sizes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSize} className="text-xs gap-1"><Plus size={12} /> Add Size</Button>
              </div>
              {form.sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="number" placeholder="ml" value={s.ml || ""} onChange={(e) => updateSize(i, "ml", Number(e.target.value))} className="w-24" />
                  <Input type="number" placeholder="₹ Price" value={s.price || ""} onChange={(e) => updateSize(i, "price", Number(e.target.value))} className="flex-1" />
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
