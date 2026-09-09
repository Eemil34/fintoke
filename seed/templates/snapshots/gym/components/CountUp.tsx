'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  className?: string;
};

/** Animates numeric portion of strings like "15", "12k", "80" when scrolled into view. */
export function CountUp({ value, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const match = value.match(/^(\d+)([a-zA-Z+]*)$/);
    if (!match || reduce) {
      setDisplay(value);
      return;
    }

    const target = Number(match[1]);
    const suffix = match[2] ?? '';

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const duration = 1100;
        const start = performance.now();

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(`${Math.round(target * eased)}${suffix}`);
          if (t < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
