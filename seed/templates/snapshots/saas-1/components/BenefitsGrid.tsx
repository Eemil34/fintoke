import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

export function BenefitsGrid() {
  return (
    <div className="mt-14 grid gap-5 lg:grid-cols-6">
      <article className="overflow-hidden rounded-[28px] border border-[#e8eaf0] bg-white p-6 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.2)] lg:col-span-3 lg:row-span-2 lg:p-8">
        <div className="relative mx-auto flex h-56 items-center justify-center md:h-64">
          <div className="absolute left-6 top-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-500/30">
            <WhatsAppIcon />
          </div>
          <div className="absolute bottom-12 left-14 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 shadow-md">
            <MessengerIcon />
          </div>
          <div className="absolute right-10 top-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-xs font-bold text-white shadow-md">
            IG
          </div>
          <div className="absolute bottom-14 right-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
            <FbIcon />
          </div>
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#e2e5ef" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="28%" y1="72%" x2="50%" y2="50%" stroke="#e2e5ef" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="78%" y1="28%" x2="50%" y2="50%" stroke="#e2e5ef" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="82%" y1="68%" x2="50%" y2="50%" stroke="#e2e5ef" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6366f1] text-2xl font-bold text-white shadow-xl shadow-[#6366f1]/35">
            c
          </div>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-[#0f172a]">One Place for Every Conversation</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6b7280]">
          WhatsApp, Messenger, Instagram, email and web chat — Cue unifies every conversation so
          your team never misses a lead.
        </p>
      </article>

      <article className="overflow-hidden rounded-[28px] border border-[#e8eaf0] bg-white p-6 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.2)] lg:col-span-3 lg:p-7">
        <div className="rounded-3xl bg-[#f4f5f9] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#6366f1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              AI
            </span>
            <span className="text-xs text-[#9ca3af]">Auto-reply · 0.4s</span>
          </div>
          <div className="space-y-2.5">
            <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-[#0f172a] shadow-sm">
              Do you have the hybrid model in stock?
            </div>
            <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#6366f1] px-3.5 py-2.5 text-sm text-white shadow-md shadow-[#6366f1]/25">
              Yes — three units available. Want me to reserve one and schedule a viewing?
            </div>
          </div>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-[#0f172a]">Instant, Accurate Answers, 24/7</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Cue drafts and sends answers that match your tone — day or night.
        </p>
      </article>

      <article className="rounded-[28px] border border-[#e8eaf0] bg-white p-6 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.2)] lg:col-span-2">
        <div className="rounded-3xl border border-[#e8eaf0] bg-[#f4f5f9] p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full">
              <SiteImage
                src={unsplash('photo-1560250097-0b93528c311a', 120)}
                alt="Professional man"
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">John Miller</p>
              <p className="text-xs text-[#6b7280]">Returning · Premium plan</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Prefers chat', 'High intent', 'NPS 9'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#6b7280] ring-1 ring-[#e8eaf0]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <h3 className="mt-5 text-base font-semibold text-[#0f172a]">
          Personalised Customer Experiences
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Context, history and intent travel with every conversation.
        </p>
      </article>

      <article className="rounded-[28px] border border-[#e8eaf0] bg-white p-6 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.2)] lg:col-span-2">
        <div className="rounded-3xl border border-[#e8eaf0] bg-[#f4f5f9] p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-[#9ca3af]">Avg resolution</p>
              <p className="text-4xl font-bold tracking-tight text-[#0f172a]">
                76<span className="text-lg font-semibold text-[#9ca3af]">m</span>
              </p>
            </div>
            <div className="flex items-end gap-1 pb-1">
              {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
                <span
                  key={i}
                  className="w-2 rounded-sm bg-[#6366f1]/80"
                  style={{ height: `${h * 0.35}px` }}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] font-medium text-emerald-600">↓ 34% vs last month</p>
        </div>
        <h3 className="mt-5 text-base font-semibold text-[#0f172a]">
          Better Decisions, Backed by Data
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Spot bottlenecks and prove ROI with live conversation analytics.
        </p>
      </article>

      <article className="rounded-[28px] border border-[#e8eaf0] bg-white p-6 shadow-[0_22px_55px_-28px_rgba(15,23,42,0.2)] lg:col-span-2">
        <div className="rounded-3xl border border-[#e8eaf0] bg-[#f4f5f9] p-4">
          <div className="flex items-center justify-between gap-2">
            <Node label="AI" tone="purple" />
            <span className="h-px flex-1 bg-[#d8dbe7]" />
            <Node label="Sales" tone="light" />
            <span className="h-px flex-1 bg-[#d8dbe7]" />
            <Node label="Support" tone="light" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white px-2.5 py-2 ring-1 ring-[#e8eaf0]">
              <p className="text-[9px] uppercase tracking-wide text-[#9ca3af]">Accounts</p>
              <p className="text-xs font-semibold text-[#0f172a]">Auto-route</p>
            </div>
            <div className="rounded-xl bg-white px-2.5 py-2 ring-1 ring-[#e8eaf0]">
              <p className="text-[9px] uppercase tracking-wide text-[#9ca3af]">Returns</p>
              <p className="text-xs font-semibold text-[#0f172a]">Human handoff</p>
            </div>
          </div>
        </div>
        <h3 className="mt-5 text-base font-semibold text-[#0f172a]">
          Less Manual Work for Your Team
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Automate triage and route complex chats to the right person.
        </p>
      </article>
    </div>
  );
}

function Node({ label, tone }: { label: string; tone: 'purple' | 'light' }) {
  return (
    <div
      className={`rounded-xl px-2.5 py-1.5 text-[11px] font-semibold ${
        tone === 'purple'
          ? 'bg-[#6366f1] text-white'
          : 'bg-white text-[#0f172a] ring-1 ring-[#e8eaf0]'
      }`}
    >
      {label}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.2-.7.9-.8 1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1 0-.3-.1-.6-.2zM12.1 21h-.1c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9 9 0 1 1 12.1 21zm0-16.4A7.4 7.4 0 0 0 4.7 16l.3.5-.6 2.2 2.3-.6.5.3a7.4 7.4 0 1 0 4.9-14.8z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M12 2C6.48 2 2 6.1 2 11.1c0 2.86 1.42 5.41 3.65 7.1V22l3.35-1.84c.95.26 1.95.4 2.99.4 5.52 0 10-4.1 10-9.16S17.52 2 12 2zm1.02 12.35-2.55-2.72-4.98 2.72 5.47-5.81 2.61 2.72 4.92-2.72-5.47 5.81z" />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}
