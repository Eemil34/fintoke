import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CookieBanner } from '@/components/CookieBanner';
import { ChooseAdventure } from '@/components/ChooseAdventure';
import { AiChanging } from '@/components/AiChanging';
import { GenAiMundane } from '@/components/GenAiMundane';
import { SkillsPath } from '@/components/SkillsPath';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <div className="relative bg-black min-h-[110vh] md:min-h-[118vh] flex flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(61,255,139,0.12),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(104,227,157,0.05),transparent_35%),radial-gradient(circle_at_85%_40%,rgba(61,255,139,0.06),transparent_30%)]" />
        <Header />
        <Hero />
        <CookieBanner />
      </div>
      <ChooseAdventure />
      <AiChanging />
      <GenAiMundane />
      <SkillsPath />
      <Footer />
    </main>
  );
}
