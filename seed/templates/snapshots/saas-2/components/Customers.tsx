export function Customers() {
  return (
    <section id="customers" className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            The teams who stopped guessing.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-sift-muted sm:text-base">
            From fast-moving startups to public companies — operators who traded reporting
            rotations for answers they can defend.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <TestimonialCard
            initials="NA"
            name="Naomi Adeyemi"
            role="VP Operations · Cadence Freight"
            quote="We replaced a three-person reporting rotation with Sift. Now the whole team just asks the question and gets an answer we can defend in the board meeting."
            reply="That's exactly the point. Ask me anything before Monday's review."
          />
          <TestimonialCard
            initials="DR"
            name="Daniel Roskam"
            role="CFO · Loop"
            quote="The anomaly alerts caught a billing leak that had been running for two quarters. It paid for itself in a week."
            reply="Flagged it the moment invoices drifted 4% from contract value."
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  initials,
  name,
  role,
  quote,
  reply,
}: {
  initials: string;
  name: string;
  role: string;
  quote: string;
  reply: string;
}) {
  return (
    <article className="flex flex-col rounded-[1.35rem] border border-white/5 bg-sift-card p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-[11px] text-sift-muted">{role}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-3">
        <div className="max-w-[95%] rounded-2xl rounded-tl-md bg-sift-lime px-4 py-3 text-[13px] leading-relaxed text-black">
          {quote}
        </div>
        <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md border border-white/5 bg-[#1f1f1f] px-4 py-3">
          <p className="mb-1 text-right text-[9px] font-bold uppercase tracking-wider text-sift-lime">
            Sift
          </p>
          <p className="text-[13px] leading-relaxed text-sift-soft">{reply}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-0.5 text-sift-lime" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  );
}
