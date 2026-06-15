import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Send, X, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitMessage, resetChat, closeChat } from "@/store/slices/assistantSlice";
import AssistantMessageList from "./AssistantMessageList";
import AssistantProductResults from "./AssistantProductResults";
import AssistantActionBar from "./AssistantActionBar";
import ConciergeAvatar from "./concierge/ConciergeAvatar";

// Smart-prompt style quick replies (Razorpay RAY-inspired).
const SUGGESTIONS = [
  "Something fresh for summer",
  "A warm oud for evenings",
  "Like Dior Sauvage",
  "A gift under ₹3000",
  "Long-lasting & unisex",
];

// Subtle film grain (inline SVG noise) — adds tactile richness without clutter.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Full-screen conversational concierge. Mounts as a fixed overlay the moment
 * the first message is sent. Owns its own scroll area (data-lenis-prevent so the
 * global Lenis smooth-scroll doesn't swallow the wheel and to lock the page behind).
 */
const AssistantChat = () => {
  const dispatch = useAppDispatch();
  const { messages, status, lastProductIds, pendingAction } = useAppSelector((s) => s.assistant);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasNearBottom = useRef(true);
  const reduce = useReducedMotion();

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "loading") return;
    setInput("");
    wasNearBottom.current = true; // their own send always scrolls to the reply
    dispatch(submitMessage(t));
  };

  // Track whether the user is near the bottom so new turns / results don't yank
  // them down if they scrolled up to re-read earlier messages.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) wasNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  };

  // Pin to the bottom for new turns (smooth) — only when already near the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && wasNearBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, status, lastProductIds, pendingAction]);

  // As the assistant reply streams in word-by-word, keep it pinned — but only if
  // the user is already near the bottom (don't yank them if they scrolled up).
  const onStreamReveal = useCallback(() => {
    const el = scrollRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Focus the input when the concierge opens.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const orb = (className: string, anim: Record<string, number[]>, duration: number) => (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      animate={reduce ? undefined : anim}
      transition={reduce ? undefined : { duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex flex-col bg-background"
    >
      {/* Warm ivory atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[hsl(36_38%_97%)] via-background to-[hsl(30_24%_96%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
      {/* Drifting gold orbs */}
      {orb(
        "-top-24 left-1/2 -translate-x-1/2 w-[80vw] h-[42vh] max-w-[720px] bg-[hsl(36_45%_48%/0.12)] blur-[130px]",
        { x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] },
        16,
      )}
      {orb(
        "bottom-[-10%] right-[-5%] w-[42vw] h-[34vh] max-w-[460px] bg-[hsl(36_45%_55%/0.1)] blur-[120px]",
        { x: [0, -30, 0], y: [0, 24, 0], scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] },
        20,
      )}
      {orb(
        "top-[30%] left-[-8%] w-[34vw] h-[28vh] max-w-[380px] bg-foreground/[0.04] blur-[120px]",
        { x: [0, 26, 0], y: [0, 18, 0], scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] },
        24,
      )}

      {/* Header */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 border-b border-border/50 bg-background/60 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <ConciergeAvatar size={34} showStatus />
          <div className="leading-tight">
            <p className="font-display text-base tracking-[0.16em]">BLANC CONCIERGE</p>
            <span className="mt-0.5 block h-px w-8 bg-accent/60" />
            <p className="mt-1 text-[10px] font-body uppercase tracking-[0.22em] text-muted-foreground">Your scent guide</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(resetChat())}
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full border border-border text-[11px] font-body uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Plus size={13} /> New chat
          </button>
          <button
            onClick={() => dispatch(closeChat())}
            aria-label="Close concierge"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.header>

      {/* Scrollable conversation */}
      <div ref={scrollRef} onScroll={handleScroll} className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <AssistantMessageList onStreamReveal={onStreamReveal} />
          {/* While the concierge is "typing", hide the previous turn's product cards
              and action card — otherwise they dangle below the loading indicator.
              They re-render (fresh) under the new reply once it arrives. */}
          {status !== "loading" && (
            <>
              <AssistantProductResults />
              <AssistantActionBar />
            </>
          )}
        </div>
      </div>

      {/* Composer */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 border-t border-border/50 bg-background/60 backdrop-blur-xl px-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 -mx-1 px-1">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => send(s)}
                disabled={status === "loading"}
                className="shrink-0 text-[11px] font-body uppercase tracking-[0.1em] px-3.5 py-1.5 rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors disabled:opacity-50"
              >
                {s}
              </motion.button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="relative rounded-full transition-shadow focus-within:shadow-[0_0_0_4px_hsl(36_45%_48%/0.14)]"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a scent, size, or gift…"
              disabled={status === "loading"}
              aria-label="Message the concierge"
              className="h-14 rounded-full pl-6 pr-14 text-sm bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-accent"
            />
            <motion.button
              type="submit"
              disabled={status === "loading" || !input.trim()}
              aria-label="Send"
              whileHover={reduce ? undefined : { scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-[0_4px_14px_-4px_hsl(36_45%_48%/0.6)] disabled:opacity-40 disabled:shadow-none"
            >
              {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssistantChat;
