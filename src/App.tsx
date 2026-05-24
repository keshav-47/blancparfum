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
import { lazy, Suspense, useEffect, useRef } from "react";
import Lenis from "lenis";
import RouteFallback from "@/components/RouteFallback";

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
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/collection/:slug" element={<CollectionDetail />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/custom" element={<CustomPerfume />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                {/* Admin routes — guarded by role check */}
                <Route element={<AdminGuard />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/collections" element={<AdminCollections />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/custom-requests" element={<AdminCustomRequests />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </Provider>
);

export default App;
