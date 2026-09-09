'use client';

import Image from 'next/image';
import { useState } from 'react';

const FALLBACK = '/images/fallback.svg';

type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
};

export function SiteImage({
  src,
  alt,
  className = '',
  fill,
  width,
  height,
  priority,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: SiteImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK);

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        referrerPolicy="no-referrer"
        onError={() => setCurrentSrc(FALLBACK)}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      priority={priority}
      referrerPolicy="no-referrer"
      onError={() => setCurrentSrc(FALLBACK)}
    />
  );
}
