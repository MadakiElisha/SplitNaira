import clsx from "clsx";

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-greenDeep shadow-soft">
        <span className="absolute left-1.5 top-1.5 h-5 w-5 rounded-full bg-goldLight/90" />
        <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full bg-greenMid" />
        <span className="relative z-10 font-display text-lg font-semibold text-[color:var(--cream)]">S</span>
      </div>
      <div className="space-y-0.5">
        <p className="font-display text-lg font-semibold tracking-tight text-[color:var(--ink)]">
          Split<span className="text-[color:var(--gold)]">Naira</span>
        </p>
        {compact ? null : (
          <p className="text-xs text-[color:var(--muted)]">
            Royalty splits for creative collaborators on Stellar
          </p>
        )}
      </div>
    </div>
  );
}
