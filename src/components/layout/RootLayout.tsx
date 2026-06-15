import { useState, useEffect } from "react";
import { useOutlet, useLocation, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const outlet = useOutlet();
  const dispatch = useAppDispatch();
  const [showTop, setShowTop] = useState(false);
  const chatOpen = useAppSelector((s) => s.assistant.open);

  // After a sign-in round-trip the Sign in button returns to "?concierge=open";
  // re-open the chat (the conversation is still in Redux — no reload happened)
  // and strip the flag so it doesn't re-fire on later navigations.
  useEffect(() => {
    if (searchParams.get("concierge") === "open") {
      dispatch(openChat());
      const next = new URLSearchParams(searchParams);
      next.delete("concierge");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, dispatch]);
  // Home leads with a full-bleed hero, so the floating header overlays it; every
  // other page needs top room to clear the floating header.
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Shared "floating 3D" surface for the corner buttons (raised, lifts + flips
  // to a dark fill on hover — like the "View all fragrances" button).
  const floatBtn =
    "group bg-white text-foreground border border-border ring-1 ring-inset ring-white/60 shadow-[0_10px_26px_-8px_rgba(0,0,0,0.3),0_3px_8px_-3px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.38)] hover:bg-foreground hover:text-background hover:border-foreground hover:ring-0 transition-all duration-300";

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip">
      <Navbar />
      <main className={`flex-1 ${isHome ? "" : "pt-24"}`}>
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
              className={`w-12 h-12 rounded-full flex items-center justify-center ${floatBtn}`}
            >
              <ArrowUp size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => dispatch(openChat())}
              aria-label="Ask the scent concierge"
              className={`flex items-center gap-2.5 h-12 pl-3 pr-4 sm:pr-5 rounded-full ${floatBtn}`}
            >
              <img src="/favicon.png" alt="BLANC" className="h-7 w-7 object-contain transition duration-300 group-hover:brightness-0 group-hover:invert" />
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
