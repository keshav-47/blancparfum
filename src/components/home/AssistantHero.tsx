import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitMessage } from "@/store/slices/assistantSlice";
import AssistantMessageList from "./AssistantMessageList";
import AssistantProductResults from "./AssistantProductResults";
import AssistantActionBar from "./AssistantActionBar";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "loading") return;
    setInput("");
    dispatch(submitMessage(t));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, status]);

  const started = messages.length > 0;

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 pt-24 pb-14 overflow-hidden">
      {/* Soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-accent/10 blur-[130px]" />

      <div className="relative w-full max-w-2xl mx-auto text-center">
        {!started && (
          <>
            <p className="text-[11px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-4">Your Scent Concierge</p>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-4">Find your signature</h1>
            <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
              Describe a mood, a memory, or a scent you love — I'll find it in our collection.
            </p>
          </>
        )}

        {started && (
          <div className="text-left mb-6 max-h-[48vh] overflow-y-auto scrollbar-hide pr-1">
            <AssistantMessageList />
            <AssistantProductResults />
            <AssistantActionBar />
            <div ref={bottomRef} />
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. a smoky oud for winter evenings"
            disabled={status === "loading"}
            aria-label="Describe the scent you want"
            className="h-14 rounded-full pl-6 pr-14 text-sm bg-background/80 backdrop-blur border-border"
          />
          <button
            type="submit"
            disabled={status === "loading" || !input.trim()}
            aria-label="Send"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center transition-opacity disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>

        {!started && (
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
        )}
      </div>
    </section>
  );
};

export default AssistantHero;
