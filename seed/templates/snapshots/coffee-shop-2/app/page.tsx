import { Hero } from '@/components/Hero';
import { BrandStrip } from '@/components/BrandStrip';
import { WhyBeans } from '@/components/WhyBeans';
import { BeansMoment } from '@/components/BeansMoment';
import { FeatureStories } from '@/components/FeatureStories';
import { Collection } from '@/components/Collection';
import { Newsletter } from '@/components/Newsletter';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-parchment text-roast">
      <Hero />
      <BrandStrip />
      <WhyBeans />
      <BeansMoment />
      <FeatureStories />
      <Collection />
      <Newsletter />
    </main>
  );
}
