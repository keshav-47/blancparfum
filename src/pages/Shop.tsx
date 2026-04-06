import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchProducts, setFilter } from "@/store/slices/productsSlice";
import type { Product } from "@/types";

const filters = [
  { key: "all", label: "All" },
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "unisex", label: "Unisex" },
  { key: "new", label: "New Arrivals" },
];

const heroData: Record<string, { title: string; subtitle: string; image: string }> = {
  all: {
    title: "The Collection",
    subtitle: "Handcrafted Extrait de Parfum, made with the world's rarest ingredients",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80",
  },
  women: {
    title: "For Her",
    subtitle: "Florals, musks & golden warmth — fragrances that linger in memory",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1920&q=80",
  },
  men: {
    title: "For Him",
    subtitle: "Oud, leather & smoke — bold scents forged in contrast",
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80",
  },
  unisex: {
    title: "Beyond Gender",
    subtitle: "Scent has no boundaries — fragrances for the free-spirited",
    image: "https://images.unsplash.com/photo-1594035910387-fbd1a3fbb128?w=1920&q=80",
  },
  new: {
    title: "New Arrivals",
    subtitle: "The latest additions to the BLANC universe",
    image: "https://images.unsplash.com/photo-1595425964272-fc617fa15e70?w=1920&q=80",
  },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const ShopCard = ({ product }: { product: Product }) => {
  const notes = [
    ...(product.notes?.top?.slice(0, 1) || []),
    ...(product.notes?.heart?.slice(0, 1) || []),
    ...(product.notes?.base?.slice(0, 1) || []),
  ];

  return (
    <motion.div variants={cardVariants} layout>
      <Link to={`/product/${product.id}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/50 mb-6">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          />
          {product.isNew && (
            <span className="absolute top-5 left-5 text-[10px] font-body uppercase tracking-[0.2em] text-foreground/80 bg-background/80 backdrop-blur-sm px-3 py-1.5">
              New
            </span>
          )}
          {/* Hover overlay with notes */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/60 via-black/30 to-transparent p-6 pt-16">
            {notes.length > 0 && (
              <p className="text-[11px] text-white/80 uppercase tracking-[0.2em] font-body">
                {notes.join(" / ")}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-white/90 text-xs font-body uppercase tracking-[0.15em]">
              Discover <ArrowRight size={12} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5 px-2">
          <h3 className="font-display text-lg md:text-xl tracking-wider text-foreground">
            {product.name}
          </h3>
          <p className="text-[11px] font-body text-muted-foreground uppercase tracking-[0.2em]">
            Extrait de Parfum
          </p>
          <p className="text-sm font-body text-foreground/70 pt-1">
            {product.sizes.length > 1
              ? `From \u20B9${product.sizes[0].price.toLocaleString("en-IN")}`
              : `\u20B9${product.sizes[0].price.toLocaleString("en-IN")}`}
            {product.sizes.length > 1 && (
              <span className="text-muted-foreground text-[11px] ml-1.5">
                +{product.sizes.length - 1} size{product.sizes.length > 2 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

const Shop = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items } = useAppSelector((state) => state.products);

  const category = searchParams.get("category") || "all";
  const hero = heroData[category] || heroData.all;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFilter(category));
  }, [category, dispatch]);

  const filtered = items.filter((p) => {
    if (category === "all") return true;
    if (category === "new") return p.isNew;
    return p.category === category;
  });

  const handleFilter = (key: string) => {
    setSearchParams(key === "all" ? {} : { category: key });
  };

  return (
    <Layout>
      <SEO title={hero.title} canonical="/shop" />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={category}
            src={hero.image}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center px-6"
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wider text-white mb-4">
                {hero.title}
              </h1>
              <p className="font-body text-sm md:text-base text-white/70 uppercase tracking-[0.25em] max-w-xl mx-auto">
                {hero.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Filters */}
      <nav className="border-b border-border sticky top-16 z-40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex justify-center gap-8 md:gap-12 px-4 py-5 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              className={`text-[11px] font-body uppercase tracking-[0.25em] pb-1 whitespace-nowrap transition-all duration-300 border-b-2 ${
                category === f.key
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Narrative */}
      <div className="container mx-auto px-6 md:px-16 lg:px-24 py-16 md:py-20">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto italic"
        >
          Each BLANC fragrance is an Extrait de Parfum — the highest concentration of
          perfume oil — handcrafted in small batches for those who believe scent is the
          most intimate form of self-expression.
        </motion.p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-6 md:px-16 lg:px-24 pb-24">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground py-24 font-body"
            >
              No fragrances found in this category.
            </motion.p>
          ) : (
            <motion.div
              key={category}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-x-12 md:gap-y-20"
            >
              {filtered.map((product) => (
                <ShopCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Count */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-body mt-20 pt-10 border-t border-border"
        >
          Showing {filtered.length} fragrance{filtered.length !== 1 ? "s" : ""}
        </motion.p>
      </div>
    </Layout>
  );
};

export default Shop;
