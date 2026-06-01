// Real perfume bottle on a white background. mix-blend-multiply drops the white
// against the (white) section behind it, so it reads as a cut-out product shot
// with no editing. https://wesbos.com/tip/mix-blend-mode-multiply-remove-backgrounds
const BOTTLE_SRC =
  "https://images.unsplash.com/photo-1619352704218-ab07491b9353?w=900&q=80&auto=format&fit=crop";

const BottlePhoto = ({ className }: { className?: string }) => (
  <img
    src={BOTTLE_SRC}
    alt="BLANC Parfum bottle"
    loading="lazy"
    className={className}
    style={{ mixBlendMode: "multiply" }}
  />
);

export default BottlePhoto;
