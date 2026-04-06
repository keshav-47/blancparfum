import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setFilter } from "@/store/slices/productsSlice";

const filters = [
  { key: "all", label: "All" },
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "unisex", label: "Unisex" },
  { key: "new", label: "New" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ProductGrid = () => {
  const dispatch = useAppDispatch();
  const { items, filter } = useAppSelector((state) => state.products);

  const filtered = items.filter((p) => {
    if (filter === "all") return true;
    if (filter === "new") return p.isNew;
    return p.category === filter;
  });

  return (
    <section id="product-grid" className="py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">
              Discover
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Our Fragrances</h2>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-12 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => dispatch(setFilter(f.key))}
              className={`text-[11px] font-body font-medium uppercase tracking-[0.15em] px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                filter === f.key
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div
          key={filter}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-16"
        >
          {filtered.map((product) => (
            <motion.div key={product.id} variants={cardVariants} layout>
              <Link to={`/product/${product.id}`} className="group block">
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
                    <span className="absolute top-4 left-4 text-[10px] font-body font-medium uppercase tracking-[0.15em] bg-white/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-display text-xl tracking-wider">{product.name}</h3>
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
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;
