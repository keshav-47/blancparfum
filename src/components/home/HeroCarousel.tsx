import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Magnetic from "@/components/animations/Magnetic";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80",
    label: "The Collection",
    title: "The Art\nof Scent",
    cta: "Explore All",
    filter: "all",
  },
  {
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1920&q=80",
    label: "Women's Edit",
    title: "Lumiere\nd'Or",
    cta: "Shop Women",
    filter: "women",
  },
  {
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80",
    label: "Men's Edit",
    title: "Noir\nAbsolu",
    cta: "Shop Men",
    filter: "men",
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-linked parallax as the hero scrolls out of view.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.2]);
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-45%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], reduce ? [1, 1] : [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-foreground">
      {/* Background image — scroll parallax wrapper (scale provides overscan so the drift never reveals an edge) */}
      <motion.div style={{ scale: imageScale, y: imageY }} className="absolute inset-0 will-change-transform">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-full object-cover opacity-60"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Content - bottom left aligned, drifts up + fades on scroll */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="absolute inset-0 flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-24 md:pb-32 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="max-w-xl"
            >
              <p className="text-[11px] font-body font-medium uppercase tracking-[0.3em] text-white/50 mb-4">
                {slides[current].label}
              </p>
              {/* Headline — masked per-line rise */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white leading-[0.95] mb-8 whitespace-pre-line break-words">
                {slides[current].title.split("\n").map((line, i) => (
                  <span key={i} className="block overflow-hidden">
                    <motion.span
                      className="block"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.9, delay: 0.4 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <Magnetic strength={0.4}>
                <button
                  onClick={() => {
                    const f = slides[current].filter;
                    navigate(f === "all" ? "/shop" : `/shop?category=${f}`);
                  }}
                  className="group inline-flex items-center gap-3 text-[11px] font-body font-medium uppercase tracking-[0.25em] text-white/80 hover:text-white transition-colors duration-300"
                >
                  {slides[current].cta}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Magnetic>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Slide indicators - right side */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-0.5 transition-all duration-500 ${
              i === current ? "h-10 bg-white" : "h-5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-10"
        style={{ opacity: contentOpacity }}
      >
        <span className="text-[9px] font-body uppercase tracking-[0.35em] text-white/40">Scroll</span>
        <div className="relative h-10 w-px overflow-hidden bg-white/15">
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-white/70"
            animate={reduce ? {} : { y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <motion.div
          key={current}
          className="h-full bg-white/40"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </div>
    </section>
  );
};

export default HeroCarousel;
