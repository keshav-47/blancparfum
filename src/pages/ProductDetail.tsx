import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addItemToCart } from "@/store/slices/cartSlice";
import { toast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const product = products.find((p) => p.id === id || p.slug === id);

  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h2 className="font-display text-3xl mb-4">Product not found</h2>
          <Link to="/shop" className="text-accent hover:underline font-body text-sm">Return to shop</Link>
        </div>
      </Layout>
    );
  }

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  const currentSize = product.sizes[selectedSize];

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({
        productId: product.id,
        name: product.name,
        image: product.images[0],
        size: currentSize.ml,
        price: currentSize.price,
        quantity,
      })).unwrap();
      toast({ title: "Added to cart", description: `${product.name} (${currentSize.ml}ml) \u00D7 ${quantity}` });
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "Failed to add to cart";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <SEO
        title={product.name}
        description={product.tagline || `${product.name} — Extrait de Parfum by BLANC PARFUM. From \u20B9${product.sizes[0].price}.`}
        canonical={`/product/${product.slug || product.id}`}
        type="product"
        image={product.images[0]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": `${product.name} — ${product.tagline}. Handcrafted Extrait de Parfum by BLANC PARFUM.`,
          "image": product.images,
          "brand": { "@type": "Brand", "name": "BLANC PARFUM" },
          "category": "Fragrances",
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": product.sizes[0].price,
            "highPrice": product.sizes[product.sizes.length - 1].price,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "offerCount": product.sizes.length,
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 pb-16 overflow-hidden">
        {/* Back */}
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-body font-medium uppercase tracking-[0.15em] mb-10"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" /> Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="aspect-[3/4] bg-secondary overflow-hidden rounded-xl mb-4">
              <motion.img
                key={activeImage}
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                      i === activeImage ? "border-accent ring-1 ring-accent/30" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="lg:sticky lg:top-24">
              {product.isNew && (
                <span className="inline-block text-[10px] font-body font-medium uppercase tracking-[0.2em] text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
                  New
                </span>
              )}
              <p className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Extrait de Parfum
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-light mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground font-body mb-8">{product.tagline}</p>
              <p className="font-body text-2xl font-light mb-10">
                {"\u20B9"}{currentSize.price.toLocaleString("en-IN")}
              </p>

              {/* Size selector */}
              <div className="mb-8">
                <p className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">Size</p>
                <div className="flex gap-2">
                  {product.sizes.map((s, i) => {
                    const outOfStock = s.stockQuantity != null && s.stockQuantity <= 0;
                    return (
                      <button
                        key={s.ml}
                        onClick={() => !outOfStock && setSelectedSize(i)}
                        disabled={outOfStock}
                        className={`px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all duration-300 ${
                          outOfStock
                            ? "bg-secondary/50 text-muted-foreground/40 line-through cursor-not-allowed"
                            : i === selectedSize
                              ? "bg-foreground text-background"
                              : "bg-secondary text-foreground hover:bg-secondary/70"
                        }`}
                      >
                        {s.ml}ml
                      </button>
                    );
                  })}
                </div>
                {currentSize.stockQuantity != null && currentSize.stockQuantity > 0 && currentSize.stockQuantity <= 5 && (
                  <p className="text-[11px] text-accent font-body font-medium mt-2">
                    Only {currentSize.stockQuantity} left in stock
                  </p>
                )}
                {currentSize.stockQuantity != null && currentSize.stockQuantity <= 0 && (
                  <p className="text-[11px] text-destructive font-body font-medium mt-2">
                    Out of stock
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-10">
                <p className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">Quantity</p>
                <div className="inline-flex items-center gap-0 border border-border rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-body text-sm w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <Button
                onClick={handleAddToCart}
                disabled={currentSize.stockQuantity != null && currentSize.stockQuantity <= 0}
                className="w-full h-14 rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium gap-2"
              >
                <ShoppingBag size={15} strokeWidth={1.5} />
                {currentSize.stockQuantity != null && currentSize.stockQuantity <= 0
                  ? "Out of Stock"
                  : `Add to Cart — \u20B9${(currentSize.price * quantity).toLocaleString("en-IN")}`}
              </Button>

              {/* Tabs */}
              <Tabs defaultValue="notes" className="mt-12">
                <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-4 sm:gap-8 px-0 h-auto overflow-x-auto scrollbar-hide">
                  {["notes", "description", "ingredients"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] uppercase tracking-[0.15em] px-0 pb-3 font-body font-medium whitespace-nowrap flex-shrink-0"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="notes" className="pt-8">
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
                    {(["top", "heart", "base"] as const).map((type) => (
                      <div key={type} className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-body font-medium mb-3">
                          {type}
                        </p>
                        <div className="space-y-1.5">
                          {product.notes[type].map((note) => (
                            <p key={note} className="text-sm text-muted-foreground font-body">{note}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="description" className="pt-8">
                  <p className="text-muted-foreground leading-relaxed font-body text-sm">{product.description}</p>
                </TabsContent>
                <TabsContent value="ingredients" className="pt-8">
                  <p className="text-muted-foreground text-sm font-body leading-relaxed">
                    Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Citronellol, Geraniol.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-28">
            <div className="text-center mb-14">
              <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Discover More</p>
              <h2 className="font-display text-3xl md:text-4xl font-light">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {related.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/product/${p.slug || p.id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-secondary rounded-lg mb-4">
                      <motion.img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-display text-lg tracking-wider">{p.name}</h3>
                      <p className="text-[11px] font-body text-muted-foreground uppercase tracking-[0.15em]">{p.tagline}</p>
                      <p className="text-sm font-body text-foreground/70">From {"\u20B9"}{p.sizes[0]?.price.toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
