import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-8 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted)] shadow-soft">
        <p>Built for transparent creative payouts on Stellar.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/">Home</Link>
          <Link href="/create">Create split</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </div>
    </footer>
  );
}
