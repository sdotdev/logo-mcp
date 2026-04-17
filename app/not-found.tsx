import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-accent/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-surface">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                className="text-accent"
              >
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold text-text-primary">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Page not found</h2>
        <p className="mb-8 text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-weight-semibold text-black transition-all hover:bg-accent-hover hover-lift"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-weight-semibold text-text-primary transition-all hover:bg-surface-elevated hover-lift"
          >
            Browse Icons
          </Link>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <p className="mb-4 text-sm text-text-muted">Quick links</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/search" className="text-text-secondary hover:text-accent transition-colors">
              Search
            </Link>
            <Link href="/docs" className="text-text-secondary hover:text-accent transition-colors">
              Documentation
            </Link>
            <Link href="/api-reference" className="text-text-secondary hover:text-accent transition-colors">
              API Reference
            </Link>
            <a 
              href="https://github.com/sdotdev/logo-mcp" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}