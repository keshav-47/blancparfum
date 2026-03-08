import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import ProductGrid from "@/components/home/ProductGrid";
import BrandStory from "@/components/home/BrandStory";
import HorizontalProductScroll from "@/components/home/HorizontalProductScroll";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <BrandStory />
      <HorizontalProductScroll />
      <FeaturedCollections />
      <ProductGrid />
    </Layout>
  );
};

export default Index;
