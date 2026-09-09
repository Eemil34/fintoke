import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HomeSections } from '@/components/HomeSections';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
