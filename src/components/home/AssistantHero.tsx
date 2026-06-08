import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
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

// Each card's SCATTERED offset from its grid slot (vw/vh so it stays responsive).
// At rest the cards sit at these offsets — spread around the centred concierge;
// as you scroll they animate to 0 (their real grid slot) and rotate flat.
const SCATTER = [
  { x: "-30vw", y: "-32vh", rot: -14, scale: 1.18 },
  { x: "31vw",  y: "-36vh", rot: 12,  scale: 1.24 },
  { x: "-39vw", y: "-4vh",  rot: 9,   scale: 1.02 },
  { x: "38vw",  y: "0vh",   rot: -10, scale: 1.08 },
  { x: "-21vw", y: "31vh",  rot: 7,   scale: 0.96 },
  { x: "23vw",  y: "35vh",  rot: -8,  scale: 1.0 },
];

interface CardData { id: string; slug?: string; name: string; price?: number; image: string; }

const CrossCard = ({
  card,
  scatter,
  progress,
  reduce,
}: {
  card: CardData;
  scatter: (typeof SCATTER)[number];
  progress: MotionValue<number>;
  reduce: boolean;
}) => {
  // Scatter → slot over the first ~80% of the scroll, then hold in the grid.
  const r = reduce ? { x: ["0vw", "0vw"], y: ["0vh", "0vh"], rot: [0, 0], sc: [1, 1] } : {
    x: [scatter.x, "0vw"], y: [scatter.y, "0vh"], rot: [scatter.rot, 0], sc: [scatter.scale, 1],
  };
  const x = useTransform(progress, [0, 0.82], r.x);
  const y = useTransform(progress, [0, 0.82], r.y);
  const rotate = useTransform(progress, [0, 0.82], r.rot);
  const scale = useTransform(progress, [0, 0.82], r.sc);

  // Captions fade in only once the cards have (nearly) landed.
  const capRef = useRef<HTMLDivElement>(null);
  const capOpacity = useTransform(progress, [0.6, 0.86], [0, 1]);
  useMotionValueEvent(capOpacity, "change", (v) => {
    if (capRef.current) capRef.current.style.opacity = v.toFixed(3);
  });

  return (
    <Link to={`/product/${card.slug || card.id}`} className="group block">
      <motion.div
        style={{ x, y, rotate, scale, transformPerspective: 1200 }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary shadow-2xl shadow-black/25 will-change-transform"
      >
        <img src={card.image} alt={card.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </motion.div>
      <div ref={capRef} style={{ opacity: 0 }} className="mt-3 flex items-baseline justify-between gap-2">
        <span className="font-display text-sm md:text-base truncate">{card.name}</span>
        {card.price ? <span className="text-[11px] font-body text-muted-foreground whitespace-nowrap">From ₹{card.price.toLocaleString("en-IN")}</span> : null}
      </div>
    </Link>
  );
};

const AssistantHero = () => {
  const dispatch = useAppDispatch();
  const { messages, status } = useAppSelector((s) => s.assistant);
  const products = useAppSelector((s) => s.products.items);
  const [input, setInput] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);
  const conciergeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const sprung = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.3 });
  const progress = reduce ? scrollYProgress : sprung;

  // Concierge: lifts + scales away as the cards assemble. Opacity is imperative
  // (an opacity MotionValue on a motion element collides with the page-transition
  // variant and crashes WAAPI); transforms are safe.
  const cScale = useTransform(progress, [0, 0.42], reduce ? [1, 1] : [1, 0.92]);
  const cY = useTransform(progress, [0, 0.42], reduce ? [0, 0] : [0, -48]);
  const cOpacity = useTransform(progress, [0.08, 0.42], [1, 0]);
  useMotionValueEvent(cOpacity, "change", (v) => {
    if (conciergeRef.current) {
      conciergeRef.current.style.opacity = v.toFixed(3);
      conciergeRef.current.style.pointerEvents = v < 0.2 ? "none" : "auto";
    }
  });
  // "Signature Scents" heading fades in as the grid forms.
  const hOpacity = useTransform(progress, [0.55, 0.85], [0, 1]);
  useMotionValueEvent(hOpacity, "change", (v) => {
    if (headingRef.current) headingRef.current.style.opacity = v.toFixed(3);
  });

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status === "loading") return;
    setInput("");
    dispatch(submitMessage(t));
  };

  const active = messages.length > 0;

  const cards: CardData[] = products
    .filter((p) => p.images?.[0] || p.image)
    .slice(0, SCATTER.length)
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: (p.images?.[0] || p.image) as string }));

  return (
    <>
      <div ref={trackRef} className="relative" style={{ height: "220vh" }}>
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden border-t border-border/60">
          {/* Ambient wash */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-secondary/20" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[640px] max-h-[640px] rounded-full bg-accent/10 blur-[140px]" />

          {/* "Signature Scents" heading — revealed as the grid assembles */}
          <div ref={headingRef} style={{ opacity: 0 }} className="absolute top-8 md:top-10 inset-x-0 z-20 text-center px-4">
            <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-2">Featured</p>
            <h2 className="font-display text-3xl md:text-4xl font-light">Signature Scents</h2>
          </div>

          {/* Product cards — scattered around the concierge, assembling into a grid */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl">
              {cards.map((card, i) => (
                <CrossCard key={card.id} card={card} scatter={SCATTER[i]} progress={progress} reduce={reduce} />
              ))}
            </div>
          </div>

          {/* Concierge — centred, fades + lifts as you scroll into the scents */}
          <motion.div
            ref={conciergeRef}
            style={{ scale: cScale, y: cY }}
            className="absolute inset-0 z-30 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 backdrop-blur px-4 py-1.5 mb-6">
                <Sparkles size={13} className="text-accent" />
                <span className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-foreground/70">AI Scent Concierge</span>
              </div>
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
                  className="h-16 rounded-2xl pl-5 pr-16 text-base bg-background/80 backdrop-blur-md border-border shadow-xl shadow-black/[0.06] focus-visible:ring-1 focus-visible:ring-accent"
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
          </motion.div>
        </div>
      </div>

      {/* Full-screen conversation, mounted on the first prompt. */}
      <AnimatePresence>{active && <AssistantChat key="concierge-chat" />}</AnimatePresence>
    </>
  );
};

export default AssistantHero;
