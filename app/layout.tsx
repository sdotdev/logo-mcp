import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavLink } from "./components/nav-link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "logo-mcp | Brand Logos for AI Agents",
  description: "MCP server enabling AI agents to search and download 3,300+ brand logos as SVGs from Simple Icons",
  keywords: ["logo", "brand", "svg", "mcp", "ai", "claude", "cursor"],
  openGraph: {
    title: "logo-mcp | Brand Logos for AI Agents",
    description: "MCP server enabling AI agents to search and download 3,300+ brand logos as SVGs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        
        <div className="noise-overlay" aria-hidden="true" />

        <nav className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-lg font-semibold text-text-primary transition-colors hover:text-accent"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="text-accent"
              >
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
              <span className="font-weight-semibold tracking-tight">logo-mcp</span>
            </Link>

            <div className="flex items-center gap-1">
              {[
                { href: "/", label: "Home" },
                { href: "/icons", label: "Icons" },
                { href: "/api-reference", label: "API" },
                { href: "/docs", label: "Docs" },
              ].map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/sdotdev/logo-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                aria-label="GitHub repository"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </nav>

        <main id="main-content" className="pt-16">
          {children}
        </main>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p className="text-sm text-text-muted">
              Logos from{" "}
              <a
                href="https://simpleicons.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-text-primary"
              >
                Simple Icons
              </a>{" "}
              · CC0 1.0 license · brand trademarks belong to their respective owners
            </p>
            <nav className="flex items-center gap-6 text-sm text-text-muted" aria-label="Footer">
              <a
                href="https://github.com/sdotdev/logo-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-text-secondary"
              >
                GitHub
              </a>
              <Link href="/docs" className="transition-colors hover:text-text-secondary">Docs</Link>
              <Link href="/api-reference" className="transition-colors hover:text-text-secondary">API</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}