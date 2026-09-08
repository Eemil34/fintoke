'use client';

import type { ReactNode } from 'react';

const TRACE_DIM = [
  'M 144 96 H 268 L 368 196 H 518',
  'M 144 96 H 210 L 250 136 H 340 L 400 196 H 518',
  'M 96 226 H 200 L 240 196 H 518',
  'M 96 250 H 518',
  'M 96 274 H 200 L 240 304 H 518',
  'M 144 404 H 268 L 368 286 H 518',
  'M 144 404 H 210 L 250 364 H 340 L 400 304 H 518',
  'M 1056 96 H 932 L 832 196 H 682',
  'M 1056 96 H 990 L 950 136 H 860 L 800 196 H 682',
  'M 1104 226 H 1000 L 960 196 H 682',
  'M 1104 250 H 682',
  'M 1104 274 H 1000 L 960 304 H 682',
  'M 1056 404 H 932 L 832 286 H 682',
  'M 1056 404 H 990 L 950 364 H 860 L 800 304 H 682',
  'M 547 168 V 70 L 507 30 H 360',
  'M 577 168 V 88 H 430 L 390 48',
  'M 601 168 V 88 H 770 L 810 48',
  'M 637 168 V 70 L 677 30 H 840',
  'M 547 336 V 528',
  'M 577 336 V 500 L 537 540',
  'M 601 336 V 500 L 641 540',
  'M 637 336 V 528',
  'M 518 196 H 400 L 360 156 V 80',
  'M 518 226 H 380 L 340 186',
  'M 518 286 H 380 L 340 326',
  'M 682 196 H 800 L 840 156 V 80',
  'M 682 226 H 820 L 860 186',
  'M 682 286 H 820 L 860 326',
];

const TRACE_MAIN = [
  TRACE_DIM[0],
  TRACE_DIM[3],
  TRACE_DIM[5],
  TRACE_DIM[7],
  TRACE_DIM[10],
  TRACE_DIM[12],
];

const PULSES = [
  { d: TRACE_DIM[0], delay: '0s', duration: '5.2s', reverse: false },
  { d: TRACE_DIM[5], delay: '2.4s', duration: '5.6s', reverse: true },
  { d: TRACE_DIM[7], delay: '1.1s', duration: '5.4s', reverse: false },
];

const PINS = [21, 51, 75, 111];

export default function AiCircuit() {
  return (
    <svg className="mx-auto h-[360px] w-full max-w-[1100px] opacity-80 sm:h-[470px]" viewBox="0 0 1200 540" fill="none" aria-hidden>
      <defs>
        <linearGradient id="gc-core" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffd7b0" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ff8a3a" />
          <stop offset="100%" stopColor="#ff5c00" />
        </linearGradient>
        <linearGradient id="gc-chip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#101010" />
        </linearGradient>
        <linearGradient id="gc-node" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#181818" />
          <stop offset="100%" stopColor="#101010" />
        </linearGradient>
        <filter id="gc-spark" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="1.15" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {TRACE_DIM.map((d) => (
        <path key={d} d={d} stroke="#1f1f1f" strokeWidth="1.05" strokeLinejoin="miter" />
      ))}
      {TRACE_MAIN.map((d) => (
        <path key={`m-${d}`} d={d} stroke="#2a2a2a" strokeWidth="1.15" strokeLinejoin="miter" />
      ))}
      {PULSES.map((pulse, index) => (
        <path
          key={index}
          d={pulse.d}
          stroke="url(#gc-core)"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeDasharray="26 280"
          filter="url(#gc-spark)"
          className={pulse.reverse ? 'gcore-pulse-rev' : 'gcore-pulse'}
          style={{ animationDelay: pulse.delay, animationDuration: pulse.duration }}
        />
      ))}

      <Node x="92" y="70">
        <path d="M16 36 V16 h6 l8 12 V16 h6 v20 h-6 l-8-12 v12 H16 Z" fill="#8a8a8a" />
      </Node>
      <Node x="44" y="224">
        <path d="M16 20 h8 v-4 h4 v4 h8 v4 h-8 v8 h-4 v-8 h-8 V20 Z M20 36 h12 v4 H20 v-4 Z" fill="#8a8a8a" />
      </Node>
      <Node x="92" y="378">
        <path d="M10 40 V18 L18 30 V40 H10 Z" fill="#6a3a1c" />
        <path d="M18 40 V14 L26 26 V40 H18 Z" fill="#7a3a16" />
        <path d="M26 40 V14 L34 26 V40 H26 Z" fill="#6b5424" />
        <path d="M34 40 V26 L42 18 V40 H34 Z" fill="#6a4030" />
      </Node>
      <Node x="1056" y="70">
        <path
          d="M26 12 l3.2 7.2 7.8 1-5.6 5.2 1.5 7.8L26 29.4 19.1 33.2l1.5-7.8-5.6-5.2 7.8-1 L26 12 Z"
          fill="none"
          stroke="#8a8a8a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="24" r="2" fill="#8a8a8a" />
      </Node>
      <Node x="1104" y="224">
        <rect x="14" y="14" width="10" height="10" rx="1.5" fill="#5c2a1c" />
        <rect x="28" y="14" width="10" height="10" rx="1.5" fill="#3a4a1c" />
        <rect x="14" y="28" width="10" height="10" rx="1.5" fill="#1c3a52" />
        <rect x="28" y="28" width="10" height="10" rx="1.5" fill="#5c4a1c" />
      </Node>
      <Node x="1056" y="378">
        <path
          d="M26 12c1.1 0 2 .2 2.9.55l.3 4.6a7 7 0 0 1 3.8 2.2l4.1-2.1a10 10 0 0 1 2.9 5l-3.8 2.6c.27 1.05.27 2.15 0 3.2l3.8 2.6a10 10 0 0 1-2.9 5l-4.1-2.1a7 7 0 0 1-3.8 2.2l-.3 4.6A10 10 0 0 1 26 40a10 10 0 0 1-2.9-.55l-.3-4.6a7 7 0 0 1-3.8-2.2l-4.1 2.1a10 10 0 0 1-2.9-5l3.8-2.6a7.2 7.2 0 0 1 0-3.2l-3.8-2.6a10 10 0 0 1 2.9-5l4.1 2.1a7 7 0 0 1 3.8-2.2l.3-4.6A10 10 0 0 1 26 12Z"
          stroke="#8a8a8a"
          strokeWidth="1.2"
        />
      </Node>

      {PINS.map((offset) => (
        <g key={offset}>
          <rect x={526 + offset} y="169" width="5" height="6" rx="0.5" fill="#262626" />
          <rect x={526 + offset} y="329" width="5" height="6" rx="0.5" fill="#262626" />
          <rect x="520" y={175 + offset} width="6" height="5" rx="0.5" fill="#262626" />
          <rect x="674" y={175 + offset} width="6" height="5" rx="0.5" fill="#262626" />
        </g>
      ))}
      <rect x="526" y="175" width="148" height="148" rx="30" fill="url(#gc-chip)" stroke="#2a2a2a" />
      <text
        x="600"
        y="262"
        textAnchor="middle"
        fill="#6f6f6f"
        fontSize="40"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        letterSpacing="8"
      >
        AI
      </text>
    </svg>
  );
}

function Node({ x, y, children }: { x: string; y: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0.5" y="0.5" width="51" height="51" rx="13" fill="url(#gc-node)" stroke="#2a2a2a" />
      {children}
    </g>
  );
}
