import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";

const HorizontalProductScroll = () => {
  const products = useAppSelector((state) => state.products.items);
  const featured = products.filter((p) => p.isFeatured).slice(0, 10);

  if (!featured.length) return null;

  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-2">Featured</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light">Signature Scents</h2>
        </div>
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="overflow-x-auto overflow-y-visible scrollbar-hide">
        <div className="flex gap-4 md:gap-6 px-4 sm:px-6 md:px-12 lg:px-20 pb-2" style={{ width: "max-content" }}>
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              className="w-[65vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link to={`/product/${product.slug || product.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-lg mb-4">
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductScroll;
