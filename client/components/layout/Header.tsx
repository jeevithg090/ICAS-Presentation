import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Settings2,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { primaryNav } from "./nav";

export default function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const onDark = isHome && !scrolled;
  const dashboardPath = user?.role === "admin" ? "/admin" : "/portal";

  const iconButton = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2",
    onDark
      ? "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/70"
      : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring",
  );

  return (
    <header
      className={cn(
        "top-0 z-40 w-full transition-colors duration-200",
        onDark
          ? "absolute inset-x-0 border-b border-transparent text-white"
          : "sticky border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="ICAS home"
          className={cn(
            "rounded-md focus-visible:outline-none focus-visible:ring-2",
            onDark
              ? "text-white focus-visible:ring-white/70"
              : "text-foreground focus-visible:ring-ring",
          )}
        >
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
                  onDark
                    ? cn(
                        "text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-white/70",
                        isActive && "bg-white/15 text-white",
                      )
                    : cn(
                        "hover:bg-muted hover:text-foreground focus-visible:ring-ring",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                      ),
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/ask-icas"
            aria-label="Ask ICAS — AI assistant"
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2",
              onDark
                ? "border border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/70"
                : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm hover:shadow-md focus-visible:ring-ring",
            )}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Ask ICAS</span>
          </Link>

          <ThemeToggle onDark={onDark} />

          {/* Account (desktop) */}
          <div className="hidden lg:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Account menu for ${user.name}`}
                  className={iconButton}
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={dashboardPath}>
                      <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden />
                      {user.role === "admin" ? "Admin dashboard" : "Student portal"}
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/administration">
                        <Settings2 className="mr-2 h-4 w-4" aria-hidden />
                        Administration tools
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" aria-hidden />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                variant={onDark ? "outline" : "default"}
                className={cn(
                  "h-10",
                  onDark &&
                    "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
                )}
              >
                <Link to="/login">
                  <LogIn className="mr-1.5 h-4 w-4" aria-hidden />
                  Log in
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger className={cn(iconButton, "lg:hidden")} aria-label="Open menu">
              <Menu className="h-5 w-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(85vw,320px)] flex-col gap-0 p-0">
              <SheetHeader className="border-b p-5 text-left">
                <SheetTitle asChild>
                  <div>
                    <Logo />
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3">
                <ul className="grid gap-1">
                  {[{ to: "/", label: "Home" }, ...primaryNav].map((n) => (
                    <li key={n.to}>
                      <NavLink
                        to={n.to}
                        end={n.to === "/"}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex min-h-11 items-center rounded-md px-3 text-base font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive ? "bg-primary/10 text-primary" : "text-foreground",
                          )
                        }
                      >
                        {n.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="grid gap-2 border-t p-4">
                {user ? (
                  <>
                    <div className="mb-1 flex items-center gap-3 px-1">
                      <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button asChild variant="secondary" className="h-11 justify-start">
                        <Link to={dashboardPath}>
                          <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden />
                          {user.role === "admin" ? "Admin dashboard" : "Student portal"}
                        </Link>
                      </Button>
                    </SheetClose>
                    {user.role === "admin" && (
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="h-11 justify-start">
                          <Link to="/administration">
                            <Settings2 className="mr-2 h-4 w-4" aria-hidden />
                            Administration tools
                          </Link>
                        </Button>
                      </SheetClose>
                    )}
                    <Button
                      variant="ghost"
                      className="h-11 justify-start"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden />
                      Log out
                    </Button>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button asChild className="h-11">
                      <Link to="/login">
                        <LogIn className="mr-2 h-4 w-4" aria-hidden />
                        Log in to the portal
                      </Link>
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
