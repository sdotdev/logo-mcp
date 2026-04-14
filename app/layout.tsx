import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "logo-mcp - MCP Server for Brand Logos",
  description: "Enable AI agents to search and download 3300+ brand logos from Simple Icons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black">
        {/* Navigation Bar */}
        <nav className="border-b border-zinc-800 bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
                logo-mcp
              </Link>
              <div className="flex gap-8">
                <Link
                  href="/"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Home
                </Link>
                <Link
                  href="/browse"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Browse
                </Link>
                <Link
                  href="/search"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Search
                </Link>
                <Link
                  href="/docs"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Docs
                </Link>
                <a
                  href="https://github.com/sdotdev/logo-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
