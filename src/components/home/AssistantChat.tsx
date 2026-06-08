import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X, Sparkles, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitMessage, resetChat, closeChat } from "@/store/slices/assistantSlice";
import AssistantMessageList from "./AssistantMessageList";
import AssistantProductResults from "./AssistantProductResults";
import AssistantActionBar from "./AssistantActionBar";

// Smart-prompt style quick replies (Razorpay RAY-inspired).
const SUGGESTIONS = [
  "Something fresh for summer",
  "A warm oud for evenings",
  "Like Dior Sauvage",
  "A gift under ₹3000",
  "Long-lasting & unisex",
];

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

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "loading") return;
    setInput("");
    dispatch(submitMessage(t));
  };

  // Keep the latest turn / result / action in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, status, lastProductIds, pendingAction]);

  // Focus the input when the concierge opens.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex flex-col bg-background"
    >
      {/* Ambient glow for a livelier surface */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[90vw] h-[45vh] max-w-[760px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[40vw] h-[30vh] max-w-[420px] rounded-full bg-foreground/[0.04] blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center"
          >
            <Sparkles size={14} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </motion.span>
          <div className="leading-tight">
            <p className="font-display text-sm tracking-[0.18em]">BLANC CONCIERGE</p>
            <p className="text-[10px] font-body uppercase tracking-[0.22em] text-muted-foreground">Your scent guide</p>
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
      </header>

      {/* Scrollable conversation */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <AssistantMessageList />
          <AssistantProductResults />
          <AssistantActionBar />
        </div>
      </div>

      {/* Composer */}
      <div className="relative z-10 border-t border-border/60 bg-background/70 backdrop-blur-md px-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 -mx-1 px-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={status === "loading"}
                className="shrink-0 text-[11px] font-body uppercase tracking-[0.1em] px-3.5 py-1.5 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a scent, size, or gift…"
              disabled={status === "loading"}
              aria-label="Message the concierge"
              className="h-14 rounded-full pl-6 pr-14 text-sm bg-secondary/40 border-border focus-visible:ring-1 focus-visible:ring-accent"
            />
            <button
              type="submit"
              disabled={status === "loading" || !input.trim()}
              aria-label="Send"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AssistantChat;
