import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/home/HeroCarousel";
import BrandMarquee from "@/components/home/BrandMarquee";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import ProductGrid from "@/components/home/ProductGrid";
import HorizontalProductScroll from "@/components/home/HorizontalProductScroll";
import SEO from "@/components/SEO";
import { HomeSkeleton } from "@/components/skeletons/PageSkeletons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts, fetchCollections } from "@/store/slices/productsSlice";

const Index = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCollections());
  }, [dispatch]);

  // First load: show the home skeleton until the product data arrives.
  if (loading && items.length === 0) {
    return (
      <Layout>
        <HomeSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        canonical="/"
        description="Shop handcrafted Extrait de Parfum by BLANC PARFUM. Luxury niche fragrances for men, women & unisex — crafted in India with the world's rarest ingredients."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "BLANC PARFUM",
          "url": "https://blancparfum.in",
          "description": "Handcrafted Extrait de Parfum. Luxury niche fragrances crafted in India.",
          "priceRange": "\u20B9\u20B9\u20B9",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Meerut",
            "addressRegion": "Uttar Pradesh",
            "addressCountry": "IN",
          },
        }}
      />
      <main>
        <HeroCarousel />
        <BrandMarquee />
        <HorizontalProductScroll />
        <FeaturedCollections />
        <ProductGrid />
      </main>
    </Layout>
  );
};

export default Index;
