"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface IconData {
  title: string;
  slug: string;
  hex: string;
  source: string;
  svg: string;
  guidelines?: string;
  license?: { type: string; url: string };
  aliases?: {
    aka?: string[];
    old?: string[];
  };
}

const PRESET_COLORS = [
  { name: "Brand", hex: null },
  { name: "White", hex: "ffffff" },
  { name: "Black", hex: "000000" },
  { name: "Red", hex: "ef4444" },
  { name: "Orange", hex: "f97316" },
  { name: "Amber", hex: "f59e0b" },
  { name: "Yellow", hex: "eab308" },
  { name: "Lime", hex: "84cc16" },
  { name: "Green", hex: "22c55e" },
  { name: "Emerald", hex: "10b981" },
  { name: "Teal", hex: "14b8a6" },
  { name: "Cyan", hex: "06b6d4" },
  { name: "Sky", hex: "0ea5e9" },
  { name: "Blue", hex: "3b82f6" },
  { name: "Indigo", hex: "6366f1" },
  { name: "Violet", hex: "8b5cf6" },
  { name: "Purple", hex: "a855f7" },
  { name: "Fuchsia", hex: "d946ef" },
  { name: "Pink", hex: "ec4899" },
  { name: "Rose", hex: "f43f5e" },
];

const SIZES = [16, 24, 32, 48, 64, 128, 256];

export default function IconPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [icon, setIcon] = useState<IconData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState(128);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const response = await fetch("/api/icons/all");
        if (!response.ok) throw new Error("Failed to fetch icons");
        const allIcons = await response.json();
        const found = allIcons.find((i: IconData) => i.slug === slug);
        if (!found) {
          setError("Icon not found");
          return;
        }
        setIcon(found);
        setSelectedColor(found.hex);
      } catch (err) {
        setError("Failed to load icon");
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    loadIcon();
  }, [slug]);

  const getColoredSvg = useCallback((svg: string, hex: string | null) => {
    if (!hex || !icon) return svg;
    const color = `#${hex}`;
    return svg.replace("<svg ", `<svg fill="${color}" `);
  }, [icon]);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSvg = (hex: string | null) => {
    if (!icon) return;
    const svg = getColoredSvg(icon.svg, hex);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${icon.slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-8">
            <div className="skeleton mb-4 h-8 w-32 rounded" />
            <div className="skeleton h-12 w-64 rounded" />
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="skeleton h-80 rounded-xl" />
            <div className="space-y-4">
              <div className="skeleton h-48 rounded-xl" />
              <div className="skeleton h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !icon) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface mx-auto">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-error">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">Icon not found</h1>
          <p className="mb-8 text-text-secondary">The icon &quot;{slug}&quot; could not be found.</p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-weight-semibold text-black transition-all hover:bg-accent-hover"
          >
            Browse All Icons
          </Link>
        </div>
      </div>
    );
  }

  const currentHex = customColor ? customColor.replace("#", "") : selectedColor;
  const displaySvg = getColoredSvg(icon.svg, currentHex);

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="sticky top-24">
              <div className="flex items-center justify-center rounded-xl border border-border bg-surface-elevated p-12">
                <div
                  className="flex items-center justify-center transition-all"
                  style={{ width: previewSize, height: previewSize }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    dangerouslySetInnerHTML={{ __html: displaySvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") }}
                    className="h-full w-full"
                    style={{ color: currentHex ? `#${currentHex}` : icon.hex }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">Preview:</span>
                  <select
                    value={previewSize}
                    onChange={(e) => setPreviewSize(Number(e.target.value))}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary"
                  >
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                </div>
                <div
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1"
                  style={{ backgroundColor: currentHex ? `#${currentHex}20` : "transparent" }}
                >
                  <div
                    className="h-4 w-4 rounded-full border border-border-subtle"
                    style={{ backgroundColor: `#${currentHex || icon.hex}` }}
                  />
                  <code className="text-xs font-mono text-text-secondary">#{currentHex || icon.hex}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-text-primary">{icon.title}</h1>
              <p className="font-mono text-text-muted">{icon.slug}</p>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-text-primary uppercase tracking-wider">Color</h2>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setSelectedColor(preset.hex || icon.hex);
                      setCustomColor("");
                    }}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all hover:border-accent ${
                      (preset.hex || icon.hex) === currentHex
                        ? "border-accent bg-accent/10"
                        : "border-border bg-surface hover:bg-surface-elevated"
                    }`}
                  >
                    <div
                      className="h-6 w-6 rounded border border-border-subtle"
                      style={{
                        backgroundColor: preset.hex ? `#${preset.hex}` : icon.hex,
                      }}
                    />
                    <span className="text-xs text-text-secondary">{preset.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-text-secondary">Custom:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="#f59e0b"
                    value={customColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^#?[0-9a-fA-F]{0,6}$/.test(val)) {
                        setCustomColor(val);
                        if (val.length >= 7 || (val.length === 6 && !val.startsWith("#"))) {
                          setSelectedColor(val.replace("#", ""));
                        }
                      }
                    }}
                    className="w-28 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-mono text-text-primary placeholder-text-muted"
                  />
                  <input
                    type="color"
                    value={`#${currentHex || icon.hex}`}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedColor(e.target.value.replace("#", ""));
                    }}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-surface"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-text-primary uppercase tracking-wider">Export</h2>
              <div className="grid gap-3">
                <button
                  onClick={() => copyToClipboard(displaySvg, "svg")}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface-elevated"
                >
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="font-weight-medium text-text-primary">Copy SVG Code</span>
                  </div>
                  {copied === "svg" ? (
                    <span className="flex items-center gap-1 text-sm text-accent">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => downloadSvg(currentHex)}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface-elevated"
                >
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span className="font-weight-medium text-text-primary">Download SVG</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <a
                  href={icon.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface-elevated"
                >
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="font-weight-medium text-text-primary">View Source</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-text-primary uppercase tracking-wider">Details</h2>
              <dl className="space-y-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Brand Color</dt>
                  <dd className="font-mono text-text-primary">#{icon.hex}</dd>
                </div>
                {icon.license && (
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">License</dt>
                    <dd className="text-text-primary">{icon.license.type}</dd>
                  </div>
                )}
                {icon.aliases?.aka && icon.aliases.aka.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-text-secondary">Also known as</dt>
                    <dd className="flex flex-wrap gap-1">
                      {icon.aliases.aka.map((alias) => (
                        <span
                          key={alias}
                          className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted"
                        >
                          {alias}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}