import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchProducts, fetchCollections } from "@/store/slices/productsSlice";
import { addItemToCart } from "@/store/slices/cartSlice";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/types";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const CollectionDetail = () => {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { items: products, collections } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (!products.length) dispatch(fetchProducts());
    if (!collections.length) dispatch(fetchCollections());
  }, [dispatch, products.length, collections.length]);

  const collection = collections.find((c) => c.slug === slug || c.id === slug);

  if (!collection) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
          <h2 className="font-display text-3xl mb-4">Collection not found</h2>
          <Link to="/" className="text-accent hover:underline font-body text-sm">Return home</Link>
        </div>
      </Layout>
    );
  }

  const collectionProducts = products.filter((p) =>
    collection.productIds.includes(p.id)
  );

  // Other collections for "Explore More"
  const otherCollections = collections.filter((c) => c.id !== collection.id).slice(0, 3);

  const handleQuickAdd = async (product: Product) => {
    if (!product.sizes?.[0] && !product.price) return;
    try {
      await dispatch(addItemToCart({
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || product.image || "",
        size: product.sizes?.[0]?.ml ?? 30,
        price: product.sizes?.[0]?.price ?? product.price,
        quantity: 1,
      })).unwrap();
      toast({ title: `${product.name} added to cart` });
    } catch {
      toast({ title: "Failed to add", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <SEO
        title={collection.name}
        description={`${collection.name} — ${collection.description}. Shop the curated collection by BLANC PARFUM.`}
        canonical={`/collection/${collection.slug}`}
        image={collection.image}
      />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <img
          src={collection.image}
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16 w-full">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-white/50 hover:text-white text-[11px] font-body font-medium uppercase tracking-[0.15em] mb-6 transition-colors"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" /> Home
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-white/40 mb-3">
                Collection
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-3">
                {collection.name}
              </h1>
              <p className="font-body text-sm md:text-base text-white/60 max-w-xl leading-relaxed">
                {collection.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="flex items-end justify-between mb-12">
          <p className="text-[11px] font-body font-medium text-muted-foreground uppercase tracking-[0.15em]">
            {collectionProducts.length} fragrance{collectionProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {collectionProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20 font-body">
            No products in this collection yet.
          </p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-16"
          >
            {collectionProducts.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <div className="group relative">
                  <Link to={`/product/${product.slug || product.id}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-lg mb-5">
                      <motion.img
                        src={product.images?.[0] || product.image || ""}
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
                    onClick={() => handleQuickAdd(product)}
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
                      From {"\u20B9"}{(product.sizes?.[0]?.price ?? product.price).toLocaleString("en-IN")}
                    </p>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Explore More Collections */}
      {otherCollections.length > 0 && (
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <div className="text-center mb-12">
              <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Discover</p>
              <h2 className="font-display text-3xl md:text-4xl font-light">Explore More Collections</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {otherCollections.map((col) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/collection/${col.slug || col.id}`} className="group block relative aspect-[3/4] overflow-hidden rounded-lg">
                    <img
                      src={col.image}
                      alt={col.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <h3 className="font-display text-2xl md:text-3xl text-white mb-1.5">{col.name}</h3>
                      <p className="text-[11px] font-body text-white/60 uppercase tracking-[0.15em] mb-3">{col.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-body font-medium uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">
                        Explore <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CollectionDetail;
