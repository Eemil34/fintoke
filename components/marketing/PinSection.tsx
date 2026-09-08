'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function PinSection({
  children,
  cover = false,
  hold = true,
}: {
  children: ReactNode;
  cover?: boolean;
  hold?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const rest = () => {
      inner.style.position = 'relative';
      inner.style.top = '0px';
      inner.style.bottom = 'auto';
      inner.style.left = 'auto';
      inner.style.right = 'auto';
      inner.style.width = '100%';
      inner.style.zIndex = '0';
    };

    const measure = () => {
      rest();
      heightRef.current = inner.offsetHeight;
      wrap.style.height = hold ? `${heightRef.current + window.innerHeight}px` : '';
      pin();
    };

    const pin = () => {
      if (!hold) {
        rest();
        return;
      }
      const H = heightRef.current;
      const VH = window.innerHeight;
      if (!H) return;
      const rect = wrap.getBoundingClientRect();
      const pinnedTop = Math.min(0, VH - H);

      if (rect.top > pinnedTop) {
        rest();
        return;
      }
      if (rect.bottom > VH) {
        inner.style.position = 'fixed';
        inner.style.top = `${pinnedTop}px`;
        inner.style.bottom = 'auto';
        inner.style.left = '0';
        inner.style.right = '0';
        inner.style.width = '100%';
        inner.style.zIndex = '1';
        return;
      }
      inner.style.position = 'absolute';
      inner.style.top = 'auto';
      inner.style.bottom = '0';
      inner.style.left = '0';
      inner.style.right = '0';
      inner.style.width = '100%';
      inner.style.zIndex = '1';
    };

    measure();
    const ro = new ResizeObserver(() => {
      if (inner.style.position === 'fixed' || inner.style.position === 'absolute') return;
      measure();
    });
    ro.observe(inner);
    window.addEventListener('scroll', pin, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', pin);
      window.removeEventListener('resize', measure);
    };
  }, [hold]);

  return (
    <div ref={wrapRef} className="gcore-pin">
      <div ref={innerRef} className={cover ? 'gcore-cover' : ''}>
        {children}
      </div>
    </div>
  );
}
