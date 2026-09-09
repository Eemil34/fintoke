'use client';

import { useState } from 'react';

const clubs = ['New York', 'London', 'Dubai', 'Tokyo', 'Sydney', 'Berlin'];
const goals = ['Strength', 'Fat loss', 'Conditioning', 'Athletic'];

export function HeroActionBar() {
  const [club, setClub] = useState(clubs[0]);
  const [goal, setGoal] = useState(goals[0]);
  const [done, setDone] = useState(false);

  return (
    <div className="border-t border-white/10 bg-[#0b0f16]/92 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-5 md:grid-cols-[0.95fr_1.55fr_auto] md:items-center md:gap-8 md:px-10 md:py-6 lg:px-14 xl:px-20">
        <div>
          <p className="font-display text-[1.55rem] font-semibold uppercase leading-none tracking-[0.04em] text-white md:text-[1.75rem]">
            Find your club
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-electric">
            Reciprocal access · 23 countries
          </p>
          {done && (
            <p className="mt-2 text-sm text-electric-bright animate-fade-in">
              Locked in — {club}, focus on {goal.toLowerCase()}.
            </p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Club */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                Club
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                Location
              </span>
            </div>
            <div className="group relative flex items-center gap-3 border border-ink-line bg-ink-soft/80 px-3 py-2.5 transition focus-within:border-electric focus-within:bg-ink-elev hover:border-white/25">
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-electric/15 text-electric">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Club</span>
                <select
                  value={club}
                  onChange={(e) => {
                    setClub(e.target.value);
                    setDone(false);
                  }}
                  className="w-full cursor-pointer appearance-none bg-transparent pr-7 font-display text-xl font-semibold uppercase tracking-[0.06em] text-white outline-none"
                >
                  {clubs.map((c) => (
                    <option key={c} value={c} className="bg-ink text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-mist transition group-focus-within:text-electric">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </label>
            </div>
          </div>

          {/* Focus */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                Focus
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                Training goal
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Focus"
              className="grid grid-cols-2 gap-1.5 border border-ink-line bg-ink-soft/80 p-1.5 sm:grid-cols-4"
            >
              {goals.map((g) => {
                const active = goal === g;
                return (
                  <button
                    key={g}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setGoal(g);
                      setDone(false);
                    }}
                    className={`px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                      active
                        ? 'bg-electric text-ink shadow-[0_0_0_1px_rgba(79,140,255,0.4)]'
                        : 'text-mist hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDone(true)}
          className="btn-skew h-[52px] min-w-[148px] justify-self-start md:justify-self-end"
        >
          Join Now
        </button>
      </div>
    </div>
  );
}
