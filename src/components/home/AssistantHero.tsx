import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitMessage } from "@/store/slices/assistantSlice";
import AssistantChat from "./AssistantChat";

const EXAMPLES = [
  "Something fresh for summer",
  "A warm oud for him",
  "Like Dior Sauvage",
  "A gift under ₹3000",
];

// Bottles scattered around the concierge. Each parallax-drifts and, as the
// section scrolls away, gathers downward — toward the scents below. `depth`
// sets peak opacity (far = fainter); `speed` sets parallax travel (px).
const SLOTS = [
  { className: "left-[3%] top-[12%]",      size: "w-28 lg:w-40", rot: -12, speed: 70,  depth: 0.85, blur: "" },
  { className: "right-[5%] top-[16%]",     size: "w-32 lg:w-48", rot: 9,   speed: 120, depth: 1,    blur: "" },
  { className: "left-[8%] bottom-[10%]",   size: "w-24 lg:w-32", rot: 7,   speed: 50,  depth: 0.7,  blur: "blur-[1px]" },
  { className: "right-[7%] bottom-[8%]",   size: "w-28 lg:w-44", rot: -8,  speed: 100, depth: 0.9,  blur: "" },
  { className: "left-[0%] top-[46%]",      size: "w-20 lg:w-24", rot: 5,   speed: 34,  depth: 0.5,  blur: "blur-[2px]" },
  { className: "right-[1%] top-[40%]",     size: "w-20 lg:w-28", rot: -6,  speed: 40,  depth: 0.55, blur: "blur-[1.5px]" },
];

const Floater = ({
  src,
  alt,
  slot,
  progress,
  reduce,
}: {
  src: string;
  alt: string;
  slot: (typeof SLOTS)[number];
  progress: MotionValue<number>;
  reduce: boolean;
}) => {
  // progress: 0 when the section reaches the viewport bottom → 1 when it leaves
  // the top. Bottles drift down (parallax) and gather as the section exits.
  const ref = useRef<HTMLImageElement>(null);
  // Fade in → hold scattered while the concierge is centred → then gather and
  // descend (parallax: closer bottles travel further) as the section scrolls
  // out, drifting down toward the Signature Scents below, fading as they go.
  const y = useTransform(progress, [0, 0.5, 1], reduce ? [0, 0, 0] : [-slot.speed * 0.4, 0, slot.speed * 2.6]);
  const scale = useTransform(progress, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.9, 1, 0.8]);
  const opacity = useTransform(progress, [0, 0.16, 0.58, 0.9], [0, slot.depth, slot.depth, 0]);

  // Opacity is set imperatively (never bind an opacity MotionValue to a motion
  // element's style — it collides with the page-transition opacity variant and
  // crashes WAAPI). Transforms (y / scale / rotate) are safe on motion elements.
  useMotionValueEvent(opacity, "change", (v) => {
    if (ref.current) ref.current.style.opacity = v.toFixed(3);
  });
  useEffect(() => {
    if (ref.current) ref.current.style.opacity = "0";
  }, []);

  return (
    <motion.img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      style={{ y, scale, rotate: slot.rot }}
      className={`absolute opacity-0 ${slot.className} ${slot.size} aspect-[3/4] object-cover rounded-2xl shadow-2xl shadow-black/25 ${slot.blur} will-change-transform`}
    />
  );
};

const AssistantHero = () => {
  const dispatch = useAppDispatch();
  const { messages, status } = useAppSelector((s) => s.assistant);
  const products = useAppSelector((s) => s.products.items);
  const [input, setInput] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "loading") return;
    setInput("");
    dispatch(submitMessage(t));
  };

  // Once a conversation has started, take over the full screen.
  const active = messages.length > 0;

  // Real product shots for the floating bottles (graceful when not yet loaded).
  const shots = products
    .map((p) => p.images?.[0] || p.image)
    .filter(Boolean)
    .slice(0, SLOTS.length) as string[];

  return (
    <>
      {/* Resting state — an immersive AI-concierge scene. Stays in flow so the
          page layout is stable when the full-screen chat closes. */}
      <section
        ref={sectionRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 py-24 overflow-hidden border-t border-border/60"
      >
        {/* Ambient wash */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-secondary/20" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[640px] max-h-[640px] rounded-full bg-accent/10 blur-[140px]" />

        {/* Floating bottles around the concierge (desktop only — keeps mobile light) */}
        <div className="hidden md:block pointer-events-none absolute inset-0 z-0">
          {shots.map((src, i) => (
            <Floater key={i} src={src} alt="" slot={SLOTS[i]} progress={scrollYProgress} reduce={reduce} />
          ))}
        </div>

        {/* Concierge */}
        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-4 py-1.5 mb-6"
          >
            <Sparkles size={13} className="text-accent" />
            <span className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-foreground/70">AI Scent Concierge</span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light leading-[1.04] mb-5">
            Find your <span className="italic">signature</span>
          </h1>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Tell me a mood, a memory, or a scent you love — I'll find the one for you from our collection.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="relative max-w-xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. a smoky oud for winter evenings"
              disabled={status === "loading"}
              aria-label="Describe the scent you want"
              className="h-16 rounded-2xl pl-5 pr-16 text-base bg-background/75 backdrop-blur-md border-border shadow-xl shadow-black/[0.06] focus-visible:ring-1 focus-visible:ring-accent"
            />
            <button
              type="submit"
              disabled={status === "loading" || !input.trim()}
              aria-label="Send"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={17} />
            </button>
          </form>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-5">
            <span className="text-[10px] font-body uppercase tracking-[0.22em] text-muted-foreground/60 mr-1">Try</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => send(ex)}
                className="text-[11px] font-body uppercase tracking-[0.12em] px-4 py-2 rounded-full bg-background/70 backdrop-blur border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
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
