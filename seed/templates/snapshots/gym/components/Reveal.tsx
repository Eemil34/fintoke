'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** up | left | right | scale | fade */
  variant?: 'up' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${shown ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
