import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useAuth, type User } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { LogoMark } from "@/components/brand/Logo";

type Mode = "signin" | "signup";
type Pending = "form" | "student" | "admin" | null;

const MIN_PASSWORD = 6;

export default function PortalLogin() {
  const { login, signupStudent } = useAuth();
  const [params] = useSearchParams();
  const next = safeRedirectPath(params.get("next"));
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, setPending] = useState<Pending>(null);

  const goTo = (u: User) => {
    const dest = next ?? (u?.role === "admin" ? "/admin" : "/portal");
    window.location.assign(dest);
  };

  const run = async (kind: Pending, action: () => Promise<User>, fallback: string) => {
    setError("");
    setPending(kind);
    try {
      goTo(await action());
    } catch (err: any) {
      setError(err?.message || fallback);
      setPending(null);
    }
  };

  const onSignIn = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    void run(
      "form",
      () => login(String(fd.get("email")).trim(), String(fd.get("password"))),
      "Failed to sign in",
    );
  };

  const onSignUp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    void run(
      "form",
      () => signupStudent(String(fd.get("name")).trim(), String(fd.get("email")).trim(), password),
      "Failed to sign up",
    );
  };

  const switchMode = () => {
    setError("");
    setMode(mode === "signin" ? "signup" : "signin");
  };

  const busy = pending !== null;
  const isSignIn = mode === "signin";

  return (
    <main className="container flex min-h-[calc(100vh-4rem)] items-start justify-center py-10 sm:items-center sm:py-16">
      <SEO
        title={isSignIn ? "Log in — ICAS Portal" : "Sign up — ICAS Portal"}
        description="Sign in or sign up (students) to access the portal."
      />
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <LogoMark className="mx-auto h-11 w-11" />
            <h1 className="text-2xl font-bold leading-none tracking-tight">
              {isSignIn ? "Log in to the portal" : "Create a student account"}
            </h1>
            <CardDescription>
              {isSignIn
                ? "Access your courses, deadlines and the Study Centre."
                : "Student accounts are stored in this browser for the demo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={isSignIn ? onSignIn : onSignUp}
              aria-describedby={error ? "auth-error" : undefined}
            >
              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" type="text" autoComplete="name" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{isSignIn ? "Email" : "Student email"}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  minLength={isSignIn ? undefined : MIN_PASSWORD}
                  aria-describedby={isSignIn ? undefined : "password-hint"}
                  required
                />
                {!isSignIn && (
                  <p id="password-hint" className="text-xs text-muted-foreground">
                    At least {MIN_PASSWORD} characters.
                  </p>
                )}
              </div>
              {error && (
                <div
                  id="auth-error"
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" className="h-11 w-full" disabled={busy}>
                {pending === "form" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                )}
                {isSignIn ? "Log in" : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {isSignIn ? "New student?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {isSignIn ? "Create an account" : "Log in"}
              </button>
            </p>

            <div className="mt-6 border-t pt-6">
              <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Or explore with a demo account
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  disabled={busy}
                  onClick={() =>
                    run(
                      "student",
                      () => login("student@icas.edu", "icas123"),
                      "Failed to continue as student",
                    )
                  }
                >
                  {pending === "student" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Demo student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={busy}
                  onClick={() =>
                    run(
                      "admin",
                      () => login("admin@icas.edu", "icas123"),
                      "Failed to continue as administrator",
                    )
                  }
                >
                  {pending === "admin" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Demo administrator
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sign-in is a client-side demo: accounts live in this browser&apos;s local storage.
        </p>
      </div>
    </main>
  );
}
