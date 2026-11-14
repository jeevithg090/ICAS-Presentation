import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  /** Use light-on-dark colours, e.g. over the home page hero. */
  onDark?: boolean;
  className?: string;
}

export default function ThemeToggle({ onDark = false, className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2",
        onDark
          ? "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/70"
          : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring",
        className,
      )}
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
