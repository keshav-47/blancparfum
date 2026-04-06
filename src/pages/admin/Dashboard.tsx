import { useEffect } from "react";
import { IndianRupee, Package, Truck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboard } from "@/store/slices/adminSlice";

const statCards = [
  { key: "totalRevenue" as const, label: "Total Revenue", icon: IndianRupee, format: (v: number) => `₹${v.toLocaleString("en-IN")}` },
  { key: "processingOrders" as const, label: "Processing Orders", icon: Package, format: (v: number) => String(v) },
  { key: "shippedOrders" as const, label: "Shipped Orders", icon: Truck, format: (v: number) => String(v) },
  { key: "pendingCustomRequests" as const, label: "Pending Custom Requests", icon: Sparkles, format: (v: number) => String(v) },
];

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { dashboard, loading } = useAppSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wider mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.key} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.15em] font-body text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon size={18} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl tracking-wide">
                {loading ? "…" : dashboard ? card.format(dashboard[card.key]) : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
