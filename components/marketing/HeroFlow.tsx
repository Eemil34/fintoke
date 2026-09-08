'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const PATHS = [
  'M 90 70 C 240 70, 340 180, 500 225',
  'M 55 175 C 210 165, 340 205, 500 235',
  'M 80 285 C 230 275, 350 250, 500 245',
  'M 110 410 C 250 390, 360 300, 500 255',
  'M 200 30 C 320 90, 400 170, 500 220',
  'M 1010 55 C 860 70, 740 175, 600 225',
  'M 1050 165 C 890 165, 740 210, 600 235',
  'M 1020 290 C 870 280, 730 255, 600 245',
  'M 990 420 C 840 395, 720 300, 600 255',
  'M 900 25 C 780 90, 700 170, 600 220',
  'M 160 220 C 280 210, 380 225, 500 238',
  'M 940 230 C 820 225, 720 235, 600 238',
];

const NODES: [number, number][] = [
  [90, 70],
  [55, 175],
  [80, 285],
  [110, 410],
  [200, 30],
  [250, 140],
  [1010, 55],
  [1050, 165],
  [1020, 290],
  [990, 420],
  [900, 25],
  [850, 145],
  [320, 320],
  [790, 330],
];

const LEFT_TOPS = ['8%', '28%', '52%', '74%'];
const RIGHT_TOPS = ['10%', '30%', '54%', '76%'];

export default function HeroFlow({
  tags,
  faded = false,
}: {
  tags: readonly { side: 'left' | 'right'; label: string }[];
  faded?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 46, damping: 16 });
  const sy = useSpring(my, { stiffness: 46, damping: 16 });
  const rotateX = useTransform(sy, [-40, 40], [4, -4]);
  const rotateY = useTransform(sx, [-40, 40], [-6, 6]);
  const [progress, setProgress] = useState(38);

  const leftTags = tags.filter((tag) => tag.side === 'left');
  const rightTags = tags.filter((tag) => tag.side === 'right');

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 70);
      my.set(((event.clientY - rect.top) / rect.height - 0.5) * 48);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [mx, my]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 78 ? 32 : value + 1));
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      ref={rootRef}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={`relative mx-auto mt-4 h-full min-h-[460px] w-full max-w-5xl sm:min-h-[560px] ${faded ? 'hero-flow-faded' : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[18%] h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-white/[0.04]" />
        <div className="absolute left-1/2 top-[8%] h-[860px] w-[860px] -translate-x-1/2 rounded-full border border-white/[0.03]" />
      </div>

      <motion.div
        className="pointer-events-none absolute left-[12%] top-[58%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,165,106,0.35),transparent_68%)]"
        animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[48%] h-[420px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,120,74,0.16),transparent_70%)]"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1100 520" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(196,120,74,0)" />
            <stop offset="50%" stopColor="rgba(232,165,106,0.85)" />
            <stop offset="100%" stopColor="rgba(196,120,74,0)" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {PATHS.map((d, index) => (
          <g key={d}>
            <path d={d} stroke="rgba(255,255,255,0.07)" strokeWidth="1.15" />
            <path
              id={`${uid}-p${index}`}
              d={d}
              stroke={`url(#${uid}-line)`}
              strokeWidth="1.5"
              strokeDasharray="2 10"
              className="hero-path-dash"
              style={{ animationDelay: `${index * 0.22}s` }}
            />
            {[0, 1, 2].map((copy) => (
              <circle
                key={`${index}-${copy}`}
                r={copy === 0 ? 3.6 : 2.1}
                fill={copy === 0 ? '#f0b27a' : '#c4784a'}
                filter={`url(#${uid}-glow)`}
              >
                <animateMotion
                  dur={`${3.1 + index * 0.18}s`}
                  begin={`${copy * 1.05 + index * 0.12}s`}
                  repeatCount="indefinite"
                >
                  <mpath href={`#${uid}-p${index}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        ))}
        {NODES.map(([x, y], index) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <polygon
              points="0,-8 8,0 0,8 -8,0"
              fill="#0c0c0e"
              stroke="#c4784a"
              strokeWidth="1.35"
              className="hero-node-pulse"
              style={{ animationDelay: `${index * 0.16}s` }}
            />
          </g>
        ))}
      </svg>

      {leftTags.map((tag, index) => (
        <FlowLabel
          key={tag.label}
          label={tag.label}
          delay={index * 0.12}
          style={{ top: LEFT_TOPS[index], left: '0%' }}
        />
      ))}
      {rightTags.map((tag, index) => (
        <FlowLabel
          key={tag.label}
          label={tag.label}
          delay={0.2 + index * 0.12}
          style={{ top: RIGHT_TOPS[index], right: '0%' }}
        />
      ))}

      <motion.div
        className="absolute left-[7%] top-[38%] hidden h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#111114]/85 sm:flex"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="grid grid-cols-2 gap-[3px]">
          <span className="h-1.5 w-1.5 rounded-[2px] bg-zinc-400" />
          <span className="h-1.5 w-1.5 rounded-[2px] bg-[#e8a56a]" />
          <span className="h-1.5 w-1.5 rounded-[2px] bg-zinc-500" />
          <span className="h-1.5 w-1.5 rounded-[2px] bg-zinc-400" />
        </span>
      </motion.div>

      <motion.div
        className="absolute bottom-[16%] left-[9%] hidden h-14 w-14 items-center justify-center rounded-full border border-[#c4784a]/30 bg-[#111114]/80 shadow-[0_0_40px_rgba(232,165,106,0.28)] sm:flex"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5.1, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Hourglass />
      </motion.div>

      <MiniChip className="left-[22%] top-[6%]" delay={0.1}>
        Prompt
      </MiniChip>
      <MiniChip className="right-[21%] top-[8%]" delay={0.25} live>
        Live
      </MiniChip>
      <MiniChip className="bottom-[8%] left-[26%]" delay={0.4}>
        Claude
      </MiniChip>
      <MiniChip className="bottom-[10%] right-[28%]" delay={0.55}>
        Cursor
      </MiniChip>

      <motion.div
        className="absolute left-1/2 top-1/2 z-10 flex w-[min(92%,19.5rem)] -translate-x-1/2 -translate-y-[46%] flex-col gap-2.5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Pill>
          <SquareIcon />
          <span>Upload</span>
          <span className="ml-auto text-[11px] text-zinc-400">70%</span>
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full rounded-full bg-[#c4784a]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </span>
        </Pill>
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(196,120,74,0)',
              '0 0 28px rgba(196,120,74,0.45)',
              '0 0 0 0 rgba(196,120,74,0)',
            ],
          }}
          transition={{ duration: 2.3, repeat: Infinity }}
          className="rounded-full"
        >
          <Pill glow>
            <TriangleIcon />
            <span>IQ-5</span>
            <span className="ml-auto text-[#e8a56a]">⚡</span>
          </Pill>
        </motion.div>
        <Pill>
          <CircleIcon />
          <span>Output</span>
        </Pill>
        <Pill>
          <Waveform />
          <span className="relative ml-auto h-7 w-7">
            <span className="absolute right-3 h-7 w-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-600 ring-2 ring-black" />
            <span className="absolute right-0 h-7 w-7 rounded-full bg-gradient-to-br from-orange-200 to-stone-700 ring-2 ring-black" />
          </span>
        </Pill>
      </motion.div>

      <Avatar className="left-[18%] top-[16%]" delay={0} />
      <Avatar className="right-[19%] top-[20%]" delay={0.45} warm />
      <Avatar className="bottom-[18%] left-[22%]" delay={0.9} />
      <Avatar className="bottom-[22%] right-[24%]" delay={1.2} />
      <Avatar className="left-[32%] top-[42%]" delay={0.7} warm />

      <motion.div
        className="absolute right-[6%] top-[42%] hidden h-[7.5rem] w-[7.5rem] items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04] shadow-[0_0_50px_rgba(196,120,74,0.18)] sm:flex"
        animate={{ y: [0, -11, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative h-[4.4rem] w-[4.4rem]">
          <span className="absolute inset-x-1 top-3 h-3.5 rounded-full bg-[#1b1b1e] shadow-[0_10px_18px_rgba(196,120,74,0.45)]" />
          <span className="absolute inset-x-2.5 top-7 h-3.5 rounded-full bg-[#2a2a2e]" />
          <span className="absolute inset-x-4 top-11 h-3.5 rounded-full bg-[#161618]" />
          <motion.span
            className="absolute left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f6c48a] via-[#c4784a] to-transparent"
            animate={{ height: [26, 46, 26], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.7, repeat: Infinity }}
          />
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2 md:hidden">
        {tags.map((tag) => (
          <span key={tag.label} className="glass-pill rounded-full px-3 py-1 text-[11px] text-zinc-300">
            {tag.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function FlowLabel({
  label,
  delay,
  style,
}: {
  label: string;
  delay: number;
  style: CSSProperties;
}) {
  return (
    <motion.span
      className="glass-pill absolute z-20 hidden -translate-y-1/2 rounded-full px-3.5 py-1.5 text-[12px] text-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:inline-flex"
      style={style}
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 4.6, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {label}
    </motion.span>
  );
}

function MiniChip({
  className,
  children,
  delay,
  live,
}: {
  className: string;
  children: ReactNode;
  delay: number;
  live?: boolean;
}) {
  return (
    <motion.span
      className={`glass-pill absolute z-20 hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-300 sm:inline-flex ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.8, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {live ? <span className="h-1.5 w-1.5 rounded-full bg-[#e8a56a] shadow-[0_0_8px_#e8a56a]" /> : null}
      {children}
    </motion.span>
  );
}

function Pill({ children, glow }: { children: ReactNode; glow?: boolean }) {
  return (
    <div
      className={`glass-pill flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium text-zinc-100 ${
        glow ? 'ring-1 ring-[#c4784a]/50' : ''
      }`}
    >
      {children}
    </div>
  );
}

function Avatar({ className, delay, warm }: { className: string; delay: number; warm?: boolean }) {
  return (
    <motion.span
      className={`absolute hidden h-8 w-8 rounded-full ring-2 ring-black sm:block ${className} ${
        warm ? 'bg-gradient-to-br from-orange-200 to-stone-700' : 'bg-gradient-to-br from-zinc-200 to-zinc-600'
      }`}
      animate={{ y: [0, -11, 0] }}
      transition={{ duration: 4.4, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function SquareIcon() {
  return <span className="h-3.5 w-3.5 rounded-[3px] border border-zinc-400" />;
}

function TriangleIcon() {
  return (
    <span className="border-l-[6px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#e8a56a]" />
  );
}

function CircleIcon() {
  return <span className="h-3.5 w-3.5 rounded-full border border-zinc-400" />;
}

function Hourglass() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M4 3h10M4 15h10M5 3c0 4 3.2 5.2 4 6-.8.8-4 2-4 6M13 3c0 4-3.2 5.2-4 6 .8.8 4 2 4 6"
        stroke="#e8a56a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Waveform() {
  const bars = [7, 13, 21, 11, 25, 9, 17, 23, 8, 19, 14, 27, 10, 18, 6, 15, 22, 12];
  return (
    <div className="flex h-6 flex-1 items-end gap-[3px]">
      {bars.map((height, index) => (
        <span
          key={index}
          className="hero-wave-bar w-[3px] rounded-full bg-gradient-to-t from-[#7a3f24] to-[#f0b27a]"
          style={{ height: `${height}px`, animationDelay: `${index * 0.07}s` }}
        />
      ))}
    </div>
  );
}
