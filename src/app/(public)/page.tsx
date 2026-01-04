"use client";
import {
  LandingHeader,
  HeroSection,
  SocialProofSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
} from "@/components/landing";
import ClickSpark from "@/components/ClickSpark";

export default function HomePage() {
  return (
    <ClickSpark
      sparkColor="rgba(16, 185, 129, 0.8)" // emerald-500
      sparkSize={8}
      sparkRadius={12}
      sparkCount={10}
      duration={500}
      easing="ease-out"
      extraScale={1.2}
    >
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <LandingHeader />

        <main className="flex-1">
          <HeroSection />
          <SocialProofSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
          <FaqSection />
          <FinalCtaSection />
        </main>

        <LandingFooter />
      </div>
    </ClickSpark>
  );
}
