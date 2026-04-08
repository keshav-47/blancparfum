import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextReveal from "@/components/animations/TextReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setFilter } from "@/store/slices/productsSlice";
import { addItemToCart } from "@/store/slices/cartSlice";
import { toast } from "@/hooks/use-toast";

const LIMIT = 6;

const filters = [
  { key: "all", label: "All" },
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "unisex", label: "Unisex" },
  { key: "new", label: "New" },
];

const MistCard = ({ product, index, dispatch }: { product: any; index: number; dispatch: any }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(20px)", y: 40, scale: 0.92 }}
      animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 } : {}}
      transition={{
        duration: 1.2,
        delay: index * 0.15,
        ease: [0.21, 0.47, 0.32, 0.98],
        filter: { duration: 1.4, delay: index * 0.15 },
      }}
    >
      <div className="group relative">
        <Link to={`/product/${product.slug || product.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-lg mb-5">
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
        </Link>
        {/* Quick add */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            if (!product.sizes[0]) return;
            try {
              await dispatch(addItemToCart({
                productId: product.id,
                name: product.name,
                image: product.images[0] || "",
                size: product.sizes[0].ml,
                price: product.sizes[0].price,
                quantity: 1,
              })).unwrap();
              toast({ title: `${product.name} added to cart` });
            } catch {
              toast({ title: "Failed to add", variant: "destructive" });
            }
          }}
          className="absolute bottom-[88px] left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-foreground text-background rounded-full px-5 py-2.5 text-[10px] font-body font-medium uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-foreground/90 shadow-lg"
        >
          <ShoppingBag size={12} strokeWidth={2} /> Quick Add
        </button>
        <Link to={`/product/${product.slug || product.id}`} className="block text-center space-y-1.5">
          <h3 className="font-display text-xl tracking-wider">{product.name}</h3>
          <p className="text-[11px] font-body text-muted-foreground uppercase tracking-[0.15em]">
            {product.tagline}
          </p>
          <p className="text-sm font-body text-foreground/70">
            From {"\u20B9"}{product.sizes[0]?.price.toLocaleString("en-IN")}
          </p>
        </Link>
      </div>
    </motion.div>
  );
};

const ProductGrid = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, filter } = useAppSelector((state) => state.products);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start center"],
  });

  // Golden mist fog that clears as user scrolls
  const fogOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.8, 0.3, 0]);
  const fogBlur = useTransform(scrollYProgress, [0, 1], [8, 0]);
  const fogScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);

  const allFiltered = items.filter((p) => {
    if (filter === "all") return true;
    if (filter === "new") return p.isNew;
    return p.category === filter;
  });
  const filtered = allFiltered.slice(0, LIMIT);
  const hasMore = allFiltered.length > LIMIT;

  return (
    <section id="product-grid" ref={sectionRef} className="py-24 md:py-32 relative">
      {/* Golden mist overlay that clears on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ opacity: fogOpacity }}
      >
        <motion.div
          className="w-full h-full"
          style={{
            scale: fogScale,
            background: "radial-gradient(ellipse at center, rgba(184,134,11,0.08) 0%, rgba(184,134,11,0.03) 40%, transparent 70%)",
          }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <ScrollReveal>
              <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">
                Discover
              </p>
            </ScrollReveal>
            <TextReveal as="h2" className="font-display text-4xl md:text-5xl font-light">
              Our Fragrances
            </TextReveal>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 sm:gap-3 mb-12 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => dispatch(setFilter(f.key))}
              className={`text-[11px] font-body font-medium uppercase tracking-[0.15em] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
                filter === f.key
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid — cards emerge from mist */}
        <div
          key={filter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-16"
        >
          {filtered.map((product, i) => (
            <MistCard key={product.id} product={product} index={i} dispatch={dispatch} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-16">
            <Button
              variant="outline"
              onClick={() => navigate(filter === "all" ? "/shop" : `/shop?category=${filter}`)}
              className="rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium px-10 h-11 gap-2"
            >
              View All {filter !== "all" ? filters.find(f => f.key === filter)?.label : ""} Fragrances
              <ArrowRight size={13} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
