import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product } from "@/types";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.isNew && (
            <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-[10px] font-body uppercase tracking-widest px-3 py-1">
              New
            </span>
          )}
        </div>
        <div className="text-center">
          <h3 className="font-display text-xl md:text-2xl font-medium text-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2">
            {product.tagline}
          </p>
          <p className="font-body text-sm text-foreground">
            From ${product.sizes[0].price}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
