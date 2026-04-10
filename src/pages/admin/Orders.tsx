import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, User, Package, ChevronRight, ArrowLeft, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminOrders, updateOrderStatus, sendCustomEmail } from "@/store/slices/adminSlice";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types";

const statuses: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor: Record<Order["status"], string> = {
  pending: "bg-yellow-600/20 text-yellow-700 border-yellow-600/30",
  processing: "bg-blue-600/20 text-blue-700 border-blue-600/30",
  shipped: "bg-purple-600/20 text-purple-700 border-purple-600/30",
  delivered: "bg-green-600/20 text-green-700 border-green-600/30",
  cancelled: "bg-red-600/20 text-red-700 border-red-600/30",
};

const AdminOrders = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((s) => s.admin);
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState({ email: "", name: "" });
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => { dispatch(fetchAdminOrders()); }, [dispatch]);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return o.id.toLowerCase().includes(q)
      || o.customerName?.toLowerCase().includes(q)
      || o.customerEmail?.toLowerCase().includes(q)
      || o.customerPhone?.includes(q)
      || o.items.some(i => i.name.toLowerCase().includes(q));
  });

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    try {
      const updated = await dispatch(updateOrderStatus({ id, status })).unwrap();
      toast({ title: `Order status updated to ${status}` });
      if (selectedOrder?.id === id) setSelectedOrder(updated);
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const openEmailDialog = (o: Order) => {
    setEmailTo({ email: o.customerEmail || "", name: o.customerName || "" });
    setEmailForm({ subject: `Regarding your order #${o.id.substring(0, 8).toUpperCase()}`, message: "" });
    setEmailOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      toast({ title: "Subject and message are required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await dispatch(sendCustomEmail({ ...emailTo, ...emailForm })).unwrap();
      toast({ title: "Email sent to " + emailTo.email });
      setEmailOpen(false);
    } catch {
      toast({ title: "Failed to send email", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // ──── Order Detail View ────
  if (selectedOrder) {
    const o = selectedOrder;
    return (
      <div>
        <button
          onClick={() => setSelectedOrder(null)}
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-[11px] font-body font-medium uppercase tracking-[0.15em] mb-6 transition-colors"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" /> Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl tracking-wider">Order #{o.id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">{format(new Date(o.date), "dd MMMM yyyy")}</p>
          </div>
          <Badge variant="outline" className={`text-xs uppercase px-4 py-1.5 ${statusColor[o.status]}`}>{o.status}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Items + Total */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium mb-4 flex items-center gap-2">
                <Package size={14} /> Order Items
              </h3>
              <div className="divide-y divide-border">
                {o.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-body font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground font-body">{item.size}ml × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-body font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between">
                <p className="text-sm font-body font-semibold">Total</p>
                <p className="text-sm font-body font-semibold">₹{o.total.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Status update */}
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium mb-4">Update Status</h3>
              <div className="flex gap-2 flex-wrap">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(o.id, s)}
                    disabled={o.status === s}
                    className={`text-[11px] uppercase tracking-[0.1em] font-body font-medium px-4 py-2 rounded-full border transition-all ${
                      o.status === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Customer info + Actions */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium mb-4">Customer</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-medium">{o.customerName || "—"}</p>
                  </div>
                </div>
                {o.customerEmail && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail size={14} className="text-muted-foreground" />
                    <a href={`mailto:${o.customerEmail}`} className="font-body text-accent hover:underline">{o.customerEmail}</a>
                  </div>
                )}
                {o.customerPhone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone size={14} className="text-muted-foreground" />
                    <a href={`tel:${o.customerPhone}`} className="font-body text-accent hover:underline">{o.customerPhone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium mb-2">Actions</h3>
              {o.customerEmail && (
                <Button variant="outline" className="w-full gap-2 text-xs" onClick={() => openEmailDialog(o)}>
                  <Mail size={14} /> Send Email to Customer
                </Button>
              )}
              {o.customerPhone && (
                <Button variant="outline" className="w-full gap-2 text-xs" asChild>
                  <a href={`https://wa.me/${o.customerPhone.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                    <Phone size={14} /> WhatsApp Customer
                  </a>
                </Button>
              )}
            </div>

            {/* Order meta */}
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium mb-3">Details</h3>
              <div className="space-y-2 text-xs font-body">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono">{o.id.substring(0, 8).toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Full ID</span><span className="font-mono text-[10px] break-all">{o.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{format(new Date(o.date), "dd MMM yyyy")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{o.items.reduce((s, i) => s + i.quantity, 0)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Email dialog */}
        <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl tracking-wider">Send Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <p className="text-sm text-muted-foreground font-body">To: <strong>{emailTo.name}</strong> ({emailTo.email})</p>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Subject</Label>
                <Input value={emailForm.subject} onChange={(e) => setEmailForm(f => ({ ...f, subject: e.target.value }))} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Message</Label>
                <Textarea value={emailForm.message} onChange={(e) => setEmailForm(f => ({ ...f, message: e.target.value }))} rows={5} placeholder="Type your message..." className="rounded-lg resize-none" />
              </div>
              <Button onClick={handleSendEmail} disabled={sending} className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium">
                {sending ? "Sending…" : "Send Email"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ──── Orders List View ────
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl tracking-wider">Orders</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s} className="uppercase">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name, email, phone..."
          className="w-full sm:w-96 h-10 pl-10 pr-10 rounded-lg bg-secondary/60 border border-border text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Orders list — cards (works on all screens) */}
      <div className="space-y-3">
        {loading && !orders.length ? (
          <p className="text-center py-12 text-muted-foreground text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">{search ? "No orders match your search" : "No orders found"}</p>
        ) : filtered.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedOrder(o)}
            className="w-full text-left rounded-xl border border-border bg-card p-4 sm:p-5 hover:border-foreground/20 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">#{o.id.substring(0, 8).toUpperCase()}</span>
                  <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[o.status]}`}>{o.status}</Badge>
                </div>
                <p className="text-sm font-body font-medium mt-1">{o.customerName || "—"}</p>
                {o.customerEmail && <p className="text-[11px] text-muted-foreground font-body">{o.customerEmail}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-body font-semibold">₹{o.total.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-muted-foreground font-body">{format(new Date(o.date), "dd MMM yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-body truncate max-w-[80%]">
                {o.items.map(i => `${i.name} (${i.size}ml)`).join(", ")}
              </p>
              <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
