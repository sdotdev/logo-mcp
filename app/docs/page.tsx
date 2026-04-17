import Link from "next/link";

const DOCS_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "setup", label: "Setup" },
  { id: "tools", label: "Tools" },
  { id: "deploy", label: "Deploy" },
  { id: "legal", label: "Legal" },
];

export default function DocsPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-3xl font-bold text-text-primary">Documentation</h1>
          <p className="text-lg text-text-secondary">
            Everything you need to integrate logo-mcp into your AI workflows.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-4">
          <nav className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="mb-4 text-sm font-semibold text-text-primary uppercase tracking-wider">Contents</h2>
              <ul className="space-y-2">
                {DOCS_SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Need help?</h3>
                <p className="mb-4 text-sm text-text-secondary">
                  Open an issue on GitHub for bugs or feature requests.
                </p>
                <a
                  href="https://github.com/sdotdev/logo-mcp/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  GitHub Issues
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </nav>

          <div className="lg:col-span-3 space-y-16">
            <section id="overview">
              <h2 className="mb-6 text-2xl font-bold text-text-primary">What is logo-mcp?</h2>
              <div className="rounded-xl border border-border bg-surface p-6">
                <p className="mb-4 text-text-secondary">
                  <span className="text-text-primary font-weight-semibold">logo-mcp</span> is an open-source Model Context Protocol (MCP) server that enables AI agents like Claude, Cursor, and other AI applications to easily search for and download brand logos as SVG files.
                </p>
                <p className="mb-4 text-text-secondary">
                  Using the Model Context Protocol, your AI agent can ask &quot;Find me the Stripe logo&quot; or &quot;Get the GitHub logo in blue&quot; and the server will instantly return the SVG file.
                </p>
                <p className="text-text-secondary">
                  All logos come from the open-source Simple Icons library, which contains over <span className="text-accent font-weight-semibold">3,300 brand logos</span> in a consistent format.
                </p>
              </div>
            </section>

            <section id="setup">
              <h2 className="mb-6 text-2xl font-bold text-text-primary">Setup with Claude Desktop</h2>
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent font-weight-semibold">1</span>
                    <h3 className="text-lg font-semibold text-text-primary">Find Your Config File</h3>
                  </div>
                  <p className="mb-4 text-text-secondary">Open the Claude Desktop config file:</p>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg bg-background p-4">
                      <p className="mb-1 text-text-muted">macOS</p>
                      <code className="font-mono text-text-secondary">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                    </div>
                    <div className="rounded-lg bg-background p-4">
                      <p className="mb-1 text-text-muted">Windows</p>
                      <code className="font-mono text-text-secondary">%APPDATA%\Claude\claude_desktop_config.json</code>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent font-weight-semibold">2</span>
                    <h3 className="text-lg font-semibold text-text-primary">Add logo-mcp Server</h3>
                  </div>
                  <p className="mb-4 text-text-secondary">
                    Add the following to your config file under the <code className="text-accent">mcpServers</code> section:
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                    <code className="text-text-secondary">{`{
  "mcpServers": {
    "logo-mcp": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}`}</code>
                  </pre>
                  <p className="mt-4 text-sm text-text-muted">
                    For production, replace the URL with your deployed endpoint (e.g., https://logo-mcp.vercel.app/api/mcp)
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent font-weight-semibold">3</span>
                    <h3 className="text-lg font-semibold text-text-primary">Restart Claude</h3>
                  </div>
                  <p className="text-text-secondary">
                    Restart Claude Desktop completely. When it reopens, logo-mcp should appear in the Tools list.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent font-weight-semibold">4</span>
                    <h3 className="text-lg font-semibold text-text-primary">Start Using</h3>
                  </div>
                  <p className="text-text-secondary">
                    Now you can ask Claude: &quot;Find me the Stripe logo&quot; or &quot;Get the GitHub logo as SVG&quot; and Claude will use the logo-mcp tools automatically.
                  </p>
                </div>
              </div>
            </section>

            <section id="tools">
              <h2 className="mb-6 text-2xl font-bold text-text-primary">Available MCP Tools</h2>
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="border-b border-border bg-surface-elevated px-6 py-4">
                    <h3 className="font-mono text-lg font-semibold text-accent">search_logo</h3>
                  </div>
                  <div className="p-6">
                    <p className="mb-6 text-text-secondary">
                      Search for brand logos by name. Returns matching logos with slugs, titles, and brand colors.
                    </p>
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold text-text-primary">Parameters</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="pb-2 text-left text-text-secondary">Name</th>
                              <th className="pb-2 text-left text-text-secondary">Type</th>
                              <th className="pb-2 text-left text-text-secondary">Required</th>
                              <th className="pb-2 text-left text-text-secondary">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border-subtle">
                              <td className="py-2 font-mono text-accent">query</td>
                              <td className="py-2 text-text-muted">string</td>
                              <td className="py-2 text-error">Yes</td>
                              <td className="py-2 text-text-secondary">Brand name to search</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-mono text-accent">limit</td>
                              <td className="py-2 text-text-muted">number</td>
                              <td className="py-2 text-text-muted">No</td>
                              <td className="py-2 text-text-secondary">Max results (default: 10, max: 50)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-text-primary">Example</h4>
                      <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                        <code className="text-success">search_logo(query=&quot;stripe&quot;, limit=5)</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="border-b border-border bg-surface-elevated px-6 py-4">
                    <h3 className="font-mono text-lg font-semibold text-accent">get_logo_svg</h3>
                  </div>
                  <div className="p-6">
                    <p className="mb-6 text-text-secondary">
                      Retrieve the raw SVG markup for a brand logo. Returns SVG string ready to embed in HTML/CSS.
                    </p>
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold text-text-primary">Parameters</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="pb-2 text-left text-text-secondary">Name</th>
                              <th className="pb-2 text-left text-text-secondary">Type</th>
                              <th className="pb-2 text-left text-text-secondary">Required</th>
                              <th className="pb-2 text-left text-text-secondary">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border-subtle">
                              <td className="py-2 font-mono text-accent">slug</td>
                              <td className="py-2 text-text-muted">string</td>
                              <td className="py-2 text-error">Yes</td>
                              <td className="py-2 text-text-secondary">Simple Icons slug (e.g., &apos;github&apos;, &apos;stripe&apos;)</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-mono text-accent">color</td>
                              <td className="py-2 text-text-muted">string</td>
                              <td className="py-2 text-text-muted">No</td>
                              <td className="py-2 text-text-secondary">Hex color code (e.g., &apos;FF0000&apos; or &apos;#FF0000&apos;)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-text-primary">Examples</h4>
                      <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                        <code className="text-success">get_logo_svg(slug=&quot;github&quot;)
get_logo_svg(slug=&quot;stripe&quot;, color=&quot;#FF0000&quot;)</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="deploy">
              <h2 className="mb-6 text-2xl font-bold text-text-primary">Deploy to Production</h2>
              <div className="rounded-xl border border-border bg-surface p-6">
                <p className="mb-6 text-text-secondary">
                  logo-mcp can be deployed to Vercel for production use.
                </p>
                <ol className="list-decimal list-inside space-y-3 text-text-secondary">
                  <li>Push your code to a GitHub repository</li>
                  <li>Connect your repository to Vercel</li>
                  <li>Vercel will automatically build and deploy the MCP server</li>
                  <li>Update your Claude Desktop config to use your Vercel URL instead of localhost</li>
                </ol>
                <div className="mt-6 rounded-lg bg-accent/10 p-4">
                  <p className="text-sm text-text-secondary">
                    <span className="font-weight-semibold text-accent">Tip:</span> Check the deployment URL works by visiting it in your browser. You should see a JSON response with the MCP server info.
                  </p>
                </div>
              </div>
            </section>

            <section id="legal">
              <h2 className="mb-6 text-2xl font-bold text-text-primary">Legal & Licensing</h2>
              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">Simple Icons License</h3>
                    <p className="text-text-secondary">
                      All brand logos are provided under the <span className="text-accent">CC0 1.0</span> license (public domain). You can use them freely without attribution.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">Brand Trademarks</h3>
                    <p className="text-text-secondary">
                      The brand logos and trademarks are property of their respective owners. Users are responsible for compliance with each brand&apos;s trademark guidelines.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">More Information</h3>
                    <a
                      href="https://simpleicons.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:underline"
                    >
                      Visit simpleicons.org
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}