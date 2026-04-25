"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell-page">
      <div className="glass-panel border-rose-500/30 bg-rose-500/10 p-6 text-rose-950 dark:text-rose-100">
        <h1 className="font-display text-2xl">Unexpected application error</h1>
        <p className="mt-2 text-sm text-current/80">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="button-primary mt-4"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
