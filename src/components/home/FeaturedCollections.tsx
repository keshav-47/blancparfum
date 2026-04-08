import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedCollections = () => {
  const collections = useAppSelector((state) => state.products.collections);

  if (!collections.length) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">
            Curated
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light">Collections</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <Link to="/shop" className="group block relative aspect-[3/4] overflow-hidden rounded-lg">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 className="font-display text-2xl md:text-3xl text-white mb-1.5">
                    {col.name}
                  </h3>
                  <p className="text-[11px] font-body text-white/60 uppercase tracking-[0.15em] mb-4">
                    {col.description}
                  </p>
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
  );
};

export default FeaturedCollections;
