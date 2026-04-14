import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      <main className="mx-auto max-w-4xl px-6 py-24">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              logo-mcp
            </span>
          </h1>
          <p className="mb-2 text-xl text-zinc-300">
            Model Context Protocol Server for Brand Logos
          </p>
          <p className="mb-8 text-lg text-zinc-400">
            Enable AI agents to search and download 3300+ brand logos from Simple Icons
          </p>

          {/* Quick Description */}
          <div className="mb-12 rounded-lg border border-zinc-700 bg-zinc-900/50 p-6">
            <p className="text-left text-zinc-300">
              <strong>logo-mcp</strong> is an open-source MCP server that makes it easy for Claude,
              Cursor, and other AI agents to find and download brand logos as SVGs. Agents can
              search by brand name or request specific logos, and the server returns the SVG
              instantly.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
            <h3 className="mb-2 text-lg font-semibold text-blue-400">🔍 Search</h3>
            <p className="text-zinc-400">Find logos by brand name with intelligent search</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
            <h3 className="mb-2 text-lg font-semibold text-cyan-400">⚡ Instant SVG</h3>
            <p className="text-zinc-400">Get clean, optimized SVG files ready to use</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
            <h3 className="mb-2 text-lg font-semibold text-blue-400">🤖 AI-Ready</h3>
            <p className="text-zinc-400">Designed for Claude, Cursor, and other AI agents</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/browse"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold transition-colors hover:bg-blue-700"
          >
            Browse Icons
          </Link>
          <Link
            href="/search"
            className="rounded-lg bg-cyan-600 px-8 py-3 font-semibold transition-colors hover:bg-cyan-700"
          >
            Search Icons
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-zinc-600 px-8 py-3 font-semibold transition-colors hover:border-zinc-400 hover:bg-zinc-800"
          >
            Documentation
          </Link>
        </div>

        {/* Footer Info */}
        <div className="border-t border-zinc-700 pt-12 text-center text-zinc-400">
          <p>
            Powered by{" "}
            <a
              href="https://simpleicons.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              Simple Icons
            </a>
            {" • "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              Model Context Protocol
            </a>
            {" • "}
            <a
              href="https://github.com/sdotdev/logo-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              Open Source
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
