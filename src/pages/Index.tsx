import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import ProductGrid from "@/components/home/ProductGrid";
import HorizontalProductScroll from "@/components/home/HorizontalProductScroll";
import SEO from "@/components/SEO";
import { useAppDispatch } from "@/store/hooks";
import { fetchProducts, fetchCollections } from "@/store/slices/productsSlice";

const Index = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCollections());
  }, [dispatch]);

  return (
    <Layout>
      <SEO
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "BLANC PARFUM",
          "url": "https://blancparfum.lovable.app",
          "description": "Handcrafted Extrait de Parfum. Luxury niche fragrances.",
          "priceRange": "$$$",
        }}
      />
      <main>
        <HeroCarousel />
        <HorizontalProductScroll />
        <FeaturedCollections />
        <ProductGrid />
      </main>
    </Layout>
  );
};

export default Index;
