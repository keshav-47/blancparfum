export interface ProductSize {
  ml: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  category: "men" | "women" | "unisex";
  images: string[];
  sizes: ProductSize[];
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  isNew: boolean;
  isFeatured: boolean;
  isActive?: boolean;
  stockQuantity?: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  productIds: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: number;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  size: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  avatar?: string | null;
  role?: "USER" | "ADMIN";
  addresses: Address[];
}

export interface DashboardStats {
  totalRevenue: number;
  processingOrders: number;
  shippedOrders: number;
  pendingCustomRequests: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface CustomRequest {
  id: string;
  date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  scentFamilies: string[];
  preferredNotes?: string[];
  occasion: string;
  intensity: "light" | "moderate" | "strong";
  message?: string;
  notes?: string;
}
