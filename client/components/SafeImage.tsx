import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * An <img> that lazy-loads by default and, if the source fails (offline, blocked CDN),
 * swaps in a neutral placeholder instead of the browser's broken-image icon.
 */
export default function SafeImage({
  className,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-secondary/15 text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="h-6 w-6 opacity-60" aria-hidden />
      </div>
    );
  }

  return (
    <img
      loading="lazy"
      decoding="async"
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
