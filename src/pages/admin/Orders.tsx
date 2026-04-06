import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminOrders, updateOrderStatus } from "@/store/slices/adminSlice";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl tracking-wider">Orders</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="uppercase">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Order ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Items</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Total</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Update</TableHead>
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
                <TableCell className="text-sm">{format(new Date(o.date), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-sm">{o.customerName || "—"}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {o.items.map((i) => `${i.name} (${i.size}ml × ${i.quantity})`).join(", ")}
                </TableCell>
                <TableCell className="font-medium">₹{o.total.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[o.status]}`}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as Order["status"])}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="uppercase text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrders;
