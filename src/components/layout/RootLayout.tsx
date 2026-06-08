import { useState, useEffect } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AssistantChat from "@/components/home/AssistantChat";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { openChat } from "@/store/slices/assistantSlice";

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
  const dispatch = useAppDispatch();
  const [showTop, setShowTop] = useState(false);
  const chatOpen = useAppSelector((s) => s.assistant.open);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip">
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

      {/* Back-to-top + concierge launcher — same light theme, side by side, appear together */}
      <AnimatePresence>
        {showTop && !chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-6 right-6 z-[70] flex items-center gap-3"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="w-12 h-12 rounded-full bg-white text-foreground border border-border flex items-center justify-center shadow-lg hover:bg-secondary transition-colors"
            >
              <ArrowUp size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => dispatch(openChat())}
              aria-label="Ask the scent concierge"
              className="flex items-center gap-2.5 h-12 pl-3 pr-4 sm:pr-5 rounded-full bg-white text-foreground border border-border shadow-lg hover:bg-secondary transition-colors"
            >
              <img src="/favicon.png" alt="BLANC" className="h-7 w-7 object-contain" />
              <span className="hidden sm:inline text-[11px] font-body font-medium uppercase tracking-[0.18em]">Ask concierge</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen concierge chat (global, any page) */}
      <AnimatePresence>{chatOpen && <AssistantChat key="global-chat" />}</AnimatePresence>
    </div>
  );
};

export default RootLayout;
