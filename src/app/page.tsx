import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Nav */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <Logo size={26} />
          <span className="font-semibold text-sm text-[var(--text)]">agentic-starter</span>
          <nav className="ml-8 hidden md:flex items-center gap-6">
            <Link href="/docs/introduction" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Docs</Link>
            <Link href="/docs/getting-started" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Getting Started</Link>
            <Link href="/docs/architecture" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Architecture</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/Juniordell/agentic-starter"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4">
          <Logo size={56} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--accent)]">v0.1.0 — Open Source</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] max-w-3xl leading-tight mb-3">
          The Claude Code template built for{" "}
          <span className="text-[var(--accent)]">precision.</span>
        </h1>

        <p className="text-base text-[var(--text-muted)] max-w-xl mb-3">
          Not just structure. A system that actively fights hallucination, tracks every agent decision, and enforces quality before any code ships.
        </p>

        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">
          Python · Claude Code · LangChain · Pydantic · Guardrails · SDD
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link
            href="/docs/introduction"
            className="px-6 py-2.5 rounded-lg bg-[var(--accent)] text-[#0A0B0E] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Read the Docs
          </Link>
          <Link
            href="/docs/getting-started"
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text)] text-sm hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Quick Start →
          </Link>
        </div>

        {/* Code snippet */}
        <div className="w-full max-w-lg text-left">
          <div className="rounded-xl overflow-hidden border border-[var(--border)]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] font-mono">bash</span>
            </div>
            <pre className="p-4 bg-[var(--surface)] overflow-x-auto">
              <code className="text-sm text-[var(--text-muted)] font-mono">{`git clone https://github.com/Juniordell/agentic-starter my-project
cd my-project
python bootstrap.py --name "My Project" --author "Your Name"`}</code>
            </pre>
          </div>
        </div>
      </main>

      {/* The two problems */}
      <section className="border-t border-[var(--border)] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-10">
            Two problems. One template.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: "Problem 1",
                title: "Hallucination",
                desc: "The model answers without querying real data. Guardrails reject answers without sources, catch wrong tool routing, and retry automatically with exponential backoff.",
                accent: true,
              },
              {
                label: "Problem 2",
                title: "Token waste",
                desc: "The model receives context it doesn't need. Skills load on-demand, CLAUDE.md stays under 100 lines, and subagents get isolated context windows.",
                accent: false,
              },
            ].map((p) => (
              <div key={p.title} className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">{p.label}</p>
                <h3 className={`text-xl font-bold mb-3 ${p.accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
                  {p.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-5 w-full">
        {[
          { icon: "🛡", title: "Guardrails", desc: "Semantic validation + retry loop. ConfidenceValidator, SourceValidator, ToolRoutingValidator — catches what Pydantic can't." },
          { icon: "📊", title: "Observability", desc: "AgentTracer records tools called, steps, latency, and hallucination flag per invocation. No blind spots." },
          { icon: "🧪", title: "Evals", desc: "Behavioral tests for agent intelligence, not just code. Fast mocked evals in CI. Real LLM evals before release." },
          { icon: "📋", title: "SDD Methodology", desc: "5-phase Spec-Driven Development with clarity gates. Opus for thinking, Sonnet for building." },
          { icon: "🧠", title: "Skills System", desc: "Domain knowledge loaded on demand. A skill not loaded = tokens saved every turn." },
          { icon: "🤖", title: "Subagents", desc: "test-writer and implementer with isolated context windows. True TDD without the context bleed." },
        ].map((f) => (
          <div key={f.title} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 transition-colors">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-[var(--text)] mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
        <p>
          MIT License · Built by{" "}
          <a href="https://linkedin.com/in/nelson-dell" className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">
            Nelson Dell
          </a>{" "}
          ·{" "}
          <a href="https://github.com/Juniordell/agentic-starter" className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">
            github.com/Juniordell/agentic-starter
          </a>
        </p>
      </footer>
    </div>
  );
}
