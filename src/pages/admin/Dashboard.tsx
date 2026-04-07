import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, Package, Truck, Sparkles, Layers, ArrowRight, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboard, fetchAdminOrders } from "@/store/slices/adminSlice";
import { format } from "date-fns";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  processing: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  shipped:    "bg-violet-500/15 text-violet-600 border-violet-500/30",
  delivered:  "bg-green-500/15 text-green-600 border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-600 border-red-500/30",
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { dashboard, orders, loading } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    {
      key: "totalRevenue" as const,
      label: "Total Revenue",
      icon: IndianRupee,
      accent: "border-l-green-500",
      iconBg: "bg-green-500/10 text-green-600",
      format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    },
    {
      key: "processingOrders" as const,
      label: "Processing Orders",
      icon: Package,
      accent: "border-l-blue-500",
      iconBg: "bg-blue-500/10 text-blue-600",
      format: (v: number) => String(v),
    },
    {
      key: "shippedOrders" as const,
      label: "Shipped Orders",
      icon: Truck,
      accent: "border-l-violet-500",
      iconBg: "bg-violet-500/10 text-violet-600",
      format: (v: number) => String(v),
    },
    {
      key: "pendingCustomRequests" as const,
      label: "Pending Requests",
      icon: Sparkles,
      accent: "border-l-amber-500",
      iconBg: "bg-amber-500/10 text-amber-600",
      format: (v: number) => String(v),
    },
  ];

  const quickLinks = [
    { to: "/admin/products", label: "Products", icon: Package, desc: "Manage catalogue" },
    { to: "/admin/collections", label: "Collections", icon: Layers, desc: "Curate collections" },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart, desc: "Fulfil orders" },
    { to: "/admin/custom-requests", label: "Custom Requests", icon: Sparkles, desc: "Bespoke requests" },
  ];

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
        <h1 className="font-display text-3xl tracking-wider">{greeting()}</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => (
          <Card
            key={card.key}
            className={`border-l-4 ${card.accent} bg-card rounded-lg shadow-none`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
              <CardTitle className="text-[10px] uppercase tracking-[0.18em] font-body text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${card.iconBg}`}>
                <card.icon size={15} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="font-display text-3xl tracking-wide">
                {loading ? (
                  <span className="text-muted-foreground animate-pulse">—</span>
                ) : dashboard ? (
                  card.format(dashboard[card.key])
                ) : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-secondary/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <link.icon size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                <div>
                  <p className="text-xs font-body uppercase tracking-wider leading-none">{link.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{link.desc}</p>
                </div>
              </div>
              <ArrowRight size={13} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors font-body flex items-center gap-1"
          >
            View all <ArrowRight size={10} />
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {loading && !recentOrders.length ? (
            <div className="py-10 text-center text-xs text-muted-foreground">Loading…</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">No orders yet</div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-body font-normal">Order</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-body font-normal">Customer</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-body font-normal">Date</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-body font-normal">Total</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-body font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{o.id.substring(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-3 text-sm">{o.customerName || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(o.date), "dd MMM yyyy")}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">₹{o.total.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[o.status] ?? ""}`}>
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {recentOrders.map((o) => (
                  <div key={o.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">#{o.id.substring(0, 8).toUpperCase()}</span>
                      <Badge variant="outline" className={`text-[10px] uppercase ${statusColor[o.status] ?? ""}`}>
                        {o.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-body">{o.customerName || "—"}</span>
                      <span className="text-sm font-body font-medium">₹{o.total.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-body">{format(new Date(o.date), "dd MMM yyyy")}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
