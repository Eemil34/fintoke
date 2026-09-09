import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBody } from '@/components/PageBody';
import { CtaBand } from '@/components/CtaBand';

export default function Page() {
  return (
    <>
      <Header />
      <PageBody slug="gallery" />
      <CtaBand />
      <Footer />
    </>
  );
}
