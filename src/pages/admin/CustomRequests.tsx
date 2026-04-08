import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Save, Mail, Phone, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminCustomRequests, updateCustomRequestStatus, sendCustomEmail } from "@/store/slices/adminSlice";
import { useToast } from "@/hooks/use-toast";
import type { CustomRequest } from "@/types";

const statuses: CustomRequest["status"][] = ["pending", "in_progress", "completed", "cancelled"];

const statusColor: Record<CustomRequest["status"], string> = {
  pending: "bg-yellow-600/20 text-yellow-700 border-yellow-600/30",
  in_progress: "bg-blue-600/20 text-blue-700 border-blue-600/30",
  completed: "bg-green-600/20 text-green-700 border-green-600/30",
  cancelled: "bg-red-600/20 text-red-700 border-red-600/30",
};

const AdminCustomRequests = () => {
  const dispatch = useAppDispatch();
  const { customRequests, loading } = useAppSelector((s) => s.admin);
  const { toast } = useToast();
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState({ email: "", name: "" });
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => { dispatch(fetchAdminCustomRequests()); }, [dispatch]);

  useEffect(() => {
    const map: Record<string, string> = {};
    customRequests.forEach((r) => { map[r.id] = r.notes ?? ""; });
    setEditNotes(map);
  }, [customRequests]);

  const handleStatusChange = async (id: string, status: CustomRequest["status"]) => {
    try {
      await dispatch(updateCustomRequestStatus({ id, status, notes: editNotes[id] })).unwrap();
      toast({ title: `Status updated to ${status.replace("_", " ")}` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleSaveNotes = async (r: CustomRequest) => {
    try {
      await dispatch(updateCustomRequestStatus({ id: r.id, status: r.status, notes: editNotes[r.id] })).unwrap();
      toast({ title: "Notes saved" });
    } catch {
      toast({ title: "Failed to save notes", variant: "destructive" });
    }
  };

  const openEmailDialog = (r: CustomRequest) => {
    setEmailTo({ email: r.customerEmail || "", name: r.customerName || "" });
    setEmailForm({ subject: "Regarding your bespoke fragrance request — BLANC PARFUM", message: "" });
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
      <h1 className="font-display text-2xl tracking-wider mb-8">Custom Requests</h1>

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Scent Families</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Occasion</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Intensity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Message</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider min-w-[200px]">Notes & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !customRequests.length ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : customRequests.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No custom requests</TableCell></TableRow>
            ) : customRequests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm whitespace-nowrap">{format(new Date(r.date), "dd MMM yyyy")}</TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium flex items-center gap-1"><User size={11} />{r.customerName || "—"}</p>
                    {r.customerEmail && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail size={10} />{r.customerEmail}</p>}
                    {r.customerPhone && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone size={10} />{r.customerPhone}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {r.scentFamilies.map((f) => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{r.occasion}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] uppercase">{r.intensity}</Badge></TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">{r.message || "—"}</TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v as CustomRequest["status"])}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[r.status]}`}>{r.status.replace("_", " ")}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s} className="uppercase text-xs">{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-start gap-1">
                      <Textarea
                        value={editNotes[r.id] ?? ""}
                        onChange={(e) => setEditNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2} className="text-xs min-w-[160px]" placeholder="Admin notes…"
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleSaveNotes(r)} className="shrink-0 mt-0.5">
                        <Save size={14} />
                      </Button>
                    </div>
                    {r.customerEmail && (
                      <Button variant="outline" size="sm" className="text-xs gap-1 w-full" onClick={() => openEmailDialog(r)}>
                        <Mail size={12} /> Email Customer
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
        {loading && !customRequests.length ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Loading…</p>
        ) : customRequests.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No custom requests</p>
        ) : customRequests.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{format(new Date(r.date), "dd MMM yyyy")}</span>
              <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[r.status]}`}>{r.status.replace("_", " ")}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1"><User size={12} />{r.customerName || "—"}</p>
              {r.customerEmail && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail size={10} />{r.customerEmail}</p>}
              {r.customerPhone && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone size={10} />{r.customerPhone}</p>}
            </div>
            <div className="flex flex-wrap gap-1">
              {r.scentFamilies.map((f) => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
            </div>
            <p className="text-xs text-muted-foreground"><strong>Occasion:</strong> {r.occasion} | <strong>Intensity:</strong> {r.intensity}</p>
            {r.message && <p className="text-xs text-muted-foreground italic">"{r.message}"</p>}
            <div className="flex gap-2">
              <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v as CustomRequest["status"])}>
                <SelectTrigger className="flex-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s} className="uppercase text-xs">{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              {r.customerEmail && (
                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs" onClick={() => openEmailDialog(r)}>
                  <Mail size={12} /> Email
                </Button>
              )}
            </div>
            <div className="flex items-start gap-1">
              <Textarea
                value={editNotes[r.id] ?? ""} onChange={(e) => setEditNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                rows={2} className="text-xs" placeholder="Admin notes…"
              />
              <Button variant="ghost" size="icon" onClick={() => handleSaveNotes(r)} className="shrink-0 mt-0.5">
                <Save size={14} />
              </Button>
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
                value={emailForm.message} onChange={(e) => setEmailForm(f => ({ ...f, message: e.target.value }))}
                rows={5} placeholder="Type your message to the customer..." className="rounded-lg resize-none"
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

export default AdminCustomRequests;
