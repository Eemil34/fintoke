// Managed by Claudable. Restores broken photos so generated sites never show empty frames.
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

try {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) patchBrokenImage(target);
    },
    true,
  );

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
} catch {
  // Preview should still boot if this file is evaluated too early.
}
