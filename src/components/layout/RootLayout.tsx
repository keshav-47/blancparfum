import { useState, useEffect } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Persistent shell for all public routes. Navbar and Footer render once and
 * stay mounted, so the header is consistent across every page. Only the routed
 * content (the Outlet) cross-dissolves on navigation.
 *
 * Pure-opacity transition (no transform) so the fixed navbar isn't shifted by a
 * transform-based containing block.
 */
const pageVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

const RootLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 right-4 z-[90] w-10 h-10 rounded-full bg-white text-foreground border border-border flex items-center justify-center shadow-lg hover:bg-secondary transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp size={16} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RootLayout;
