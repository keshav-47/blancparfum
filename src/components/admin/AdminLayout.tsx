import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Sparkles, ArrowLeft, Layers, Store, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/custom-requests", label: "Requests", icon: Sparkles },
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
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
          onClick={onNavigate}
          className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-body"
        >
          <ArrowLeft size={12} /> Back to Store
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border bg-card flex-col shrink-0">
        <div className="px-6 py-5 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-0.5">Blanc Parfum</p>
          <h2 className="font-display text-base tracking-wider">Admin Panel</h2>
        </div>
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-0.5">Blanc Parfum</p>
                  <h2 className="font-display text-base tracking-wider">Admin Panel</h2>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={18} />
                </button>
              </div>
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="md:hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">Admin</span>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <Store size={14} />
            <span className="hidden sm:inline">Back to Store</span>
          </Link>
        </header>
        <div className="p-4 md:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
