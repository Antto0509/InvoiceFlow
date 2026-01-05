"use client";
import {
  LandingHeader,
  LandingBackground,
  HeroSection,
  SocialProofSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
} from "@/components/landing";
import ClickSpark from "@/components/ui/react-bits/ClickSpark";

export default function HomePage() {
  return (
    <ClickSpark
      sparkColor="rgba(16, 185, 129, 0.8)"
      sparkSize={8}
      sparkRadius={12}
      sparkCount={10}
      duration={500}
      easing="ease-out"
      extraScale={1.2}
    >
      <LandingBackground />

      <div className="relative min-h-screen bg-transparent text-foreground flex flex-col">
        <LandingHeader />

        <main className="relative z-10 flex-1">
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
