import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

const CONTACTS = [
  { name: 'Hanson Freja', preview: 'Where is my order?', time: '2m', channel: 'wa', active: false },
  { name: 'Elin Patel', preview: 'Can I change the size?', time: '8m', channel: 'ig', active: false },
  { name: 'Linnea Lund', preview: 'Order #48291 issue…', time: '12m', channel: 'wa', active: true },
  { name: 'John Snow', preview: 'Thanks for the help!', time: '1h', channel: 'fb', active: false },
  { name: 'Michael Briggs', preview: 'Refund status?', time: '2h', channel: 'em', active: false },
  { name: 'Olivia Rhye', preview: 'Shipping to EU?', time: '3h', channel: 'wa', active: false },
  { name: 'Phoenix Baker', preview: 'Need invoice copy', time: '4h', channel: 'em', active: false },
  { name: 'Lana Steiner', preview: 'Store hours today?', time: '5h', channel: 'ig', active: false },
];

export function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-5xl pt-8">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[48px] opacity-95 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.5), rgba(56,189,248,0.18) 42%, transparent 72%)',
        }}
      />

      {/* Metric badge — top-right of dashboard */}
      <div className="absolute right-[8%] top-0 z-40 flex -translate-y-1/2 items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-[0_20px_44px_-14px_rgba(15,23,42,0.4)] ring-1 ring-black/5 sm:right-[12%]">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">
            Unified inbox
          </p>
          <p className="text-2xl font-bold leading-none tracking-tight text-[#111827]">132</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/45">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Avery — points at inbox list */}
      <CursorLabel
        className="absolute left-0 top-[18%] z-40 sm:left-1 md:left-3 lg:left-0"
        name="Avery Maxwell"
        action="Reviewing inbox"
        color="#6366f1"
        photo="photo-1573496359142-b8d87734a5a2"
        rotate={-6}
      />

      {/* Olivia — points at details / properties */}
      <CursorLabel
        className="absolute bottom-[26%] right-0 z-40 sm:right-1 md:right-2 lg:-right-1"
        name="Olivia Riya"
        action="Editing properties"
        color="#ec4899"
        photo="photo-1494790108377-be9c29b29330"
        rotate={10}
        flip
      />

      {/* Big send cursor — over AI reply / composer */}
      <div className="pointer-events-none absolute bottom-[12%] left-[52%] z-40 sm:bottom-[14%] sm:left-[55%] md:left-[58%]">
        <div className="relative -translate-x-1/2">
          <div className="absolute inset-0 translate-y-3 rounded-full bg-[#6366f1]/45 blur-2xl" />
          <svg
            width="46"
            height="46"
            viewBox="0 0 48 48"
            className="relative rotate-[18deg] drop-shadow-[0_14px_28px_rgba(99,102,241,0.6)]"
            aria-hidden
          >
            <path
              d="M8 4l36 18-16 4-4 16L8 4z"
              fill="#6366f1"
              stroke="#fff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute left-8 top-8 whitespace-nowrap rounded-full bg-[#6366f1] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_10px_24px_-6px_rgba(99,102,241,0.7)]">
            Send reply
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_55px_130px_-28px_rgba(5,8,30,0.7),0_32px_70px_-30px_rgba(99,102,241,0.5)]">
        <div className="grid min-h-[480px] grid-cols-1 sm:min-h-[520px] md:grid-cols-[210px_minmax(0,1fr)] lg:min-h-[560px] lg:grid-cols-[210px_minmax(0,1fr)_220px]">
          {/* Inbox */}
          <aside className="hidden border-r border-[#eceef5] bg-[#f8f9fc] md:flex md:flex-col">
            <div className="flex items-center justify-between border-b border-[#eceef5] px-3.5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366f1] text-[11px] font-bold text-white">
                  c
                </span>
                <span className="text-[12px] font-semibold text-[#111827]">Inbox</span>
              </div>
              <span className="rounded-full bg-[#6366f1]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6366f1]">
                24
              </span>
            </div>
            <div className="flex gap-1.5 border-b border-[#eceef5] px-3 py-2">
              {['All', 'Open', 'AI'].map((tab, i) => (
                <span
                  key={tab}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                    i === 1 ? 'bg-white text-[#6366f1] shadow-sm ring-1 ring-[#e5e7ef]' : 'text-[#9ca3af]'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="px-3 py-2">
              <div className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] text-[#9ca3af] ring-1 ring-[#e5e7ef]">
                Search conversations…
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {CONTACTS.map((c) => (
                <div
                  key={c.name}
                  className={`flex gap-2.5 border-b border-[#f0f1f6] px-3 py-2.5 ${
                    c.active ? 'bg-white shadow-[inset_3px_0_0_#6366f1]' : ''
                  }`}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#e5e7eb]">
                      <SiteImage
                        src={unsplash(avatarFor(c.name), 80)}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                    <ChannelDot channel={c.channel} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-[11px] font-semibold text-[#111827]">{c.name}</p>
                      <span className="text-[9px] text-[#9ca3af]">{c.time}</span>
                    </div>
                    <p className="truncate text-[10px] text-[#6b7280]">{c.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Chat */}
          <section className="flex min-h-[420px] flex-col bg-white sm:min-h-[480px]">
            <header className="flex items-center justify-between border-b border-[#eceef5] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 overflow-hidden rounded-full">
                  <SiteImage
                    src={unsplash('photo-1580489944761-15a19d654956', 80)}
                    alt="Linnea Lund"
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Linnea Lund</p>
                  <p className="text-[10px] text-[#6b7280]">WhatsApp · Order #48291</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                  Open
                </span>
                <span className="hidden rounded-full bg-[#6366f1]/10 px-2.5 py-1 text-[10px] font-semibold text-[#6366f1] sm:inline">
                  AI assist
                </span>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
              <p className="text-center text-[10px] font-medium uppercase tracking-wide text-[#c0c4d0]">
                Today
              </p>

              <div className="rounded-xl bg-[#f3f4f8] px-3.5 py-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#111827]">Linnea Lund</p>
                  <span className="text-[9px] text-[#9ca3af]">09:14</span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#374151]">
                  Hi! I ordered the navy jacket last week (order #48291) but tracking hasn&apos;t
                  updated. Can you check the status?
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Attach label="order-48291.pdf" />
                  <Attach label="receipt.jpg" />
                </div>
              </div>

              <div className="rounded-xl border border-[#e8eaf5] bg-[#fafbff] px-3.5 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6366f1]">
                  Ticket subject
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-[#111827]">
                  Shipping delay — Order #48291
                </p>
              </div>

              <div className="ml-auto max-w-[92%] rounded-xl bg-[#6366f1] px-3.5 py-3 text-white shadow-lg shadow-[#6366f1]/25">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                    AI
                  </span>
                  <span className="text-[9px] text-white/70">Suggested · 96% match</span>
                </div>
                <p className="text-[12px] leading-relaxed">
                  Hi Linnea — your jacket left our warehouse yesterday and should arrive Thursday.
                  Here&apos;s the live tracking link. Want SMS updates too?
                </p>
              </div>

              <div className="rounded-xl bg-[#f3f4f8] px-3.5 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#111827]">Linnea Lund</p>
                  <span className="text-[9px] text-[#9ca3af]">09:18</span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#374151]">
                  Perfect — yes please text me the updates. Thanks!
                </p>
              </div>
            </div>

            <footer className="border-t border-[#eceef5] px-4 py-3.5">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {['Tracking link', 'SMS opt-in', 'Apology note'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#6366f1]/8 px-2.5 py-1 text-[10px] font-medium text-[#6366f1]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[#f8f9fc] px-3 py-2.5 ring-1 ring-[#e5e7ef]">
                <span className="flex-1 text-[12px] text-[#9ca3af]">Write a reply…</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/35">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </footer>
          </section>

          {/* Properties panel */}
          <aside className="hidden flex-col border-l border-[#eceef5] bg-[#f8f9fc] p-3.5 lg:flex">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
              Properties
            </p>

            <Section title="Conversation">
              <Row label="Status" value="Open" accent />
              <Row label="Priority" value="High" />
              <Row label="Type" value="Shipping" />
              <Row label="Channel" value="WhatsApp" />
              <Row label="Assignee" value="Unassigned" />
              <Row label="SLA" value="2h 14m left" />
            </Section>

            <Section title="Contact">
              <div className="mb-2 flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <SiteImage
                    src={unsplash('photo-1580489944761-15a19d654956', 80)}
                    alt="Linnea Lund"
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#111827]">Linnea Lund</p>
                  <p className="text-[9px] text-[#6b7280]">VIP · since 2023</p>
                </div>
              </div>
              <Row label="Email" value="linnea@mail.com" />
              <Row label="Phone" value="+46 70 112 334" />
              <Row label="Locale" value="Sweden" />
              <Row label="LTV" value="$1,240" />
            </Section>

            <Section title="Order">
              <Row label="Order ID" value="#48291" />
              <Row label="Value" value="$189.00" />
              <Row label="Carrier" value="DHL" />
              <Row label="ETA" value="Thu 12:00" />
            </Section>

            <Section title="Activity">
              <p className="text-[10px] leading-relaxed text-[#6b7280]">AI drafted reply · 1m ago</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#6b7280]">
                Priority set to High · 8m ago
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#6b7280]">
                Ticket opened · 12m ago
              </p>
            </Section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CursorLabel({
  className,
  name,
  action,
  color,
  photo,
  rotate = 0,
  flip,
}: {
  className?: string;
  name: string;
  action?: string;
  color: string;
  photo: string;
  rotate?: number;
  flip?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none ${className ?? ''}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className={`relative inline-flex flex-col ${flip ? 'items-end' : 'items-start'}`}>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          className="drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]"
          aria-hidden
        >
          <path
            d="M5.5 3.5l14 8.2-6.2 1.6L11 21.5 5.5 3.5z"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className={`mt-0.5 rounded-2xl py-1.5 pl-1.5 pr-3 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.45)] ${
            flip ? '-mr-0.5' : 'ml-3'
          }`}
          style={{ backgroundColor: color }}
        >
          <div className="flex items-center gap-1.5">
            <span className="relative h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/50">
              <SiteImage
                src={unsplash(photo, 64)}
                alt={name}
                fill
                className="object-cover"
                sizes="20px"
              />
            </span>
            <span className="whitespace-nowrap text-[11px] font-semibold text-white">{name}</span>
          </div>
          {action && (
            <p className="mt-0.5 pl-6 text-[9px] font-medium text-white/80">{action}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function avatarFor(name: string) {
  const map: Record<string, string> = {
    'Hanson Freja': 'photo-1507003211169-0a1dd7228f2d',
    'Elin Patel': 'photo-1573496359142-b8d87734a5a2',
    'Linnea Lund': 'photo-1580489944761-15a19d654956',
    'John Snow': 'photo-1472099645785-5658abf4ff4e',
    'Michael Briggs': 'photo-1560250097-0b93528c311a',
    'Olivia Rhye': 'photo-1494790108377-be9c29b29330',
    'Phoenix Baker': 'photo-1500648767791-00dcc994a43e',
    'Lana Steiner': 'photo-1573497019940-1c28c88b4f3e',
  };
  return map[name] ?? 'photo-1500648767791-00dcc994a43e';
}

function ChannelDot({ channel }: { channel: string }) {
  const colors: Record<string, string> = {
    wa: 'bg-[#25D366]',
    ig: 'bg-gradient-to-br from-amber-400 to-fuchsia-600',
    fb: 'bg-[#1877F2]',
    em: 'bg-[#6b7280]',
  };
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${colors[channel] ?? 'bg-gray-400'}`}
    />
  );
}

function Attach({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-medium text-[#4b5563] ring-1 ring-[#e5e7ef]">
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl bg-white p-2.5 ring-1 ring-[#eceef5]">
      <p className="mb-1.5 text-[10px] font-semibold text-[#6b7280]">{title}</p>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[10px] text-[#9ca3af]">{label}</span>
      <span className={`truncate text-[10px] font-semibold ${accent ? 'text-emerald-600' : 'text-[#111827]'}`}>
        {value}
      </span>
    </div>
  );
}
