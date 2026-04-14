# Simple Icons CDN & SDK Research
# For: logo-mcp open-source logo library

> Research compiled from official Simple Icons docs (simpleicons.org), GitHub README,
> CONTRIBUTING.md, and Context7 documentation indexing.
> Current version: v15+ (3300+ icons)

---

## Table of Contents

1. [npm Package & Installation](#1-npm-package--installation)
2. [Icon Object Structure](#2-icon-object-structure)
3. [SDK: getIconsData()](#3-sdk-geticonsdata)
4. [CDN Options](#4-cdn-options)
5. [SVG Structure & Coloring](#5-svg-structure--coloring)
6. [Alias System](#6-alias-system)
7. [Download Strategies](#7-download-strategies)
8. [Legal & Licensing](#8-legal--licensing)
9. [Icon Count & Coverage](#9-icon-count--coverage)
10. [Recommended Implementation Patterns](#10-recommended-implementation-patterns)

---

## 1. npm Package & Installation

```bash
npm install simple-icons
```

The package provides three entrypoints:

| Entrypoint | Use Case |
|---|---|
| `simple-icons` | Named exports for individual icons (tree-shakeable) |
| `simple-icons/sdk` | Build-time utilities: `getIconsData()`, `getIconSlug()` |
| `simple-icons/icons/[slug].svg` | Direct SVG file access |

### Individual Icon Import (Tree-Shakeable)

```typescript
import { siGithub, siStripe, siVercel } from "simple-icons";

console.log(siGithub.slug);   // "github"
console.log(siGithub.hex);    // "181717"
console.log(siGithub.svg);    // full SVG string
console.log(siGithub.path);   // SVG path data only
```

The naming convention: `si` prefix + PascalCase title.
- "GitHub" → `siGithub`
- "Amazon Web Services" → `siAmazonwebservices`
- Brand with special chars: normalized to alphanumeric

### TypeScript Support

The package ships full TypeScript types:

```typescript
import type { SimpleIcon } from "simple-icons";

const icon: SimpleIcon = siGithub;
// Fields: title, slug, hex, source, svg, path, guidelines?, license?
```

---

## 2. Icon Object Structure

Each icon object from the package or SDK has these fields:

```javascript
{
  title: "Simple Icons",             // Official brand name (required)
  slug: "simpleicons",               // URL-safe identifier (required)
  hex: "111111",                     // Brand color as 6-digit hex WITHOUT # (required)
  source: "https://simpleicons.org/",// Official SVG source URL (required)
  svg: "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>",
  path: "M12 12v-1.5c-2.484 ...",   // Just the <path d="..."> data
  guidelines: "https://simpleicons.org/styleguide", // Brand guidelines URL (optional)
  license: {                          // Optional — only present if documented
    type: "CC0-1.0",                  // SPDX license identifier
    url: "https://example.com/"       // License URL
  }
}
```

**Important notes:**
- `hex` does NOT include the `#` prefix — add it yourself: `#${icon.hex}`
- `guidelines` is `undefined` if not documented for that brand
- `license` is `undefined` if not documented (most brands)
- `svg` includes the full `<svg>` tag with `viewBox="0 0 24 24"`
- All icons use a 24×24 viewBox

---

## 3. SDK: getIconsData()

The SDK entrypoint is for build-time data access and search index building:

```typescript
import { getIconsData } from "simple-icons/sdk";

// Returns Promise<IconData[]>
const icons = await getIconsData();

// IconData has all fields from the icon object above
// PLUS the alias system (see Section 6)
```

### Build a Search Index

```typescript
// lib/simple-icons.ts — recommended pattern for logo-mcp
import { getIconsData } from "simple-icons/sdk";

interface SearchableIcon {
  title: string;
  slug: string;
  hex: string;
  source: string;
  guidelines?: string;
  searchText: string;
}

let cachedIndex: SearchableIcon[] | null = null;

export async function getIconIndex(): Promise<SearchableIcon[]> {
  if (cachedIndex) return cachedIndex;

  const icons = await getIconsData();

  cachedIndex = icons.map((icon) => ({
    title: icon.title,
    slug: icon.slug ?? icon.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
    hex: icon.hex,
    source: icon.source,
    guidelines: icon.guidelines,
    searchText: [
      icon.title,
      icon.slug,
      icon.guidelines,
      icon.license?.type,
      // Flatten aliases for search coverage
      ...(icon.aliases?.aka ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  return cachedIndex;
}

export async function searchIcons(query: string, limit = 10) {
  const index = await getIconIndex();
  const q = query.toLowerCase().trim();
  return index
    .filter((icon) => icon.searchText.includes(q))
    .slice(0, limit);
}

export async function findIconBySlug(slug: string) {
  const index = await getIconIndex();
  return index.find((icon) => icon.slug === slug);
}
```

### Alternative: Import All Icons at Runtime

```typescript
// Imports all icons as a single object (larger bundle, but synchronous)
import * as si from "simple-icons";

const icons = Object.values(si).filter(
  (v): v is SimpleIcon => typeof v === "object" && v !== null && "slug" in v
);
```

---

## 4. CDN Options

### Option A: cdn.simpleicons.org (Recommended for colored SVGs)

The official CDN with color support:

```html
<!-- Default brand color -->
<img src="https://cdn.simpleicons.org/github" width="32" height="32" />

<!-- Custom hex color (no #) -->
<img src="https://cdn.simpleicons.org/github/ff0000" width="32" height="32" />

<!-- Light/dark mode aware (light-color/dark-color) -->
<img src="https://cdn.simpleicons.org/github/000000/ffffff" width="32" height="32" />

<!-- Dark mode only (use _ as placeholder for light) -->
<img src="https://cdn.simpleicons.org/github/_/ffffff" width="32" height="32" />

<!-- Auto-sized viewBox (recommended for consistent sizing) -->
<img src="https://cdn.simpleicons.org/github?viewbox=auto" height="20" />
```

**Color formats supported:**
- 3-digit hex: `0cf`
- 3-digit hex + alpha: `0cf9`
- 6-digit hex: `00ccff`
- 6-digit hex + alpha: `00ccff99`
- CSS color keywords: `orange`, `pink`, `gray`

**Parameters:**
- `?viewbox=auto` — makes the viewBox match actual icon content (not always 24×24)

### Option B: jsDelivr (Versioned, for production stability)

```html
<img src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/github.svg" width="32" />
```

Use `@v15` (specific major version) rather than `@latest` to avoid 404 errors when icons are removed or renamed.

Versioned URL pattern:
```
https://cdn.jsdelivr.net/npm/simple-icons@{version}/icons/{slug}.svg
```

### Option C: unpkg

```html
<img src="https://unpkg.com/simple-icons@v15/icons/github.svg" width="32" />
```

### CDN Comparison

| CDN | Color Support | Versioned | Dark Mode | Recommended For |
|---|---|---|---|---|
| `cdn.simpleicons.org` | ✅ Built-in | ❌ Always latest | ✅ | UI display, theming |
| jsDelivr | ❌ Raw SVG only | ✅ | ❌ | Production stability |
| unpkg | ❌ Raw SVG only | ✅ | ❌ | Fallback |

### Option D: Serve from npm Package (Self-Hosted)

```typescript
// In a Next.js API route — serve SVG from local node_modules
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const svgPath = path.join(
    process.cwd(),
    "node_modules/simple-icons/icons",
    `${slug}.svg`
  );

  try {
    const svg = await readFile(svgPath, "utf-8");
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
```

Or access the `svg` property directly from the imported icon object:

```typescript
import { siGithub } from "simple-icons";
// siGithub.svg is already the full SVG string — no file I/O needed
```

---

## 5. SVG Structure & Coloring

### Raw SVG Format

```xml
<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <title>GitHub</title>
  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303..."/>
</svg>
```

All Simple Icons SVGs:
- Use a 24×24 viewBox
- Have a single `<path>` element (no `fill` attribute — inherits from CSS or parent)
- Include `<title>` for accessibility
- Use `role="img"` on the root element

### Dynamic Coloring

Since the path has no `fill`, it inherits from CSS:

```html
<!-- Set color via CSS -->
<svg style="fill: #635bff;">...</svg>

<!-- Or via CSS class -->
<svg class="text-purple-500" style="fill: currentColor;">...</svg>
```

For server-side coloring (injecting into SVG string):
```typescript
function colorSvg(svg: string, hex: string): string {
  const color = hex.startsWith("#") ? hex : `#${hex}`;
  // Inject fill on the root SVG element
  return svg.replace("<svg ", `<svg fill="${color}" `);
}
```

### Embedding Inline vs `<img>` Tag

| Method | Color Control | CSS Targeting | Animation | CORS |
|---|---|---|---|---|
| Inline `<svg>` | ✅ Full CSS | ✅ | ✅ | None |
| `<img src="...svg">` | ❌ None | ❌ | ❌ | Required |
| `<img src="cdn.simpleicons.org/...">` | ✅ Via URL param | ❌ | ❌ | Allowed |
| CSS `background-image` | ❌ | ❌ | ❌ | Allowed |

---

## 6. Alias System

The icon data includes an `aliases` field for search coverage:

```typescript
interface IconData {
  title: string;
  slug: string;
  // ...
  aliases?: {
    aka?: string[];   // "Also Known As" — alternative spellings/names
    dup?: Array<{ title: string; hex?: string; guidelines?: string; loc?: ... }>;
    loc?: { [languageCode: string]: string }; // localized names
    old?: string[];   // deprecated/old names that redirect
  };
}
```

**For search purposes, flatten `aka` and `old` into your search index:**

```typescript
const searchTerms = [
  icon.title,
  icon.slug,
  ...(icon.aliases?.aka ?? []),
  ...(icon.aliases?.old ?? []),
  ...(icon.aliases?.loc ? Object.values(icon.aliases.loc) : []),
].filter(Boolean).join(" ").toLowerCase();
```

Example: "AWS" would be in `aka` for Amazon Web Services.

---

## 7. Download Strategies

### Strategy A: Return SVG from CDN (Simplest)

For a download button or MCP tool:
```typescript
async function getLogoSvg(slug: string): Promise<string> {
  const res = await fetch(`https://cdn.simpleicons.org/${slug}`);
  if (!res.ok) throw new Error(`Logo not found: ${slug}`);
  return res.text(); // raw SVG string
}
```

### Strategy B: Return from npm Package (Fastest, No Network)

```typescript
async function getLogoSvgFromPackage(slug: string): Promise<string | null> {
  try {
    // Dynamic import by slug name (camelCase conversion)
    const iconName = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
    const si = await import("simple-icons");
    const icon = (si as any)[iconName];
    return icon?.svg ?? null;
  } catch {
    return null;
  }
}

// Or use getIconsData() and find by slug
import { getIconsData } from "simple-icons/sdk";
const icons = await getIconsData();
const icon = icons.find(i => i.slug === slug);
return icon?.svg ?? null;
```

### Strategy C: File System Access (Next.js API Route)

```typescript
// For a Next.js download route: app/api/logo/[slug]/route.ts
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // Sanitize: only allow alphanumeric slugs
  if (!/^[a-z0-9]+$/.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }

  const svgPath = path.join(
    process.cwd(),
    "node_modules/simple-icons/icons",
    `${slug}.svg`
  );

  const svg = await readFile(svgPath, "utf-8").catch(() => null);
  if (!svg) return new Response("Not found", { status: 404 });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${slug}.svg"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
```

---

## 8. Legal & Licensing

### Simple Icons License

The icons in Simple Icons are licensed under **CC0 1.0 Universal** (public domain dedication):
- You can use, modify, and distribute them without attribution
- No restrictions on commercial use

### Brand Trademark Disclaimer

**IMPORTANT:** The CC0 license applies to the SVG files created by Simple Icons contributors.
The actual brand logos and trademarks remain property of their respective owners.

From the Simple Icons README:
> "We ask that all users read our legal disclaimer before using icons from Simple Icons."

Key points for the logo-mcp project:
1. Include the legal disclaimer in your README
2. Make clear that icons are trademarks of their respective owners
3. Users are responsible for compliance with each brand's trademark guidelines
4. Many brands have `guidelines` URLs — surface these via `get_logo_metadata`
5. Do not imply endorsement or official affiliation

### Recommended Disclaimer Text for logo-mcp

```markdown
## Legal Notice

All brand logos are trademarks of their respective owners. The simple-icons package 
is licensed under CC0 1.0, which applies to the SVG files only — not the underlying 
brand trademarks. You are responsible for compliance with each brand's trademark 
guidelines when using their logos. Use `get_logo_metadata` to access official 
brand guidelines URLs.

This project is not affiliated with, endorsed by, or sponsored by Simple Icons 
or any of the brands whose logos are included.
```

---

## 9. Icon Count & Coverage

- **Current count:** 3,300+ SVG icons (grows with each release)
- **Major categories covered:** Tech companies, social media, developer tools, cloud providers, programming languages, databases, frameworks, design tools, crypto, media companies
- **Notable inclusions:** GitHub, Google, AWS, Azure, Vercel, Stripe, Figma, VS Code, Docker, Kubernetes, React, Vue, Angular, TypeScript, Python, Rust, Go
- **Version cadence:** Regular releases; follow semver; icons occasionally renamed/removed

**Checking if an icon exists:**
```typescript
const icon = icons.find(i => i.slug === slug);
if (!icon) {
  // suggest similar via search
}
```

---

## 10. Recommended Implementation Patterns for logo-mcp

### Data Loading Strategy

```typescript
// src/lib/simple-icons.ts
// Use the SDK for search (build-time friendly)
// Use npm package svg field for serving (no CDN dependency)

import { getIconsData, type IconData } from "simple-icons/sdk";

let _cache: IconData[] | null = null;

export async function getIcons(): Promise<IconData[]> {
  if (_cache) return _cache;
  _cache = await getIconsData();
  return _cache;
}

export async function searchIcons(query: string, limit = 10) {
  const icons = await getIcons();
  const q = query.toLowerCase();
  return icons
    .filter((icon) => {
      const searchable = [
        icon.title,
        icon.slug,
        ...(icon.aliases?.aka ?? []),
        ...(icon.aliases?.old ?? []),
      ].join(" ").toLowerCase();
      return searchable.includes(q);
    })
    .slice(0, limit)
    .map(({ title, slug, hex, source }) => ({ title, slug, hex, source }));
}
```

### CDN URL Builder

```typescript
export function getCdnUrl(slug: string, options?: {
  color?: string;        // hex without #
  darkColor?: string;    // for dark mode
  viewboxAuto?: boolean;
}): string {
  let url = `https://cdn.simpleicons.org/${slug}`;

  if (options?.color) {
    url += `/${options.color}`;
    if (options?.darkColor) {
      url += `/${options.darkColor}`;
    }
  }

  if (options?.viewboxAuto) {
    url += "?viewbox=auto";
  }

  return url;
}

// Examples:
getCdnUrl("stripe");                              // default brand color
getCdnUrl("stripe", { color: "635BFF" });         // custom color
getCdnUrl("stripe", { color: "635BFF", darkColor: "ffffff" }); // responsive
getCdnUrl("stripe", { viewboxAuto: true });       // auto-sized viewBox
```

### SVG Serving Priority

For the MCP server tools, use this priority order:

1. **Primary (fastest):** `icon.svg` from npm package (already in node_modules, no network)
2. **Secondary (more features):** `cdn.simpleicons.org/{slug}/{color}` (color params, always latest)
3. **Fallback:** jsDelivr versioned URL (stable, production-safe)

---

## References

- Simple Icons website: https://simpleicons.org
- GitHub repository: https://github.com/simple-icons/simple-icons
- npm package: https://www.npmjs.com/package/simple-icons
- Legal disclaimer: https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md
- CDN docs: https://simpleicons.org (see "CDN Usage" section)
- Contributing guide (alias structure): https://github.com/simple-icons/simple-icons/blob/develop/CONTRIBUTING.md
