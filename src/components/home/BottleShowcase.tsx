import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/animations/ScrollReveal";
import TextReveal from "@/components/animations/TextReveal";
import Magnetic from "@/components/animations/Magnetic";

// Ends with " · " so the ring reads continuously across the seam.
const RING_TEXT = "BLANC PARFUM · EXTRAIT DE PARFUM · HANDCRAFTED IN INDIA · ";

// Scent-note chips that float around the bottle.
const notes = [
  { label: "Oud", pos: "top-[4%] left-[8%]", float: 5.5, delay: 0 },
  { label: "Taif Rose", pos: "top-[14%] right-[0%]", float: 6.5, delay: 0.5 },
  { label: "Amber", pos: "bottom-[16%] left-[0%]", float: 6, delay: 1 },
  { label: "Vetiver", pos: "bottom-[4%] right-[10%]", float: 5, delay: 1.5 },
];

const BottleShowcase = () => {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Soft accent glow behind the bottle */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[560px] max-h-[560px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        {/* Copy */}
        <div className="order-2 md:order-1">
          <ScrollReveal>
            <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-4">The Craft</p>
          </ScrollReveal>
          <TextReveal as="h2" by="line" className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05]">
            Bottled by Hand,
          </TextReveal>
          <TextReveal as="h2" by="line" delay={0.12} className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] text-accent mb-8">
            Worn by Memory
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <p className="font-body text-muted-foreground leading-relaxed max-w-md mb-10">
              Every BLANC fragrance is a small-batch extrait — composed drop by drop with the world's
              rarest ingredients, then aged until the notes settle into something unforgettable.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <Magnetic strength={0.35}>
              <Link
                to="/about"
                className="group inline-flex items-center gap-3 text-[11px] font-body font-medium uppercase tracking-[0.25em] text-foreground border-b border-foreground/30 pb-1.5 hover:border-foreground transition-colors"
              >
                Discover the Craft
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </ScrollReveal>
        </div>

        {/* Bottle wrapped by rotating text */}
        <ScrollReveal direction="right" className="order-1 md:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[420px]">
            {/* Rotating brand-text ring */}
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 300 300" className="w-full h-full">
                <defs>
                  <path id="bp-ring" fill="none" d="M150,150 m-128,0 a128,128 0 1,1 256,0 a128,128 0 1,1 -256,0" />
                </defs>
                <text
                  textLength="804"
                  lengthAdjust="spacing"
                  className="fill-foreground/45 uppercase"
                  style={{ fontSize: 13, fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                >
                  <textPath href="#bp-ring" startOffset="0">{RING_TEXT}</textPath>
                </text>
              </svg>
            </motion.div>

            {/* Bottle in a circular frame, gently floating */}
            <motion.div
              className="absolute inset-[15%] rounded-full overflow-hidden shadow-2xl ring-1 ring-border/60"
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80"
                alt="BLANC Parfum bottle"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>

            {/* Floating scent-note chips */}
            {notes.map((n) => (
              <motion.div
                key={n.label}
                className={`absolute ${n.pos} z-10`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + n.delay * 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="block text-[10px] md:text-[11px] font-body uppercase tracking-[0.2em] text-foreground/70 bg-background/70 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1.5 shadow-sm"
                  animate={reduce ? undefined : { y: [0, -7, 0] }}
                  transition={{ duration: n.float, repeat: Infinity, ease: "easeInOut", delay: n.delay }}
                >
                  {n.label}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BottleShowcase;
