import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const Card = ({ product, i }: { product: typeof featured[0]; i: number }) => (
    <Link to={`/product/${product.slug || product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
        {product.isNew && (
          <span className="absolute top-4 left-4 text-[10px] font-body font-medium uppercase tracking-[0.15em] bg-white/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full border border-foreground/20">
            New
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-lg tracking-wide">{product.name}</h3>
        <p className="text-[11px] font-body text-muted-foreground uppercase tracking-[0.15em]">
          {product.tagline}
        </p>
        <p className="text-sm font-body text-foreground/70">
          From {"\u20B9"}{product.sizes[0]?.price.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );

  if (isMobile) {
    return (
      <section className="py-16">
        <div className="px-4 sm:px-6 mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-2">Featured</p>
            <h2 className="font-display text-3xl font-light">Signature Scents</h2>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-1.5 text-[10px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-6" style={{ width: "max-content" }}>
            {featured.map((product, i) => (
              <div key={product.id} className="w-[65vw] sm:w-[70vw] flex-shrink-0">
                <Card product={product} i={i} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} style={{ height: `${Math.max(cardCount * 80, 200)}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-2">
        <div className="px-6 md:px-12 lg:px-20 mb-4 lg:mb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] md:text-[11px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-2">
                Featured
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light">Signature Scents</h2>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <motion.div style={{ x }} className="flex gap-5 md:gap-6 lg:gap-8 px-6 md:px-12 lg:px-20">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[40vw] md:w-[32vw] lg:w-[25vw]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card product={product} i={i} />
            </motion.div>
          ))}
        </motion.div>

        <div className="px-6 md:px-12 lg:px-20 mt-4 lg:mt-8">
          <div className="h-[2px] bg-border w-full max-w-xs rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full origin-left" style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductScroll;
