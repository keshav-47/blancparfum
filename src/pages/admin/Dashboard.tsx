import { useEffect } from "react";
import { IndianRupee, ShoppingCart, Truck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboard } from "@/store/slices/adminSlice";

const statCards = [
  { key: "totalRevenue" as const, label: "Total Revenue", icon: IndianRupee, format: (v: number) => `₹${v.toLocaleString("en-IN")}` },
  { key: "processingOrders" as const, label: "Processing Orders", icon: ShoppingCart, format: (v: number) => String(v) },
  { key: "shippedOrders" as const, label: "Shipped Orders", icon: Truck, format: (v: number) => String(v) },
  { key: "pendingCustomRequests" as const, label: "Pending Custom Requests", icon: Sparkles, format: (v: number) => String(v) },
];

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { dashboard, loading } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.key} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </span>
                <card.icon size={18} className="text-muted-foreground" />
              </div>
              {loading || !dashboard ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-display text-2xl">{card.format(dashboard[card.key])}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
