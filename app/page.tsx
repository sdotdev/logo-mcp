"use client";

import Link from "next/link";

export default function Home() {
  const localUrl = "http://localhost:3000";
  const productionUrl = "https://logo-mcp.vercel.app";

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]"
          aria-hidden="true"
        />
        <div 
          className="absolute -right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-accent/3 blur-[100px]"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-weight-medium text-text-secondary opacity-0 animate-slide-down">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            3,300+ Brand Logos Available
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-text-primary text-balance md:text-5xl lg:text-6xl opacity-0 animate-slide-up stagger-1">
            Brand logos for your{" "}
            <span className="text-accent">&quot;AI agents&quot;</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-xl text-lg text-text-secondary md:text-xl opacity-0 animate-slide-up stagger-2">
            MCP server that enables Claude, Cursor, and other AI agents to instantly find and download brand logos as clean SVGs.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center opacity-0 animate-slide-up stagger-3">
            <Link
              href="/icons"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-weight-semibold text-black transition-all hover:bg-accent-hover hover-lift"
            >
              Browse Icons
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-weight-semibold text-text-primary transition-all hover:bg-surface-elevated hover-lift"
            >
              Documentation
            </Link>
            <Link
              href="/api-reference"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-weight-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              API Reference
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 border-t border-border pt-12 opacity-0 animate-slide-up stagger-4">
          {[
            { value: "3,300+", label: "brand logos" },
            { value: "SVG", label: "vector format" },
            { value: "CC0 1.0", label: "licensed" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-semibold text-text-primary md:text-3xl tabular-nums">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-2 lg:gap-8">
          <FeatureCard
            delay={5}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            }
            title="Smart Search"
            description="Search by name, slug, alias (fb, gh), ticker (AAPL), or domain (stripe.com). Fuzzy matching handles typos."
          />
          <FeatureCard
            delay={6}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            title="Batch Processing"
            description="Paste multiple brands and get all logos at once. Download as ZIP or copy individually."
          />
          <FeatureCard
            delay={7}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            }
            title="AI-Native Integration"
            description="Built for Claude Desktop, Cursor, and MCP-compatible AI tools. Use in prompts directly."
          />
          <FeatureCard
            delay={8}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            }
            title="Color Customization"
            description="Specify any hex color and get the logo in your brand color. PNG export also available."
          />
        </div>

        <div className="mx-auto mt-24 max-w-2xl opacity-0 animate-slide-up stagger-8">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/50" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <span className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
              <span className="ml-2 text-xs text-text-muted">MCP Tool Call</span>
            </div>
            <pre className="overflow-x-auto text-sm">
              <code className="text-text-secondary">
                <span className="text-accent">search_logo</span>(
                {"\n"}  <span className="text-text-muted">query:</span> <span className="text-success">&quot;stripe&quot;</span>,
                {"\n"}  <span className="text-text-muted">limit:</span> <span className="text-accent">5</span>
                {"\n"})
              </code>
            </pre>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-2xl opacity-0 animate-slide-up stagger-8">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Quick Install</h2>
            <p className="mb-4 text-sm text-text-secondary">
              Add logo-mcp to your Claude configuration:
            </p>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-text-muted">Local Development</p>
                <div className="group relative flex items-center gap-2 rounded-lg bg-background p-3">
                  <code className="flex-1 font-mono text-sm text-text-secondary">
                    claude mcp add --transport http logo-mcp {localUrl}/api/mcp
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(`claude mcp add --transport http logo-mcp ${localUrl}/api/mcp`)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-elevated text-text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-text-muted">Production</p>
                <div className="group relative flex items-center gap-2 rounded-lg bg-background p-3">
                  <code className="flex-1 font-mono text-sm text-text-secondary">
                    claude mcp add --transport http logo-mcp {productionUrl}/api/mcp
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(`claude mcp add --transport http logo-mcp ${productionUrl}/api/mcp`)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-elevated text-text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-xl text-center opacity-0 animate-slide-up stagger-8">
          <h2 className="mb-4 text-2xl font-bold text-text-primary">Ready to integrate?</h2>
          <p className="mb-8 text-text-secondary">
            Browse all icons or read the docs to get started.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/icons"
              className="inline-flex items-center gap-2 rounded-lg bg-surface-elevated border border-border px-6 py-3 text-sm font-weight-semibold text-text-primary transition-all hover:border-accent hover-lift"
            >
              Browse Icons
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-weight-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              View Setup Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <div 
      className="group card-spotlight rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/50 hover:bg-surface-elevated opacity-0 animate-scale-in"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary font-weight-semibold">
        {title}
      </h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  );
}