import Link from "next/link";

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/icons/all",
    description: "Retrieve all available brand logos with their metadata",
    response: {
      type: "array",
      example: `[
  {
    "title": "GitHub",
    "slug": "github",
    "hex": "181717",
    "source": "https://github.com/simple-icons/simple-icons/issues/...",
    "svg": "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>"
  }
]`,
    },
  },
  {
    method: "GET",
    path: "/api/icons/search",
    description: "Search for logos by brand name or alias",
    params: [
      { name: "q", type: "string", required: true, description: "Search query" },
      { name: "limit", type: "number", required: false, default: "10", description: "Max results" },
    ],
    response: {
      type: "array",
      example: `[
  {
    "title": "Stripe",
    "slug": "stripe",
    "hex": "635bff",
    "source": "https://github.com/simple-icons/simple-icons/issues/..."
  }
]`,
    },
  },
];

const MCP_TOOLS = [
  {
    name: "search_logo",
    description: "Search for brand logos by name. Returns matching logos with slugs, titles, and brand colors.",
    params: [
      { name: "query", type: "string", required: true, description: "Brand name to search" },
      { name: "limit", type: "number", required: false, description: "Max results (default: 10, max: 50)" },
    ],
    example: `search_logo(query="stripe", limit=5)`,
  },
  {
    name: "get_logo_svg",
    description: "Retrieve the raw SVG markup for a brand logo. Returns SVG string ready to embed in HTML/CSS.",
    params: [
      { name: "slug", type: "string", required: true, description: "Simple Icons slug (e.g., 'github', 'stripe')" },
      { name: "color", type: "string", required: false, description: "Hex color code (e.g., 'FF0000' or '#FF0000')" },
    ],
    example: `get_logo_svg(slug="github")
get_logo_svg(slug="stripe", color="#FF0000")`,
  },
];

export default function ApiPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-3xl font-bold text-text-primary">API Reference</h1>
          <p className="text-lg text-text-secondary">
            REST endpoints and MCP tools for integrating logo-mcp into your applications.
          </p>
        </div>

        {/* REST API Section */}
        <section className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">REST API</h2>
              <p className="text-sm text-text-secondary">Direct HTTP endpoints</p>
            </div>
          </div>

          <div className="space-y-8">
            {API_ENDPOINTS.map((endpoint) => (
              <div key={endpoint.path} className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="flex items-center gap-4 border-b border-border bg-surface-elevated px-6 py-4">
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${
                    endpoint.method === "GET" 
                      ? "bg-success/20 text-success" 
                      : "bg-accent/20 text-accent"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-sm text-text-primary">{endpoint.path}</code>
                </div>
                <div className="p-6">
                  <p className="mb-6 text-text-secondary">{endpoint.description}</p>
                  
                  {endpoint.params && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-semibold text-text-primary">Parameters</h3>
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
                            {endpoint.params.map((param) => (
                              <tr key={param.name} className="border-b border-border-subtle">
                                <td className="py-2 font-mono text-accent">{param.name}</td>
                                <td className="py-2 text-text-muted">{param.type}</td>
                                <td className="py-2 text-text-muted">
                                  {param.required ? (
                                    <span className="text-error">Yes</span>
                                  ) : (
                                    <span>No (default: {param.default})</span>
                                  )}
                                </td>
                                <td className="py-2 text-text-secondary">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-text-primary">Response</h3>
                    <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                      <code className="text-text-secondary">{endpoint.response.example}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MCP Tools Section */}
        <section className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">MCP Tools</h2>
              <p className="text-sm text-text-secondary">Model Context Protocol tools for AI agents</p>
            </div>
          </div>

          <div className="space-y-6">
            {MCP_TOOLS.map((tool) => (
              <div key={tool.name} className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="border-b border-border bg-surface-elevated px-6 py-4">
                  <h3 className="font-mono text-base font-semibold text-accent">{tool.name}</h3>
                </div>
                <div className="p-6">
                  <p className="mb-6 text-text-secondary">{tool.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-semibold text-text-primary">Parameters</h3>
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
                          {tool.params.map((param) => (
                            <tr key={param.name} className="border-b border-border-subtle">
                              <td className="py-2 font-mono text-accent">{param.name}</td>
                              <td className="py-2 text-text-muted">{param.type}</td>
                              <td className="py-2 text-text-muted">
                                {param.required ? (
                                  <span className="text-error">Yes</span>
                                ) : (
                                  <span>No</span>
                                )}
                              </td>
                              <td className="py-2 text-text-secondary">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-text-primary">Example</h3>
                    <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                      <code className="text-success">{tool.example}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Configuration Section */}
        <section>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Claude Desktop Configuration</h2>
              <p className="text-sm text-text-secondary">How to connect logo-mcp to Claude</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <p className="mb-4 text-text-secondary">
              Add the following to your Claude Desktop config file:
            </p>
            <div className="mb-6 rounded-lg bg-background p-4">
              <p className="mb-2 text-sm text-text-muted">macOS:</p>
              <code className="block font-mono text-sm text-text-secondary">
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </code>
            </div>
            <div className="rounded-lg bg-background p-4">
              <pre className="overflow-x-auto text-sm">
                <code className="text-text-secondary">{`{
  "mcpServers": {
    "logo-mcp": {
      "url": "https://your-deployment.com/api/mcp"
    }
  }
}`}</code>
              </pre>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              For local development, use{" "}
              <code className="text-accent">http://localhost:3000/api/mcp</code>
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-border pt-12">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Documentation
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Browse Icons
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}