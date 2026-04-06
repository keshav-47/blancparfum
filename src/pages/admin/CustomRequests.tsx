import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminCustomRequests, updateCustomRequestStatus } from "@/store/slices/adminSlice";
import { CustomRequest } from "@/types";
import { toast } from "@/hooks/use-toast";

const statusOptions: CustomRequest["status"][] = ["pending", "in_progress", "completed", "cancelled"];

const statusColor: Record<CustomRequest["status"], string> = {
  pending: "bg-secondary text-muted-foreground",
  in_progress: "bg-accent/10 text-accent",
  completed: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminCustomRequests = () => {
  const dispatch = useAppDispatch();
  const { customRequests, loading } = useAppSelector((s) => s.admin);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    dispatch(fetchAdminCustomRequests());
  }, [dispatch]);

  const handleStatusChange = async (id: string, status: CustomRequest["status"]) => {
    try {
      await dispatch(updateCustomRequestStatus({ id, status })).unwrap();
      toast({ title: "Request updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const openNotesDialog = (req: CustomRequest) => {
    setSelectedRequest(req);
    setAdminNotes(req.notes || "");
    setNotesDialogOpen(true);
  };

  const saveNotes = async () => {
    if (!selectedRequest) return;
    try {
      await dispatch(updateCustomRequestStatus({ id: selectedRequest.id, status: selectedRequest.status, notes: adminNotes })).unwrap();
      toast({ title: "Notes saved" });
      setNotesDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save notes", variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Custom Requests</h1>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : customRequests.length === 0 ? (
        <p className="text-muted-foreground">No custom requests found.</p>
      ) : (
        <div className="space-y-4">
          {customRequests.map((req) => (
            <div key={req.id} className="border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{req.date}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 ${statusColor[req.status]}`}>
                      {req.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={req.status} onValueChange={(v) => handleStatusChange(req.id, v as CustomRequest["status"])}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => openNotesDialog(req)} className="text-xs">
                    Notes
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm font-body">
                <div>
                  <span className="text-muted-foreground">Scent Families: </span>
                  {req.scentFamilies.join(", ")}
                </div>
                <div>
                  <span className="text-muted-foreground">Occasion: </span>
                  {req.occasion}
                </div>
                <div>
                  <span className="text-muted-foreground">Intensity: </span>
                  {req.intensity}
                </div>
              </div>
              {req.message && (
                <p className="text-sm mt-3 text-muted-foreground italic font-body">"{req.message}"</p>
              )}
              {req.notes && (
                <p className="text-sm mt-2 font-body border-t border-border pt-2">
                  <span className="text-muted-foreground">Admin Notes: </span>{req.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Admin Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={5}
            placeholder="Add notes about this custom request..."
          />
          <Button onClick={saveNotes} className="rounded-none uppercase tracking-widest text-xs">
            Save Notes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomRequests;
