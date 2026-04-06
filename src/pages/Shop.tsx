import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import ProductCard from "@/components/product/ProductCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchProducts, setFilter } from "@/store/slices/productsSlice";

const filters = [
  { key: "all", label: "All" },
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "unisex", label: "Unisex" },
  { key: "new", label: "New Arrivals" },
];

const titleMap: Record<string, string> = {
  all: "All Fragrances",
  women: "Women's Collection",
  men: "Men's Collection",
  unisex: "Unisex Collection",
  new: "New Arrivals",
};

const Shop = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, filter } = useAppSelector((state) => state.products);

  const category = searchParams.get("category") || "all";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (category !== filter) {
      dispatch(setFilter(category));
    }
  }, [category, filter, dispatch]);

  const filtered = items.filter((p) => {
    if (category === "all") return true;
    if (category === "new") return p.isNew;
    return p.category === category;
  });

  const handleFilter = (key: string) => {
    setSearchParams(key === "all" ? {} : { category: key });
    dispatch(setFilter(key));
  };

  return (
    <Layout>
      <SEO title={titleMap[category] || "Shop"} canonical="/shop" />
      <div className="container mx-auto px-4 lg:px-8 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl text-center mb-4">
            {titleMap[category] || "Our Fragrances"}
          </h1>
          <p className="text-center text-muted-foreground text-sm uppercase tracking-[0.2em] mb-12">
            Discover your signature scent
          </p>

          {/* Filters */}
          <div className="flex justify-center gap-6 mb-12 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilter(f.key)}
                className={`text-xs font-body uppercase tracking-[0.2em] pb-1 transition-colors border-b ${
                  category === f.key
                    ? "text-foreground border-accent"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              No fragrances found in this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Shop;
