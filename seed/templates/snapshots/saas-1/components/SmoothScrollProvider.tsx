'use client';

import type { ReactNode } from 'react';

/** Enables smooth page scroll; pairs with CSS scroll-behavior. */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <div className="scroll-smooth">{children}</div>;
}
