import Link from "next/link";

const workflowSteps = [
  {
    title: "Define the split upfront",
    description:
      "Capture project metadata, payout routes, and collaborator percentages before release momentum makes ownership messy."
  },
  {
    title: "Reconnect the wallet that approves it",
    description:
      "Freighter support keeps the approval layer close to the people who actually sign off on the record."
  },
  {
    title: "Ship with a shared source of truth",
    description:
      "Everyone can point to the same split record when deposits arrive, campaigns launch, or distributors ask questions."
  }
];

const featurePillars = [
  {
    title: "Creator-first release ops",
    description:
      "Designed for artists, producers, managers, and visual collaborators who need payout clarity without extra operational drag."
  },
  {
    title: "On-chain ready structure",
    description:
      "The create flow keeps basis points accurate so the Soroban transaction is ready once the room agrees on the split."
  },
  {
    title: "Profile-led collaboration",
    description:
      "Public profile pages help collaborators share context, payout preferences, and creative positioning before a contract ever moves."
  }
];

const mockAllocations = [
  { name: "Lead artist", share: "40%" },
  { name: "Producer", share: "25%" },
  { name: "Mix engineer", share: "20%" },
  { name: "Visual director", share: "15%" }
];

export default function Home() {
  return (
    <main className="shell-page">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <div className="space-y-8 animate-fade-up">
          <div className="space-y-4">
            <span className="section-kicker">Built for the Nigerian creative economy</span>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.94] tracking-tight text-[color:var(--ink)] md:text-6xl xl:text-7xl">
              Keep royalty splits clear before the release money starts moving.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              SplitNaira helps creative teams define ownership, connect wallets, and launch
              payout-ready split records on Stellar without chasing spreadsheets after the drop.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/create" className="button-primary">
              Launch split studio
            </Link>
            <Link href="/profile" className="button-secondary">
              View creator profile
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Ownership language
              </p>
              <p className="mt-3 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                10,000 bps
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Exact split math instead of fuzzy percentage spreadsheets.
              </p>
            </div>
            <div className="glass-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Wallet-first approvals
              </p>
              <p className="mt-3 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                Freighter
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Connect the signer that actually needs to approve the release split.
              </p>
            </div>
            <div className="glass-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Shared release memory
              </p>
              <p className="mt-3 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                One flow
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                The landing page, profile, and split creator now live in one connected frontend.
              </p>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="animate-drift absolute -left-6 top-14 h-24 w-24 rounded-full bg-gold/20 blur-3xl" />
          <div
            className="animate-drift absolute right-0 top-2 h-32 w-32 rounded-full bg-greenMid/20 blur-3xl"
            style={{ animationDelay: "1500ms" }}
          />

          <div className="glass-panel relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-gold/20 via-transparent to-greenMid/10" />

            <div className="relative space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-md">
                  <span className="section-kicker">Release capsule</span>
                  <h2 className="mt-4 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                    Eko After Hours
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    A single rollout with the producer, vocalist, engineer, and visual director all
                    aligned before launch day.
                  </p>
                </div>
                <span className="status-pill">Testnet ready</span>
              </div>

              <div className="space-y-3">
                {mockAllocations.map((allocation) => (
                  <div
                    key={allocation.name}
                    className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[color:var(--ink)]">{allocation.name}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">
                          Locked into the release split before distribution.
                        </p>
                      </div>
                      <p className="font-display text-2xl text-[color:var(--gold)]">
                        {allocation.share}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    Distribution health
                  </p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                    100%
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                    Allocation settled before contract deployment.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    Profile sync
                  </p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                    Live
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                    Creator details and split setup now share the same design system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        {workflowSteps.map((step, index) => (
          <article
            key={step.title}
            className="glass-panel animate-fade-up p-6"
            style={{ animationDelay: `${220 + index * 100}ms` }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--tag-bg)] font-display text-xl font-semibold text-[color:var(--greenDeep)]">
              0{index + 1}
            </div>
            <h2 className="mt-5 font-display text-2xl tracking-tight text-[color:var(--ink)]">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="glass-panel p-6 md:p-8">
          <span className="section-kicker">Why teams choose it</span>
          <h2 className="mt-4 font-display text-4xl tracking-tight text-[color:var(--ink)]">
            Operational clarity that still feels creative.
          </h2>
          <div className="mt-8 space-y-4">
            {featurePillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5"
              >
                <h3 className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <article className="glass-panel brand-prose prose max-w-none p-6 dark:prose-invert md:p-8">
          <h2>Creator trust, not spreadsheet sprawl</h2>
          <p>
            SplitNaira is meant for the moment before the admin gets messy. The strongest release
            systems reduce ambiguity while the creative energy is still high.
          </p>
          <p>
            That is why this frontend now includes a dedicated landing page, a creator profile
            workspace, dark mode support, and rich text styling for public-facing context.
          </p>
          <ul>
            <li>Start with a pitch-worthy homepage that explains the product clearly.</li>
            <li>Move split creation into its own focused route so the workflow can breathe.</li>
            <li>Let creators shape their public profile before the contract goes live.</li>
          </ul>
          <blockquote>
            When a release is ready to earn, nobody should be debating whose spreadsheet is the real
            one.
          </blockquote>
        </article>
      </section>

      <section className="mt-16 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <span className="section-kicker">Start the next release</span>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-[color:var(--ink)]">
              Build the split, polish the profile, and bring the whole team into one flow.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              The frontend now gives creators a clear first impression at `/`, a dedicated split
              studio at `/create`, and a profile workspace at `/profile`.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/create" className="button-primary">
              Open split studio
            </Link>
            <Link href="/profile" className="button-secondary">
              Edit profile
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
