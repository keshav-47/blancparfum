import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Sparkles, ArrowLeft, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/custom-requests", label: "Custom Requests", icon: Sparkles },
];

const AdminLayout = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-0.5">Blanc Parfum</p>
          <h2 className="font-display text-base tracking-wider">Admin Panel</h2>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 text-[11px] uppercase tracking-[0.12em] font-body transition-colors relative",
                  isActive
                    ? "text-foreground bg-secondary before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-foreground before:rounded-r"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-body"
          >
            <ArrowLeft size={12} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
