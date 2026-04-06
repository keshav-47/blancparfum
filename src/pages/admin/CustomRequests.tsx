import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminCustomRequests, updateCustomRequestStatus } from "@/store/slices/adminSlice";
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

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wider mb-8">Custom Requests</h1>

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Scent Families</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Occasion</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Intensity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Message</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider min-w-[200px]">Admin Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !customRequests.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : customRequests.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No custom requests</TableCell></TableRow>
            ) : customRequests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm whitespace-nowrap">{format(new Date(r.date), "dd MMM yyyy")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {r.scentFamilies.map((f) => (
                      <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{r.occasion}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] uppercase">{r.intensity}</Badge></TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">{r.message || "—"}</TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v as CustomRequest["status"])}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[r.status]}`}>
                        {r.status.replace("_", " ")}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="uppercase text-xs">{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1">
                    <Textarea
                      value={editNotes[r.id] ?? ""}
                      onChange={(e) => setEditNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      rows={2}
                      className="text-xs min-w-[160px]"
                      placeholder="Admin notes…"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSaveNotes(r)} className="shrink-0 mt-0.5">
                      <Save size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCustomRequests;
