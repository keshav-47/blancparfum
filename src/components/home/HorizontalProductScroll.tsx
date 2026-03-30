import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductCard from "@/components/product/ProductCard";

const HorizontalProductScroll = () => {
  const products = useAppSelector((state) => state.products.items);
  const featured = products.filter((p) => p.isFeatured);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cardCount = featured.length || 1;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(cardCount - 1) * (100 / cardCount)}%`]);

  // Mobile: native horizontal scroll
  if (isMobile) {
    return (
      <section className="py-16">
        <div className="px-6 mb-8">
          <p className="text-xs font-body uppercase tracking-[0.3em] text-muted-foreground mb-3">Featured</p>
          <h2 className="font-display text-3xl font-light text-foreground">Signature Scents</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-6" style={{ width: "max-content" }}>
            {featured.map((product) => (
              <div key={product.id} className="w-[70vw] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 mt-6">
          <Link
            to="/"
            className="text-xs font-body uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
          >
            View All →
          </Link>
        </div>
      </section>
    );
  }

  // Desktop: parallax horizontal scroll
  return (
    <section ref={containerRef} style={{ height: `${Math.max(cardCount * 80, 200)}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-2">
        <div className="px-6 md:px-8 lg:px-16 mb-2 md:mb-4 lg:mb-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-body uppercase tracking-[0.3em] text-muted-foreground mb-1">Featured</p>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-foreground">
                Signature Scents
              </h2>
            </div>
            <Link
              to="/"
              className="text-[10px] md:text-xs font-body uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
            >
              View All →
            </Link>
          </div>
        </div>

        <motion.div style={{ x }} className="flex gap-3 md:gap-5 lg:gap-8 px-6 md:px-8 lg:px-16">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[40vw] md:w-[32vw] lg:w-[25vw]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <div className="px-6 md:px-8 lg:px-16 mt-2 md:mt-4 lg:mt-6">
          <div className="h-px bg-border w-full max-w-xs">
            <motion.div className="h-full bg-foreground origin-left" style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductScroll;
