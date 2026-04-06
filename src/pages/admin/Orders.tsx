import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminOrders, updateOrderStatus } from "@/store/slices/adminSlice";
import { Order } from "@/types";
import { toast } from "@/hooks/use-toast";

const statusOptions: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor: Record<Order["status"], string> = {
  pending: "bg-secondary text-muted-foreground",
  processing: "bg-accent/10 text-accent",
  shipped: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminOrders = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      toast({ title: "Order updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Orders</h1>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order {order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase tracking-wider px-3 py-1 ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                  <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v as Order["status"])}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-body">
                    <span>{item.name} ({item.size}ml) × {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
