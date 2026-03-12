export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14">
        <header className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.25em] text-black/70 shadow-soft">
            Stellar + Soroban
          </div>
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div className="space-y-5">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-greenDeep md:text-6xl">
                Split royalties instantly for every creative team.
              </h1>
              <p className="max-w-xl text-base text-black/70 md:text-lg">
                SplitNaira helps music collectives, film crews, and creators automate
                payouts with Soroban smart contracts on Stellar. Define shares once,
                then distribute transparently forever.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-greenDeep px-6 py-3 text-sm font-semibold text-white transition hover:bg-greenMid">
                  Create a split
                </button>
                <button className="rounded-full border border-black/15 bg-white/70 px-6 py-3 text-sm font-semibold text-black/70 transition hover:border-black/30">
                  View contract demo
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-soft">
              <div className="font-display text-xl font-semibold text-greenDeep">
                Live payout snapshot
              </div>
              <div className="mt-5 space-y-4 text-sm text-black/65">
                <div className="flex items-center justify-between">
                  <span>Afrobeats Vol. 3</span>
                  <span className="font-semibold text-gold">+1,200 USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Studio session</span>
                  <span className="font-semibold text-gold">+540 USDC</span>
                </div>
                <div className="rounded-2xl border border-dashed border-gold/40 bg-goldLight/20 p-4 text-xs uppercase tracking-[0.2em] text-gold">
                  Paid out in 1 transaction
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Define splits upfront",
              body: "Set basis points per collaborator and lock the agreement before release."
            },
            {
              title: "Automatic distributions",
              body: "Funds sent to the contract are instantly divided across every wallet."
            },
            {
              title: "Transparent audit trail",
              body: "Every payout is recorded on-chain and easy to verify."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-soft"
            >
              <div className="font-display text-lg font-semibold text-greenDeep">
                {item.title}
              </div>
              <p className="mt-3 text-sm text-black/65">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-black/10 bg-greenDeep px-8 py-10 text-white shadow-soft">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <div className="font-display text-2xl font-semibold">
                Ready for the next Wave
              </div>
              <p className="mt-3 text-sm text-white/70">
                Track your contributors, ship verified improvements, and keep your
                contracts Wave-ready with clean issues and quality tests.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
              <div>Contract tests: ready</div>
              <div>Frontend scaffold: ready</div>
              <div>Backend API: ready</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}