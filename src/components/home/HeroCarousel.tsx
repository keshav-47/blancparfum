import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80",
    title: "The Art of Scent",
    subtitle: "Discover BLANC's newest collection",
    cta: "Explore Now",
  },
  {
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1920&q=80",
    title: "Lumière d'Or",
    subtitle: "Golden hour, bottled",
    cta: "Shop Women",
  },
  {
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80",
    title: "Noir Absolu",
    subtitle: "Dark. Magnetic. Unforgettable.",
    cta: "Shop Men",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section className="relative h-[100vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover opacity-40"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center text-foreground px-4"
          >
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-light mb-4 tracking-wide text-primary">
              {slides[current].title}
            </h2>
            <p className="font-body text-sm md:text-base uppercase tracking-[0.3em] mb-8 text-foreground/60">
              {slides[current].subtitle}
            </p>
            <Button
              variant="outline"
              className="border-primary/40 text-primary bg-transparent hover:bg-primary hover:text-primary-foreground uppercase tracking-[0.2em] text-xs px-8 py-3 h-auto rounded-none"
            >
              {slides[current].cta}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-primary transition-colors">
        <ChevronLeft size={32} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-primary transition-colors">
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-0.5 transition-all ${i === current ? "bg-primary" : "bg-foreground/20"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
