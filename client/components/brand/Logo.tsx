import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

/** The ICAS monogram. Decorative: pair it with visible text or an aria-label. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="icas-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#icas-logo-gradient)" />
      <path d="M20 16h8v32h-8z" fill="#fff" />
      <path
        d="M44.5 22.5a10 10 0 1 0 0 19"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-extrabold tracking-tight", className)}>
      <LogoMark />
      <span className="text-lg leading-none">ICAS</span>
    </span>
  );
}
