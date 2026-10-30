import Banner from "@/components/home/Banner";
import FaqSection from "@/components/home/FaqSection";
import FeaturedNews from "@/components/home/FeaturedNews";
import Resources from "@/components/home/Resources";

export default function Home() {
  return (
    <div>
      <Banner />
      <Resources />
      <FeaturedNews />
      <FaqSection />
    </div>
  );
}
