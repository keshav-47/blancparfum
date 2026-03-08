import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Link } from "react-router-dom";

const FeaturedCollections = () => {
  const collections = useAppSelector((state) => state.products.collections);

  return (
    <section className="py-20 px-4 lg:px-8 bg-secondary/50">
      <div className="container mx-auto">
        <h2 className="font-display text-4xl md:text-5xl text-center mb-4">Collections</h2>
        <p className="text-center text-muted-foreground text-sm uppercase tracking-[0.2em] mb-12">
          Curated for every mood
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link to="/" className="group block relative aspect-[3/4] overflow-hidden">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-primary-foreground">
                  <h3 className="font-display text-2xl md:text-3xl mb-2">{col.name}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                    {col.description}
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

export default FeaturedCollections;
