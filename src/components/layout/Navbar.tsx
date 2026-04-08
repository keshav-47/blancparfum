import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import logo from "@/assets/blanc-logo.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Bounce cart badge when count changes
  const [cartBounce, setCartBounce] = useState(false);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  const navLinks = [
    { to: "/shop", label: "Shop" },
    { to: "/custom", label: "Bespoke" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[11px] font-body font-medium uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground/70 hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} alt="BLANC" className="h-10 md:h-12 w-auto" />
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-6">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-body font-medium text-foreground/60 hover:text-foreground transition-colors border border-border/60 rounded-full px-3 py-1"
            >
              <Shield size={11} />
              Admin
            </Link>
          )}
          <Link to={isAuthenticated ? "/profile" : "/login"} className="text-foreground/60 hover:text-foreground transition-colors duration-300">
            <User size={18} strokeWidth={1.5} />
          </Link>
          <Link to="/cart" className="relative text-foreground/60 hover:text-foreground transition-colors duration-300">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={cartBounce ? { scale: 1.8 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[9px] font-body font-semibold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="flex flex-col items-center gap-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-body font-medium uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-body font-medium uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
