import { Link, useLocation } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <SEO
        title="Page not found — ICAS"
        description="The page you are looking for does not exist."
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We couldn&apos;t find{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-sm">{location.pathname}</code>. It may
        have moved or never existed.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  );
};

export default NotFound;
