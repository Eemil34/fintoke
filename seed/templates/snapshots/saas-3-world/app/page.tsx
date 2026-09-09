import { EarthContinue, Hero } from '@/components/Hero';
import {
  EcoRoutingSection,
  FeatureCards,
  ModelsSection,
  PricingSection,
  SiteFooter,
} from '@/components/Sections';

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-ink text-white">
      <Hero />
      <EarthContinue>
        <FeatureCards />
      </EarthContinue>
      <EcoRoutingSection />
      <ModelsSection />
      <PricingSection />
      <SiteFooter />
    </main>
  );
}
