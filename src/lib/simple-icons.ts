import * as si from "simple-icons";

export interface IconData {
  title: string;
  slug: string;
  hex: string;
  source: string;
  svg: string;
  path?: string;
  guidelines?: string;
  license?: { type: string; url: string };
  aliases?: {
    aka?: string[];
    old?: string[];
    loc?: Record<string, string>;
  };
}

let _cache: IconData[] | null = null;

/**
 * Get all icons from Simple Icons, with caching
 */
export async function getIcons(): Promise<IconData[]> {
  if (_cache) return _cache;

  const icons = Object.values(si).filter(
    (v): v is IconData =>
      v && typeof v === "object" && "slug" in v && "svg" in v
  );

  _cache = icons;
  return _cache;
}

/**
 * Search for icons by query string
 * Searches title, slug, and aliases (aka + old)
 */
export async function searchIcons(
  query: string,
  limit = 10
): Promise<
  Array<{
    title: string;
    slug: string;
    hex: string;
    source: string;
  }>
> {
  const icons = await getIcons();
  const q = query.toLowerCase().trim();

  const results = icons
    .filter((icon) => {
      const searchable = [
        icon.title,
        icon.slug,
        ...(icon.aliases?.aka ?? []),
        ...(icon.aliases?.old ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    })
    .slice(0, limit)
    .map(({ title, slug, hex, source }) => ({
      title,
      slug,
      hex,
      source,
    }));

  return results;
}

/**
 * Find a single icon by slug
 */
export async function findIconBySlug(slug: string): Promise<IconData | null> {
  const icons = await getIcons();
  return icons.find((icon) => icon.slug === slug) ?? null;
}

/**
 * Get full icon data including SVG
 */
export async function getIcon(slug: string): Promise<IconData | null> {
  return findIconBySlug(slug);
}

/**
 * List all icons with pagination
 */
export async function listIcons(
  page = 1,
  limit = 20
): Promise<{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  icons: Array<{ title: string; slug: string; hex: string }>;
}> {
  const icons = await getIcons();
  const total = icons.length;
  const offset = (page - 1) * limit;
  const pageIcons = icons
    .slice(offset, offset + limit)
    .map(({ title, slug, hex }) => ({
      title,
      slug,
      hex,
    }));

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    icons: pageIcons,
  };
}

/**
 * Inject a color into SVG string by adding fill attribute
 */
export function colorSvg(svg: string, hex: string): string {
  const color = hex.startsWith("#") ? hex : `#${hex}`;
  return svg.replace("<svg ", `<svg fill="${color}" `);
}
