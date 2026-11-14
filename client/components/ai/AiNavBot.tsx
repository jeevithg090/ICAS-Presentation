import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  choices?: { label: string; to: string }[];
}

const ROUTES: { to: string; labels: string[] }[] = [
  { to: "/", labels: ["home", "homepage", "start"] },
  {
    to: "/about",
    labels: [
      "about",
      "timeline",
      "history",
      "research stats",
      "icas",
      "international centre",
      "applied sciences",
    ],
  },
  {
    to: "/academics",
    labels: ["academics", "courses", "programs", "degree", "engineering", "specializations"],
  },
  { to: "/research", labels: ["research", "medicine", "labs", "case studies", "metrics"] },
  { to: "/student-life", labels: ["student", "life", "community", "feed", "campus", "clubs"] },
  {
    to: "/admissions-aid",
    labels: ["admissions", "aid", "scholarships", "apply", "requirements", "eligibility"],
  },
  {
    to: "/transfer",
    labels: ["transfer", "2+2", "pathway", "abroad", "international", "partner universities"],
  },
  { to: "/news", labels: ["news", "featured", "records", "clips"] },
  { to: "/events", labels: ["events", "calendar", "upcoming", "current"] },
  { to: "/faculty", labels: ["faculty", "directory", "staff", "professors"] },
  { to: "/financial-aid", labels: ["financial", "aid", "scholarships", "tuition", "fees", "cost"] },
  { to: "/medical-aid", labels: ["medical", "health", "insurance", "care"] },
  { to: "/impact", labels: ["impact", "outreach", "community", "global"] },
  { to: "/contact", labels: ["contact", "email", "address", "phone"] },
  {
    to: "/ask-icas",
    labels: [
      "ask",
      "chat",
      "ai",
      "assistant",
      "help",
      "question",
      "what is icas",
      "tell me about icas",
    ],
  },
];

function matchRoutes(q: string) {
  const query = q.toLowerCase();
  const matches = ROUTES.filter((r) => r.labels.some((l) => query.includes(l))).slice(0, 5);
  return matches.map((m) => ({ label: m.to.split("/").slice(-1)[0] || "home", to: m.to }));
}

export default function AiNavBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the ICAS navigator. Ask me to find pages, events, or resources—try 'what is ICAS', 'show upcoming events', 'financial aid', or 'transfer programs'.",
      choices: [
        { label: "About ICAS", to: "/about" },
        { label: "Academics", to: "/academics" },
        { label: "Transfer Programs", to: "/transfer" },
        { label: "Ask ICAS AI", to: "/ask-icas" },
      ],
    },
  ]);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);

    const choices = matchRoutes(q);
    const response: Message = choices.length
      ? {
          role: "assistant",
          content: "Here’s what I found. Choose a destination:",
          choices,
        }
      : {
          role: "assistant",
          content: "I didn’t catch that. Try keywords like ‘research’, ‘events’, or ‘contact’.",
        };
    setMessages((m) => [...m, response]);
    setInput("");
  };

  const quick = useMemo(
    () => [
      { label: "About", to: "/about" },
      { label: "Academics", to: "/academics" },
      { label: "Events", to: "/events" },
      { label: "Ask ICAS", to: "/ask-icas" },
    ],
    [],
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Panel */}
      {open && (
        <div
          id="icas-navigator"
          role="dialog"
          aria-label="ICAS Navigator"
          className="mb-3 w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border animate-in fade-in-0 slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between border-b p-3">
            <div className="text-sm font-semibold">ICAS Navigator</div>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setOpen(false)}
              aria-label="Close navigator"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div ref={listRef} aria-live="polite" className="max-h-72 space-y-3 overflow-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "assistant" ? "" : "text-right"}>
                <div
                  className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {m.content}
                </div>
                {m.choices && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.choices.map((c) => (
                      <button
                        key={c.to}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                        onClick={() => {
                          navigate(c.to);
                          setOpen(false);
                        }}
                      >
                        {c.label || "open"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
            <input
              ref={inputRef}
              aria-label="Where do you want to go?"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Ask to navigate…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
            >
              Go
            </button>
          </form>
          <div className="border-t p-3">
            <div className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <button
                  key={q.to}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  onClick={() => {
                    navigate(q.to);
                    setOpen(false);
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          ref={toggleRef}
          className="flex h-12 items-center gap-2 rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="icas-navigator"
          aria-label={open ? "Close site navigator" : "Open site navigator"}
        >
          <Compass className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Navigator</span>
        </button>
      </div>
    </div>
  );
}
