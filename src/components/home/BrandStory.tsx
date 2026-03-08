import { motion } from "framer-motion";

const BrandStory = () => {
  return (
    <section className="py-24 px-4 lg:px-8">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs font-body uppercase tracking-[0.3em] text-accent mb-6">Our Story</p>
          <h2 className="font-display text-4xl md:text-6xl font-light leading-tight mb-8">
            Where Art Meets Alchemy
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-2xl mx-auto mb-8">
            BLANC was born from a singular belief: that fragrance is the most intimate form of self-expression. 
            Each scent in our collection is a carefully composed symphony of rare ingredients, 
            sourced from the world's finest perfumeries and blended with an artist's precision.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            We don't follow trends. We create legacies — fragrances that become part of your identity, 
            your memories, your story.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;
