import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const product = products.find((p) => p.id === id);

  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h2 className="font-display text-3xl mb-4">Product not found</h2>
          <Link to="/" className="text-accent hover:underline">Return to shop</Link>
        </div>
      </Layout>
    );
  }

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  const currentSize = product.sizes[selectedSize];

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      size: currentSize.ml,
      price: currentSize.price,
      quantity,
    }));
    toast({ title: "Added to cart", description: `${product.name} (${currentSize.ml}ml) × ${quantity}` });
  };

  return (
    <Layout>
      <SEO
        title={product.name}
        description={product.tagline || `${product.name} — Extrait de Parfum by BLANC PARFUM. From $${product.sizes[0].price}.`}
        canonical={`/product/${product.id}`}
        type="product"
        image={product.images[0]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.tagline,
          "image": product.images[0],
          "brand": { "@type": "Brand", "name": "BLANC PARFUM" },
          "offers": {
            "@type": "Offer",
            "price": product.sizes[0].price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
          },
        }}
      />
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-4">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-colors ${i === activeImage ? "border-accent" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {product.isNew && (
              <span className="text-[10px] font-body uppercase tracking-widest text-accent mb-2 block">New</span>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-2">{product.name}</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">{product.tagline}</p>
            <p className="font-body text-2xl mb-8">${currentSize.price}</p>

            {/* Size selector */}
            <div className="mb-8">
              <p className="text-xs font-body uppercase tracking-[0.2em] text-muted-foreground mb-3">Size</p>
              <div className="flex gap-3">
                {product.sizes.map((s, i) => (
                  <button
                    key={s.ml}
                    onClick={() => setSelectedSize(i)}
                    className={`px-5 py-2.5 border text-sm font-body transition-colors ${
                      i === selectedSize
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {s.ml}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-xs font-body uppercase tracking-[0.2em] text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-border flex items-center justify-center hover:border-foreground transition-colors">
                  <Minus size={14} />
                </button>
                <span className="font-body text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-border flex items-center justify-center hover:border-foreground transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-14 rounded-none uppercase tracking-[0.2em] text-xs font-body"
            >
              Add to Cart — ${currentSize.price * quantity}
            </Button>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-10">
              <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 px-0">
                {["description", "notes", "ingredients"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs uppercase tracking-[0.15em] px-0 pb-3"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="description" className="pt-6">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </TabsContent>
              <TabsContent value="notes" className="pt-6">
                <div className="space-y-4">
                  {(["top", "heart", "base"] as const).map((type) => (
                    <div key={type}>
                      <p className="text-xs uppercase tracking-widest text-accent mb-1">{type} notes</p>
                      <p className="text-muted-foreground">{product.notes[type].join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="ingredients" className="pt-6">
                <p className="text-muted-foreground text-sm">Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Citronellol, Geraniol.</p>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-3xl text-center mb-10">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
