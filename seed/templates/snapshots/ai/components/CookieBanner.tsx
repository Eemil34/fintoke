'use client';

import { useState } from 'react';

export function CookieBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 bottom-20 md:bottom-24 z-20 px-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-[#1c1c1c]/95 backdrop-blur-md px-5 py-4 border border-[#2a2a2a]">
        <p className="text-[0.8rem] leading-relaxed text-[#d4d4d4] max-w-2xl">
          We use cookies to improve your experience on our site. By using our site you consent
          cookies.{' '}
          <a href="#cookies" className="text-hr-green hover:underline">
            Cookie Policy
          </a>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-md bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333] transition"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-md bg-hr-green-bright px-4 py-2 text-sm font-semibold text-black hover:brightness-110 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
