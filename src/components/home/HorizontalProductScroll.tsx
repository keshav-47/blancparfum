import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import ProductCard from "@/components/product/ProductCard";

const HorizontalProductScroll = () => {
  const products = useAppSelector((state) => state.products.items);
  const featured = products.filter((p) => p.isFeatured);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cardCount = featured.length || 1;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(cardCount - 1) * (100 / cardCount)}%`]);

  return (
    <section ref={containerRef} style={{ height: `${Math.max(cardCount * 80, 200)}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div className="px-8 lg:px-16 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground mb-3">Featured</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                Signature Scents
              </h2>
            </div>
            <Link
              to="/"
              className="hidden md:block text-xs font-body uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <motion.div
          style={{ x }}
          className="flex gap-6 lg:gap-8 px-8 lg:px-16"
        >
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[25vw]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll progress indicator */}
        <div className="px-8 lg:px-16 mt-10">
          <div className="h-px bg-border w-full max-w-xs">
            <motion.div
              className="h-full bg-foreground origin-left"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductScroll;
