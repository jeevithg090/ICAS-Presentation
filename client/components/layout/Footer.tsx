import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const groups = [
  {
    title: "Study",
    links: [
      { to: "/academics", label: "Programs" },
      { to: "/transfer", label: "Transfer (2+2)" },
      { to: "/academic-planner", label: "Academic planner" },
      { to: "/faculty", label: "Faculty" },
    ],
  },
  {
    title: "Campus",
    links: [
      { to: "/student-life", label: "Student life" },
      { to: "/events", label: "Events" },
      { to: "/news", label: "News" },
      { to: "/research", label: "Research & medicine" },
      { to: "/impact", label: "Impact & outreach" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/admissions-aid", label: "Admissions & aid" },
      { to: "/financial-aid", label: "Financial aid" },
      { to: "/medical-aid", label: "Medical aid" },
      { to: "/ask-icas", label: "Ask ICAS (AI)" },
      { to: "/portal", label: "Student portal" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link
            to="/"
            aria-label="ICAS home"
            className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            International Centre for Applied Sciences, Manipal. Start your engineering degree in
            India and finish it at a partner university abroad.
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>ICAS (MAHE), Manipal, Karnataka, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              <a href="mailto:hello@icas.edu" className="hover:text-foreground hover:underline">
                hello@icas.edu
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              <a href="tel:+918012345678" className="hover:text-foreground hover:underline">
                +91 80 1234 5678
              </a>
            </li>
          </ul>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {g.title}
            </h2>
            <ul className="mt-4 grid gap-1 text-sm">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="inline-flex min-h-8 items-center rounded text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} ICAS Manipal. All rights reserved.</span>
          <Link to="/contact" className="hover:text-foreground hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </footer>
  );
}
