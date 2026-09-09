'use client';

import { useState } from 'react';

const items = [
  {
    title: 'Equipment that stays ready',
    body: 'Competition plates, calibrated bars, and machines serviced on a daily checklist — not when something breaks.',
  },
  {
    title: 'Coaches on the floor',
    body: 'Certified trainers program your week, correct form in real time, and keep sessions honest without the hype script.',
  },
  {
    title: 'A real class calendar',
    body: 'Strength, conditioning, hybrid, and mobility blocks that rotate with intent — so you always know what you’re walking into.',
  },
  {
    title: 'Quietly competitive culture',
    body: 'Members who show up. Spot when asked. Leave ego in the locker. The room does the rest.',
  },
];

export function WhyAccordion() {
  const [open, setOpen] = useState(1);

  return (
    <div className="flex flex-col divide-y divide-ink-line border border-ink-line bg-ink-card/60">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => setOpen(isOpen ? -1 : i)}
            className="px-5 py-5 text-left transition hover:bg-ink-elev/60 md:px-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist">
                  0{i + 1}
                </span>
                <p
                  className={`mt-2 font-display text-xl font-semibold tracking-wide md:text-2xl ${
                    isOpen ? 'text-electric' : 'text-white'
                  }`}
                >
                  {item.title}
                </p>
              </div>
              <span className="mt-1 text-mist">{isOpen ? '−' : '+'}</span>
            </div>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-xl pb-1 pt-3 text-sm leading-relaxed text-mist">{item.body}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
