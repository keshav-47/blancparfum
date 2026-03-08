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

  // Map vertical scroll to horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(featured.length - 1) * 33}%`]);

  return (
    <section ref={containerRef} style={{ height: `${featured.length * 80}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div className="container mx-auto px-4 lg:px-8 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.3em] text-accent mb-3">Featured</p>
              <h2 className="font-display text-4xl md:text-5xl">Signature Scents</h2>
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
          className="flex gap-8 px-4 lg:px-8"
        >
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[80vw] sm:w-[50vw] md:w-[33vw]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll progress indicator */}
        <div className="container mx-auto px-4 lg:px-8 mt-10">
          <div className="h-[1px] bg-border w-full max-w-xs">
            <motion.div
              className="h-full bg-accent origin-left"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductScroll;
