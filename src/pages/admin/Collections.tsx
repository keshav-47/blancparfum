import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionImage,
  fetchAdminProducts,
} from "@/store/slices/adminSlice";
import { Collection } from "@/types";
import { useToast } from "@/hooks/use-toast";

const emptyForm = { name: "", description: "", productIds: [] as string[] };

const AdminCollections = () => {
  const dispatch = useAppDispatch();
  const { collections, products, loading } = useAppSelector((s) => s.admin);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminCollections());
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setProductSearch(""); setOpen(true); };

  const openEdit = (c: Collection) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description ?? "", productIds: c.productIds });
    setProductSearch("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await dispatch(updateCollection({ id: editingId, ...form })).unwrap();
        toast({ title: "Collection updated" });
      } else {
        await dispatch(createCollection(form)).unwrap();
        toast({ title: "Collection created" });
      }
      setOpen(false);
    } catch {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    await dispatch(deleteCollection(id));
    toast({ title: "Collection deleted" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    try {
      await dispatch(uploadCollectionImage({ id: uploadingId, file })).unwrap();
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleProduct = (id: string) =>
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl tracking-wider">Collections</h1>
        <Button onClick={openCreate} className="gap-2"><Plus size={16} /> Create Collection</Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider w-16">Image</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Description</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Products</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !collections.length ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : collections.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No collections yet</TableCell></TableRow>
            ) : collections.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                      <Package size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">{c.description || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{c.productIds.length} products</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setUploadingId(c.id); fileInputRef.current?.click(); }}>
                      <Upload size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">{editingId ? "Edit Collection" : "Create Collection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">Products ({form.productIds.length} selected)</Label>
              <Input
                placeholder="Search products…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="text-sm"
              />
              <div className="border border-border rounded-md max-h-48 overflow-y-auto divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No products found</p>
                ) : filteredProducts.map((p) => {
                  const selected = form.productIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-secondary/50 ${selected ? "bg-secondary" : ""}`}
                    >
                      <span className="truncate">{p.name}</span>
                      {selected ? (
                        <X size={12} className="shrink-0 text-muted-foreground" />
                      ) : (
                        <Plus size={12} className="shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full">{editingId ? "Update Collection" : "Create Collection"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCollections;
