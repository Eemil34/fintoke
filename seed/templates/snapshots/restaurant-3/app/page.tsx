import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { HomeSections } from '@/components/HomeSections';
import { CtaBand } from '@/components/CtaBand';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <HomeSections />
      <CtaBand />
      <Footer />
    </>
  );
}
