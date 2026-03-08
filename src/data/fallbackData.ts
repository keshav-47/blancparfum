import { Product, Collection, Order, CustomRequest } from "@/types";

export const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Noir Absolu",
    tagline: "Dark. Magnetic. Unforgettable.",
    price: 185,
    category: "men",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
      "https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?w=800",
    ],
    sizes: [
      { ml: 30, price: 95 },
      { ml: 50, price: 145 },
      { ml: 100, price: 185 },
    ],
    description: "A bold, intoxicating fragrance built on smoky oud, black leather, and a whisper of vanilla. Noir Absolu commands every room.",
    notes: {
      top: ["Black Pepper", "Bergamot", "Cardamom"],
      heart: ["Oud", "Leather", "Iris"],
      base: ["Vanilla", "Amber", "Sandalwood"],
    },
    isNew: true,
    isFeatured: true,
  },
  {
    id: "2",
    name: "Lumière d'Or",
    tagline: "Golden hour, bottled.",
    price: 220,
    category: "women",
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
    ],
    sizes: [
      { ml: 30, price: 110 },
      { ml: 50, price: 170 },
      { ml: 100, price: 220 },
    ],
    description: "A radiant, warm fragrance that wraps you in golden light. Jasmine absolute meets honeyed amber in a scent that glows from within.",
    notes: {
      top: ["Mandarin", "Pink Pepper", "Pear"],
      heart: ["Jasmine Absolute", "Tuberose", "Rose de Mai"],
      base: ["Amber", "Musk", "Tonka Bean"],
    },
    isNew: false,
    isFeatured: true,
  },
  {
    id: "3",
    name: "Eau Sauvage",
    tagline: "Raw nature, refined.",
    price: 160,
    category: "unisex",
    images: [
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800",
    ],
    sizes: [
      { ml: 30, price: 80 },
      { ml: 50, price: 125 },
      { ml: 100, price: 160 },
    ],
    description: "A fresh, untamed scent inspired by wild coastlines and morning dew. Vetiver and sea salt meet crisp citrus for an invigorating experience.",
    notes: {
      top: ["Sea Salt", "Lemon", "Grapefruit"],
      heart: ["Vetiver", "Geranium", "Lavender"],
      base: ["Driftwood", "White Musk", "Cedarwood"],
    },
    isNew: true,
    isFeatured: false,
  },
  {
    id: "4",
    name: "Velvet Rose",
    tagline: "Petals on skin.",
    price: 195,
    category: "women",
    images: [
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800",
      "https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=800",
    ],
    sizes: [
      { ml: 30, price: 100 },
      { ml: 50, price: 155 },
      { ml: 100, price: 195 },
    ],
    description: "An opulent rose fragrance with a velvety depth. Centifolia rose petals layered with saffron and dark plum create a scent of pure luxury.",
    notes: {
      top: ["Saffron", "Pink Pepper", "Raspberry"],
      heart: ["Centifolia Rose", "Peony", "Geranium"],
      base: ["Plum", "Patchouli", "Cashmere Wood"],
    },
    isNew: false,
    isFeatured: true,
  },
  {
    id: "5",
    name: "Blanc Pure",
    tagline: "The essence of nothing. And everything.",
    price: 250,
    category: "unisex",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?w=800",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    ],
    sizes: [
      { ml: 30, price: 130 },
      { ml: 50, price: 195 },
      { ml: 100, price: 250 },
    ],
    description: "Our signature scent. A minimalist masterpiece of clean musks, aldehydes, and a single perfect white flower. Blanc Pure is the scent of your best self.",
    notes: {
      top: ["Aldehydes", "Bergamot", "White Tea"],
      heart: ["White Iris", "Lily of the Valley", "Cotton Flower"],
      base: ["White Musk", "Cashmeran", "Ambroxan"],
    },
    isNew: true,
    isFeatured: true,
  },
  {
    id: "6",
    name: "Tabac Mystique",
    tagline: "Smoke and mirrors.",
    price: 175,
    category: "men",
    images: [
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800",
    ],
    sizes: [
      { ml: 30, price: 90 },
      { ml: 50, price: 140 },
      { ml: 100, price: 175 },
    ],
    description: "A sophisticated tobacco-inspired fragrance with aromatic herbs and warm spices. For the modern gentleman who leaves a lasting impression.",
    notes: {
      top: ["Cinnamon", "Clove", "Nutmeg"],
      heart: ["Tobacco Leaf", "Labdanum", "Honey"],
      base: ["Benzoin", "Tonka Bean", "Vetiver"],
    },
    isNew: false,
    isFeatured: false,
  },
];

export const fallbackCollections: Collection[] = [
  {
    id: "c1",
    name: "The Signature Line",
    description: "Our most iconic fragrances, redefined for the modern era.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200",
    productIds: ["1", "5"],
  },
  {
    id: "c2",
    name: "Floral Opulence",
    description: "Where petals meet luxury.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1200",
    productIds: ["2", "4"],
  },
  {
    id: "c3",
    name: "Fresh & Wild",
    description: "Nature's most captivating moments, captured.",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=1200",
    productIds: ["3", "6"],
  },
];

export const fallbackOrders: Order[] = [
  {
    id: "ord-001",
    date: "2025-12-15",
    status: "delivered",
    items: [
      { productId: "1", name: "Noir Absolu", size: 100, quantity: 1, price: 185 },
      { productId: "2", name: "Lumière d'Or", size: 50, quantity: 1, price: 170 },
    ],
    total: 355,
  },
  {
    id: "ord-002",
    date: "2026-01-28",
    status: "shipped",
    items: [
      { productId: "5", name: "Blanc Pure", size: 100, quantity: 2, price: 250 },
    ],
    total: 500,
  },
];

export const fallbackCustomRequests: CustomRequest[] = [
  {
    id: "cr-001",
    date: "2026-02-10",
    status: "in_progress",
    scentFamilies: ["Woody", "Oriental"],
    notes: "Something warm and comforting for evening wear",
    intensity: "strong",
    occasion: "evening",
  },
];
