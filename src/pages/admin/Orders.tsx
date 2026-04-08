import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState({ email: "", name: "" });
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => { dispatch(fetchAdminOrders()); }, [dispatch]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      toast({ title: `Order status updated to ${status}` });
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl tracking-wider">Orders</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="uppercase">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Order</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Items</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Total</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !orders.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
            ) : filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{format(new Date(o.date), "dd MMM yyyy")}</TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium flex items-center gap-1"><User size={11} />{o.customerName || "—"}</p>
                    {o.customerEmail && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail size={10} />{o.customerEmail}</p>}
                    {o.customerPhone && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone size={10} />{o.customerPhone}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {o.items.map((i) => `${i.name} (${i.size}ml × ${i.quantity})`).join(", ")}
                </TableCell>
                <TableCell className="font-medium">₹{o.total.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[o.status]}`}>{o.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as Order["status"])}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => <SelectItem key={s} value={s} className="uppercase text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {o.customerEmail && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEmailDialog(o)} title="Send email">
                        <Mail size={14} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && !orders.length ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No orders found</p>
        ) : filtered.map((o) => (
          <div key={o.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">#{o.id.substring(0, 8).toUpperCase()}</span>
              <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[o.status]}`}>{o.status}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1"><User size={12} />{o.customerName || "—"}</p>
              {o.customerEmail && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail size={10} />{o.customerEmail}</p>}
              {o.customerPhone && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone size={10} />{o.customerPhone}</p>}
            </div>
            <p className="text-sm font-medium">₹{o.total.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-muted-foreground">{format(new Date(o.date), "dd MMM yyyy")}</p>
            <div className="flex gap-2">
              <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as Order["status"])}>
                <SelectTrigger className="flex-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s} className="uppercase text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {o.customerEmail && (
                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs" onClick={() => openEmailDialog(o)}>
                  <Mail size={12} /> Email
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Send Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground font-body">
              To: <strong>{emailTo.name}</strong> ({emailTo.email})
            </p>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Subject</Label>
              <Input value={emailForm.subject} onChange={(e) => setEmailForm(f => ({ ...f, subject: e.target.value }))} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Message</Label>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm(f => ({ ...f, message: e.target.value }))}
                rows={5}
                placeholder="Type your message to the customer..."
                className="rounded-lg resize-none"
              />
            </div>
            <Button onClick={handleSendEmail} disabled={sending} className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium">
              {sending ? "Sending…" : "Send Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
