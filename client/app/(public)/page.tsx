import { CtaSection } from "@/components/home/cta-section";
import { FeaturedServices } from "@/components/home/featured-services";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PopularCategories } from "@/components/home/popular-categories";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { WhyChooseFixMate } from "@/components/home/why-choose-fixmate";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCategories />
      <FeaturedServices />
      <HowItWorks />
      <WhyChooseFixMate />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
