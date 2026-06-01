import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { store } from "@/store";
import { lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import RootLayout from "@/components/layout/RootLayout";
import {
  HomeSkeleton,
  ShopSkeleton,
  ProductDetailSkeleton,
  CollectionDetailSkeleton,
  CartSkeleton,
  ProfileSkeleton,
  PageSkeleton,
} from "@/components/skeletons/PageSkeletons";

// Global Lenis instance
let lenisInstance: Lenis | null = null;

const SmoothScroll = () => {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    lenisInstance = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time: number) {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => { lenisInstance?.destroy(); lenisInstance = null; };
  }, []);
  return null;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Stop Lenis, force scroll to 0, then resume
    if (lenisInstance) {
      lenisInstance.stop();
      window.scrollTo(0, 0);
      // Small delay to let the DOM settle before resuming
      requestAnimationFrame(() => {
        lenisInstance?.start();
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CustomPerfume = lazy(() => import("./pages/CustomPerfume"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const Shop = lazy(() => import("./pages/Shop"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminGuard = lazy(() => import("./components/admin/AdminGuard"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCollections = lazy(() => import("./pages/admin/Collections"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCustomRequests = lazy(() => import("./pages/admin/CustomRequests"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Wrap a lazy page in a Suspense whose fallback is a skeleton matching that
// page's layout. The fallback renders inside RootLayout's main (below the
// persistent navbar), so it's a content-only skeleton — no chrome of its own.
const route = (node: ReactNode, skeleton: ReactNode) => (
  <Suspense fallback={skeleton}>{node}</Suspense>
);

const App = () => (
  <Provider store={store}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SmoothScroll />
            <ScrollToTop />
            <Routes>
              {/* Public routes share a persistent shell: the navbar/footer stay
                  mounted and only the page content cross-dissolves. */}
              <Route element={<RootLayout />}>
                <Route path="/" element={route(<Index />, <HomeSkeleton />)} />
                <Route path="/shop" element={route(<Shop />, <ShopSkeleton />)} />
                <Route path="/collection/:slug" element={route(<CollectionDetail />, <CollectionDetailSkeleton />)} />
                <Route path="/product/:id" element={route(<ProductDetail />, <ProductDetailSkeleton />)} />
                <Route path="/custom" element={route(<CustomPerfume />, <PageSkeleton />)} />
                <Route path="/cart" element={route(<Cart />, <CartSkeleton />)} />
                <Route path="/about" element={route(<About />, <PageSkeleton />)} />
                <Route path="/contact" element={route(<Contact />, <PageSkeleton />)} />
                <Route path="/pricing" element={route(<Pricing />, <PageSkeleton />)} />
                <Route path="/login" element={route(<Login />, <PageSkeleton />)} />
                <Route path="/complete-profile" element={route(<CompleteProfile />, <PageSkeleton />)} />
                <Route path="/profile" element={route(<Profile />, <ProfileSkeleton />)} />
                <Route path="/privacy" element={route(<Privacy />, <PageSkeleton />)} />
                <Route path="/terms" element={route(<Terms />, <PageSkeleton />)} />
                <Route path="/refund-policy" element={route(<RefundPolicy />, <PageSkeleton />)} />
                <Route path="*" element={route(<NotFound />, <PageSkeleton />)} />
              </Route>
              {/* Admin routes — own sidebar chrome (AdminLayout), guarded by role. */}
              <Route element={route(<AdminGuard />, <PageSkeleton />)}>
                <Route element={route(<AdminLayout />, <PageSkeleton />)}>
                  <Route path="/admin" element={route(<AdminDashboard />, <PageSkeleton />)} />
                  <Route path="/admin/products" element={route(<AdminProducts />, <PageSkeleton />)} />
                  <Route path="/admin/collections" element={route(<AdminCollections />, <PageSkeleton />)} />
                  <Route path="/admin/orders" element={route(<AdminOrders />, <PageSkeleton />)} />
                  <Route path="/admin/custom-requests" element={route(<AdminCustomRequests />, <PageSkeleton />)} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </Provider>
);

export default App;
