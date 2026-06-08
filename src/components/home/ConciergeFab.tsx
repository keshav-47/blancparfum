import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openChat } from "@/store/slices/assistantSlice";

/**
 * Persistent concierge launcher, bottom-right on every page. On the home page it
 * fades in once you scroll past the hero concierge (so the concierge "moves" to
 * the corner as it fades); on other routes it's always available. Hidden while
 * the full-screen chat is open.
 */
const ConciergeFab = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.assistant.open);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolledPast(true);
      return;
    }
    const onScroll = () => setScrolledPast(window.scrollY > window.innerHeight * 1.35);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const show = !open && (isHome ? scrolledPast : true);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          onClick={() => dispatch(openChat())}
          aria-label="Ask the scent concierge"
          className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 h-13 sm:h-14 pl-3.5 pr-2 sm:pr-5 rounded-full bg-foreground text-background shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-background/10">
            <Sparkles size={17} />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-background/30 animate-ping" />
          </span>
          <span className="hidden sm:inline text-[11px] font-body font-medium uppercase tracking-[0.18em] pr-1">Ask concierge</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ConciergeFab;
