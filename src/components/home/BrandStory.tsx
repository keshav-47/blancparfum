import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const storyBlocks = [
  {
    label: "Origins",
    title: "Born from Obsession",
    text: "BLANC was founded on a single, uncompromising principle: that scent is the most powerful form of identity. Every bottle is a distillation of years of relentless pursuit.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80",
  },
  {
    label: "Craft",
    title: "The Art of the Nose",
    text: "Our master perfumers source the rarest ingredients from six continents — Grasse jasmine, Indian oud, Madagascan vanilla — composing each fragrance like a symphony.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=900&q=80",
  },
  {
    label: "Philosophy",
    title: "Less is Everything",
    text: "We don't follow trends. We create legacies — fragrances that become part of your identity, your memories, your story. Blanc is not a brand. It's a belief.",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=900&q=80",
  },
];

const BrandStory = () => {
  return (
    <section aria-label="Brand Story">
      {storyBlocks.map((block, i) => (
        <StickyRevealBlock key={i} block={block} index={i} />
      ))}
    </section>
  );
};

const StickyRevealBlock = ({
  block,
  index,
}: {
  block: (typeof storyBlocks)[0];
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const textY = useTransform(scrollYProgress, [0.1, 0.4], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.35]);

  const isReversed = index % 2 !== 0;

  return (
    <div ref={ref} className="h-[130vh] relative">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background image with parallax zoom */}
        <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
          <img
            src={block.image}
            alt={block.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: overlayOpacity }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
          <div
            className={`flex flex-col ${
              isReversed ? "items-end text-right" : "items-start text-left"
            } max-w-xl ${isReversed ? "ml-auto" : ""}`}
          >
            <motion.div style={{ y: textY, opacity: textOpacity }}>
              <p className="text-xs font-body uppercase tracking-[0.3em] text-accent mb-4">
                {block.label}
              </p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground leading-[1.1] mb-6">
                {block.title}
              </h2>
              <p className="font-body text-primary-foreground/70 leading-relaxed text-base md:text-lg max-w-md">
                {block.text}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandStory;
