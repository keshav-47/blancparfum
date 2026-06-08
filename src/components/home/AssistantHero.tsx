import { useState } from "react";
import { Send } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitMessage } from "@/store/slices/assistantSlice";
import AssistantChat from "./AssistantChat";

const EXAMPLES = [
  "Something fresh for summer",
  "A warm woody scent for him",
  "Woody, like Dior Sauvage",
  "A gift under ₹3000",
];

const AssistantHero = () => {
  const dispatch = useAppDispatch();
  const { messages, status } = useAppSelector((s) => s.assistant);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "loading") return;
    setInput("");
    dispatch(submitMessage(t));
  };

  // Once a conversation has started, take over the full screen.
  const active = messages.length > 0;

  return (
    <>
      {/* Resting state — the home hero invites the first prompt. Stays in flow so
          the page layout is stable when the full-screen chat closes. */}
      <section className="relative min-h-[68vh] flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 py-24 md:py-28 overflow-hidden border-t border-border/60">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-accent/10 blur-[130px]" />

        <div className="relative w-full max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-4">Your Scent Concierge</p>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-4">Find your signature</h1>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            Describe a mood, a memory, or a scent you love — I'll find it in our collection.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. a smoky oud for winter evenings"
              disabled={status === "loading"}
              aria-label="Describe the scent you want"
              className="h-14 rounded-full pl-6 pr-14 text-sm bg-background/80 backdrop-blur border-border focus-visible:ring-1 focus-visible:ring-accent"
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

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => send(ex)}
                className="text-[11px] font-body uppercase tracking-[0.12em] px-4 py-2 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Full-screen conversation, mounted on the first prompt. */}
      <AnimatePresence>{active && <AssistantChat key="concierge-chat" />}</AnimatePresence>
    </>
  );
};

export default AssistantHero;
