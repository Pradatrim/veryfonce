import Link from "next/link";

/** The FONCÉ 5-pointed gold star + wordmark. */
export function Star({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="fonceGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecc960" />
          <stop offset="55%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9a7d24" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5l2.95 6.6 7.05.62-5.34 4.66 1.6 6.92L12 17.7l-6.26 2.6 1.6-6.92L2 8.72l7.05-.62z"
        fill="url(#fonceGold)"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  size = "text-2xl",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <Star className="h-5 w-5" />
      <span className={`font-display tracking-tightest ${size}`}>FONCÉ</span>
    </Link>
  );
}
