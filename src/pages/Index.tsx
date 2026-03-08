import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import ProductGrid from "@/components/home/ProductGrid";
import BrandStory from "@/components/home/BrandStory";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <BrandStory />
      <FeaturedCollections />
      <ProductGrid />
    </Layout>
  );
};

export default Index;
