import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  direction?: "center" | "left" | "bottom";
  delay?: number;
}

const clipPaths = {
  center: { hidden: "inset(40% 40% 40% 40%)", visible: "inset(0% 0% 0% 0%)" },
  left: { hidden: "inset(0 100% 0 0)", visible: "inset(0 0% 0 0)" },
  bottom: { hidden: "inset(100% 0 0 0)", visible: "inset(0% 0 0 0)" },
};

const ImageReveal = ({ src, alt, className = "", direction = "center", delay = 0 }: ImageRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      initial={{ clipPath: clipPaths[direction].hidden }}
      animate={isInView ? { clipPath: clipPaths[direction].visible } : {}}
      transition={{ duration: 1.2, delay, ease: [0.77, 0, 0.175, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        initial={{ scale: 1.2 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 1.6, delay, ease: [0.33, 1, 0.68, 1] }}
      />
    </motion.div>
  );
};

export default ImageReveal;
