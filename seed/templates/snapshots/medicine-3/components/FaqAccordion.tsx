'use client';

import { useState } from 'react';

type FaqItem = {
  title: string;
  body: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-brand-fg/10 rounded-[1.5rem] border border-brand-fg/10 bg-brand-surface">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.title} className="px-5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              onClick={() => setOpen(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="font-semibold">{item.title}</span>
              <span className="text-brand">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen ? <p className="pb-5 text-sm leading-6 text-brand-muted">{item.body}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
