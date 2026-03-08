import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setFilter } from "@/store/slices/productsSlice";
import ProductCard from "@/components/product/ProductCard";

const filters = [
  { key: "all", label: "All" },
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "unisex", label: "Unisex" },
  { key: "new", label: "New Arrivals" },
];

const ProductGrid = () => {
  const dispatch = useAppDispatch();
  const { items, filter } = useAppSelector((state) => state.products);

  const filtered = items.filter((p) => {
    if (filter === "all") return true;
    if (filter === "new") return p.isNew;
    return p.category === filter;
  });

  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="container mx-auto">
        <h2 className="font-display text-4xl md:text-5xl text-center mb-4">Our Fragrances</h2>
        <p className="text-center text-muted-foreground text-sm uppercase tracking-[0.2em] mb-12">
          Discover your signature scent
        </p>

        {/* Filters */}
        <div className="flex justify-center gap-6 mb-12">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => dispatch(setFilter(f.key))}
              className={`text-xs font-body uppercase tracking-[0.2em] pb-1 transition-colors border-b ${
                filter === f.key
                  ? "text-foreground border-accent"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
