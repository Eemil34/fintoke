'use client';

import { useEffect } from 'react';

const FALLBACK = '/images/fallback.svg';

function patchBrokenImage(img: HTMLImageElement) {
  if (img.dataset.clbFallback === '1') return;
  if (img.getAttribute('src') === FALLBACK) return;
  img.dataset.clbFallback = '1';
  img.removeAttribute('srcset');
  img.srcset = '';
  img.src = FALLBACK;
  img.style.opacity = '1';
  img.style.visibility = 'visible';
  img.style.objectFit = 'cover';
}

export function ImageGuard() {
  useEffect(() => {
    const onError = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) patchBrokenImage(target);
    };
    document.addEventListener('error', onError, true);

    const scan = () => {
      document.querySelectorAll('img').forEach((img) => {
        if (
          img.complete &&
          img.naturalWidth === 0 &&
          img.getAttribute('src') &&
          img.getAttribute('src') !== FALLBACK
        ) {
          patchBrokenImage(img);
        }
      });
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => {
      document.removeEventListener('error', onError, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
