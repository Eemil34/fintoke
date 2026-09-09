import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Platform } from '@/components/Platform';
import { HowItWorks } from '@/components/HowItWorks';
import { Customers } from '@/components/Customers';
import { Pricing } from '@/components/Pricing';
import { FinalCta, Footer } from '@/components/FinalCta';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <Platform />
      <HowItWorks />
      <Customers />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
}
