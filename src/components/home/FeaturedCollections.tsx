import { useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import TextReveal from "@/components/animations/TextReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

// Image drifts within its frame as the card scrolls past — adds depth.
const CollectionImage = ({ src, alt }: { src?: string; alt: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </motion.div>
    </div>
  );
};

const FeaturedCollections = () => {
  const collections = useAppSelector((state) => state.products.collections);

  if (!collections.length) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">
              Curated
            </p>
          </ScrollReveal>
          <TextReveal as="h2" className="font-display text-4xl md:text-5xl font-light">
            Collections
          </TextReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((col, i) => (
            <ScrollReveal key={col.id} delay={i * 0.15} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
              <Link to={`/collection/${col.slug || col.id}`} className="group block relative aspect-[3/4] overflow-hidden rounded-lg">
                <CollectionImage src={col.image} alt={col.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 className="font-display text-2xl md:text-3xl text-white mb-1.5">
                    {col.name}
                  </h3>
                  <p className="text-[11px] font-body text-white/60 uppercase tracking-[0.15em] mb-4">
                    {col.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-body font-medium uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">
                    Explore <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
