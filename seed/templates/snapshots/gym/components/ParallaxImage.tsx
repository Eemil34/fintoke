'use client';

import { useEffect, useRef } from 'react';
import { SiteImage } from './SiteImage';

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  strength?: number;
};

/** Subtle scroll parallax on a filled image layer. */
export function ParallaxImage({
  src,
  alt,
  className = '',
  priority,
  sizes = '100vw',
  strength = 12,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf = 0;
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = (view - rect.top) / (view + rect.height);
      const y = (progress - 0.5) * strength;
      img.style.transform = `translate3d(0, ${y}%, 0) scale(1.08)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [strength]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <div ref={imgRef} className="absolute inset-[-6%] will-change-transform">
        <SiteImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={className}
          sizes={sizes}
        />
      </div>
    </div>
  );
}
