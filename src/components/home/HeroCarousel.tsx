import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-foreground">
      {/* Background image */}
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

      {/* Content - bottom left aligned */}
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-24 md:pb-32">
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
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[0.95] mb-8 whitespace-pre-line break-words">
                {slides[current].title}
              </h1>
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators - right side */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-0.5 transition-all duration-500 ${
              i === current ? "h-10 bg-white" : "h-5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

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
