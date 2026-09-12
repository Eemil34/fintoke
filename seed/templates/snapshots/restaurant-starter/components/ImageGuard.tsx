'use client';

import { useEffect } from 'react';

const RELIABLE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80";
const DATA_URI = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20800%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%20role%3D%22img%22%20aria-hidden%3D%22true%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23d9d4c8%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2252%25%22%20stop-color%3D%22%23b7c2b4%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23cbb89a%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221200%22%20height%3D%22800%22%20fill%3D%22url(%23g)%22%2F%3E%0A%20%20%3Cg%20fill%3D%22none%22%20stroke%3D%22rgba(44%2C36%2C22%2C0.16)%22%20stroke-width%3D%2210%22%20stroke-linejoin%3D%22round%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M40%20640%20L320%20330%20L510%20510%20L780%20240%20L1160%20640%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%20%20%3Ccircle%20cx%3D%22900%22%20cy%3D%22170%22%20r%3D%2254%22%20fill%3D%22rgba(255%2C255%2C255%2C0.42)%22%2F%3E%0A%3C%2Fsvg%3E%0A";

function patchBrokenImage(img: HTMLImageElement) {
  const src = img.getAttribute('src') || img.currentSrc || '';
  if (src.startsWith('data:image/')) return;
  img.removeAttribute('srcset');
  img.srcset = '';
  img.style.opacity = '1';
  img.style.visibility = 'visible';
  img.style.objectFit = 'cover';
  if (src !== RELIABLE && img.dataset.clbReliable !== '1') {
    img.dataset.clbReliable = '1';
    img.src = RELIABLE;
    return;
  }
  img.dataset.clbFallback = '1';
  img.src = DATA_URI;
}

function isBrokenImage(img: HTMLImageElement) {
  const src = (img.getAttribute('src') || '').trim();
  if (!src || src === 'undefined' || src === 'null' || src === '#') return true;
  if (src.startsWith('data:image/')) return false;
  return img.complete && img.naturalWidth === 0;
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
        if (isBrokenImage(img)) patchBrokenImage(img);
      });
    };

    scan();
    const timer = window.setInterval(scan, 1200);
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => {
      document.removeEventListener('error', onError, true);
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
