import { SiteImage } from '@/components/SiteImage';
import { cafe } from '@/lib/site';

export function BeansMoment() {
  return (
    <section className="relative overflow-hidden py-10 md:py-16" aria-hidden>
      <div className="relative mx-auto h-[240px] max-w-[1180px] md:h-[380px]">
        <div className="absolute inset-x-[4%] top-0 bottom-0 overflow-hidden md:inset-x-[8%]">
          <SiteImage
            src={cafe.pour}
            alt=""
            fill
            className="animate-float object-cover object-[center_35%] scale-110"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-parchment via-parchment/20 to-parchment" />
          <div className="absolute inset-0 bg-gradient-to-r from-parchment via-transparent to-parchment" />
        </div>
        <p className="absolute inset-x-0 bottom-6 text-center font-display text-2xl italic text-roast/50 md:bottom-10 md:text-3xl">
          Roasted slow. Poured with care.
        </p>
      </div>
    </section>
  );
}
