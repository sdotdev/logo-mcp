export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-12 text-4xl font-bold">Documentation</h1>

        {/* Section 1: What is logo-mcp */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">What is logo-mcp?</h2>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6 text-zinc-300">
            <p className="mb-4">
              <strong>logo-mcp</strong> is an open-source Model Context Protocol (MCP) server that
              enables AI agents like Claude, Cursor, and other AI applications to easily search for
              and download brand logos as SVG files.
            </p>
            <p className="mb-4">
              Using the Model Context Protocol, your AI agent can ask "Find me the Stripe logo" or
              "Get the GitHub logo in blue" and the server will instantly return the SVG file.
            </p>
            <p>
              All logos come from the open-source Simple Icons library, which contains over 3,300
              brand logos in a consistent format.
            </p>
          </div>
        </section>

        {/* Section 2: How to Use with Claude Desktop */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">How to Use with Claude Desktop</h2>
          <div className="space-y-4">
            <p className="text-zinc-300">
              Follow these steps to add logo-mcp to Claude Desktop on your machine:
            </p>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
              <h3 className="mb-3 font-semibold text-cyan-400">Step 1: Find Your Config File</h3>
              <p className="mb-3 text-zinc-300">Open the Claude Desktop config file:</p>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <strong>macOS:</strong>
                  <br />
                  <code className="block rounded bg-black px-3 py-2">
                    ~/Library/Application Support/Claude/claude_desktop_config.json
                  </code>
                </p>
                <p>
                  <strong>Windows:</strong>
                  <br />
                  <code className="block rounded bg-black px-3 py-2">
                    %APPDATA%\Claude\claude_desktop_config.json
                  </code>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
              <h3 className="mb-3 font-semibold text-cyan-400">Step 2: Add logo-mcp Server</h3>
              <p className="mb-3 text-zinc-300">
                Add the following to your config file under the <code className="text-blue-400">mcpServers</code> section:
              </p>
              <pre className="overflow-x-auto rounded bg-black p-4 text-sm text-green-400">
                {`{
  "mcpServers": {
    "logo-mcp": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}`}
              </pre>
              <p className="mt-3 text-sm text-zinc-400">
                <strong>For local development:</strong> Use{" "}
                <code className="text-blue-400">http://localhost:3000/api/mcp</code>
              </p>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
              <h3 className="mb-3 font-semibold text-cyan-400">Step 3: Restart Claude Desktop</h3>
              <p className="text-zinc-300">
                Restart Claude Desktop completely. When it reopens, logo-mcp should appear in the
                Tools list in the bottom right.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
              <h3 className="mb-3 font-semibold text-cyan-400">Step 4: Start Using</h3>
              <p className="text-zinc-300">
                Now you can ask Claude: "Find me the Stripe logo" or "Get the GitHub logo as SVG"
                and Claude will use the logo-mcp tools automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How to Use with Claude.ai */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">How to Use with Claude.ai</h2>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6 text-zinc-300">
            <p className="mb-4">
              Claude.ai support for custom MCP servers is coming soon. For now, use Claude Desktop
              for the best experience with logo-mcp.
            </p>
          </div>
        </section>

        {/* Section 4: Available Tools */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">Available Tools</h2>

          <div className="space-y-6">
            {/* search_logo */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
              <h3 className="mb-3 font-semibold text-cyan-400">search_logo</h3>
              <p className="mb-3 text-sm text-zinc-300">
                Search for brand logos by name. Returns matching logos with slugs, titles, and
                brand colors.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-zinc-300">Parameters:</p>
                <ul className="list-inside list-disc space-y-1 text-zinc-400">
                  <li>
                    <code className="text-blue-400">query</code> (string): Brand name to search
                  </li>
                  <li>
                    <code className="text-blue-400">limit</code> (number, optional): Max results
                    (default: 10, max: 50)
                  </li>
                </ul>
                <p className="mt-3 font-semibold text-zinc-300">Example usage:</p>
                <code className="block rounded bg-black px-3 py-2 text-green-400">
                  search_logo(query="stripe", limit=5)
                </code>
              </div>
            </div>

            {/* get_logo_svg */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6">
              <h3 className="mb-3 font-semibold text-cyan-400">get_logo_svg</h3>
              <p className="mb-3 text-sm text-zinc-300">
                Retrieve the raw SVG markup for a brand logo. Returns SVG string ready to embed in
                HTML/CSS.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-zinc-300">Parameters:</p>
                <ul className="list-inside list-disc space-y-1 text-zinc-400">
                  <li>
                    <code className="text-blue-400">slug</code> (string): Simple Icons slug
                    (e.g., 'github', 'stripe')
                  </li>
                  <li>
                    <code className="text-blue-400">color</code> (string, optional): Hex color code
                    (e.g., 'FF0000' or '#FF0000')
                  </li>
                </ul>
                <p className="mt-3 font-semibold text-zinc-300">Example usage:</p>
                <code className="block rounded bg-black px-3 py-2 text-green-400">
                  get_logo_svg(slug="github") # Returns GitHub logo SVG
                  <br />
                  get_logo_svg(slug="stripe", color="#FF0000") # Returns red Stripe logo
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: How to Deploy */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">How to Deploy</h2>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6 text-zinc-300">
            <p className="mb-4">logo-mcp can be deployed to Vercel for production use.</p>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Push your code to GitHub</li>
              <li>Connect your repository to Vercel</li>
              <li>Deploy - Vercel will automatically build and deploy the MCP server</li>
              <li>
                Update your Claude Desktop config to use your Vercel URL instead of
                localhost
              </li>
            </ol>
            <p className="mt-4 text-sm">
              For detailed deployment instructions, see{" "}
              <code className="text-blue-400">CLAUDE.md</code> in the repository.
            </p>
          </div>
        </section>

        {/* Section 6: Legal */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">Legal & Licensing</h2>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-6 text-zinc-300">
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-cyan-400">Simple Icons License:</strong> All brand logos are
                provided under the CC0 1.0 license (public domain). You can use them freely without
                attribution.
              </p>
              <p>
                <strong className="text-cyan-400">Brand Trademarks:</strong> The brand logos and
                trademarks are property of their respective owners. Users are responsible for
                compliance with each brand's trademark guidelines.
              </p>
              <p>
                <strong className="text-cyan-400">More Info:</strong> Visit{" "}
                <a
                  href="https://simpleicons.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  simpleicons.org
                </a>{" "}
                for more information.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-zinc-700 pt-8">
          <p className="text-sm text-zinc-500">
            Have questions? Open an issue on{" "}
            <a
              href="https://github.com/sdotdev/logo-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
