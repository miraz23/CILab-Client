import Banner from "@/components/home/Banner";
import FaqSection from "@/components/home/FaqSection";
import FeaturedNews from "@/components/home/FeaturedNews";
import Founder from "@/components/home/Founder";
import Introduction from "@/components/home/Introduction";
import Resources from "@/components/home/Resources";
import { getPublishedAnnouncements } from "@/lib/api/announcements";

export default async function Home() {
  const announcements = await getPublishedAnnouncements();

  return (
    <div>
      <Banner />
      <Introduction />
      <Resources />
      <Founder />
      <FeaturedNews notices={announcements} />
      <FaqSection />
    </div>
  );
}
