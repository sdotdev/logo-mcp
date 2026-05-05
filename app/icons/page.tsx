"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

const ITEMS_PER_PAGE = 48;

interface IconData {
  title: string;
  slug: string;
  hex: string;
  source: string;
  svg: string;
}

function svgToPngDataUrl(svgString: string, size: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("No canvas context"));
      return;
    }
    
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG"));
    };
    
    img.src = url;
  });
}

interface BatchResult {
  input: string;
  brand: string;
  slug: string;
  hex: string;
  found: boolean;
  source: string;
  pngDataUrl?: string;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="skeleton h-14 w-14 rounded-lg" />
      <div className="space-y-2 text-center w-full">
        <div className="skeleton mx-auto h-4 w-24 rounded" />
        <div className="skeleton mx-auto h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-3 w-3 rounded-full" />
    </div>
  );
}

function IconCard({ 
  icon, 
  onCopy,
  onDownloadPng 
}: { 
  icon: IconData; 
  onCopy: (svg: string, slug: string) => void;
  onDownloadPng?: (slug: string, svg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(icon.svg, icon.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePng = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownloadPng) {
      onDownloadPng(icon.slug, icon.svg);
    }
  };

  return (
    <div className="group relative rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/50 hover:bg-surface-elevated">
      <Link
        href={`/icon/${icon.slug}`}
        className="flex flex-col items-center gap-3"
      >
        <div 
          className="flex h-14 w-14 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
          style={{ backgroundColor: `#${icon.hex}20` }}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: icon.svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") }}
            className="h-8 w-8"
            style={{ color: `#${icon.hex}` }}
          />
        </div>
        <div className="min-w-0 text-center w-full">
          <p className="truncate text-sm font-weight-medium text-text-primary">{icon.title}</p>
          <p className="truncate text-xs text-text-muted">{icon.slug}</p>
        </div>
        <div 
          className="h-3 w-3 rounded-full border border-border-subtle"
          style={{ backgroundColor: `#${icon.hex}` }}
          title={`#${icon.hex}`}
        />
      </Link>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated hover:bg-accent hover:text-black transition-colors"
          title="Copy SVG"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
        <button
          onClick={handlePng}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated hover:bg-accent hover:text-black transition-colors"
          title="Download PNG"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function BatchModal({
  isOpen,
  onClose,
  results,
  icons,
  loading,
  onCopy,
}: {
  isOpen: boolean;
  onClose: () => void;
  results: BatchResult[];
  icons: IconData[];
  loading: boolean;
  onCopy: (svg: string, slug: string) => void;
}) {
  if (!isOpen) return null;

  const foundResults = results.filter(r => r.found);
  const notFound = results.filter(r => !r.found);

  const handleDownloadAll = async () => {
    for (const result of foundResults) {
      const icon = icons.find(i => i.slug === result.slug);
      if (icon) {
        try {
          const dataUrl = await svgToPngDataUrl(icon.svg, 256);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${result.slug}.png`;
          link.click();
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.error("Failed to download", result.slug);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-bold text-text-primary">Batch Results</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-text-secondary">
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Processing brands...
              </div>
            </div>
          ) : (
            <>
              {foundResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-text-secondary">
                    Found ({foundResults.length})
                  </h3>
                  <div className="space-y-2">
                    {foundResults.map((result) => {
                      const icon = icons.find(i => i.slug === result.slug);
                      if (!icon) return null;
                      return (
                        <div
                          key={result.input}
                          className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3"
                        >
                          <div 
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `#${result.hex}20` }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              dangerouslySetInnerHTML={{ __html: icon.svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") }}
                              className="h-6 w-6"
                              style={{ color: `#${result.hex}` }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-weight-medium text-text-primary">{result.brand}</p>
                            <p className="text-xs text-text-muted">{result.input} → {result.slug} ({result.source})</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="h-4 w-4 rounded-full border border-border-subtle"
                              style={{ backgroundColor: `#${result.hex}` }}
                            />
                            <button
                              onClick={() => onCopy(icon.svg, icon.slug)}
                              className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-weight-medium text-text-secondary hover:border-accent hover:text-accent transition-colors"
                            >
                              Copy
                            </button>
                            <Link
                              href={`/icon/${result.slug}`}
                              className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-weight-medium text-text-secondary hover:border-accent hover:text-accent transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {notFound.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-text-secondary">
                    Not Found ({notFound.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {notFound.map((result) => (
                      <span
                        key={result.input}
                        className="rounded-full border border-error/30 bg-error/10 px-3 py-1 text-sm text-error"
                      >
                        {result.input}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {foundResults.length > 0 && (
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-weight-semibold text-black transition-all hover:bg-accent-hover"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download All PNGs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IconsPage() {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [displayedIcons, setDisplayedIcons] = useState<IconData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<{ message: string; slug: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const response = await fetch("/api/icons/all");
        if (!response.ok) throw new Error("Failed to fetch icons");
        const allIcons = await response.json();
        setIcons(allIcons);
        setDisplayedIcons(allIcons.slice(0, ITEMS_PER_PAGE));
        setPage(1);
      } catch (error) {
        console.error("Error loading icons:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    loadIcons();
  }, []);

  const filteredIcons = useCallback(() => {
    if (!searchQuery.trim()) return displayedIcons;
    const query = searchQuery.toLowerCase().trim();
    return icons.filter(
      icon => 
        icon.title.toLowerCase().includes(query) || 
        icon.slug.toLowerCase().includes(query)
    );
  }, [displayedIcons, icons, searchQuery]);

  const loadMore = useCallback(() => {
    if (loadingMore || page * ITEMS_PER_PAGE >= icons.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const endIdx = nextPage * ITEMS_PER_PAGE;
      setDisplayedIcons(icons.slice(0, endIdx));
      setPage(nextPage);
      setLoadingMore(false);
    }, 300);
  }, [page, icons, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading && !searchQuery) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loadingMore, loading, searchQuery]);

  const handleCopy = (svg: string, slug: string) => {
    navigator.clipboard.writeText(svg);
    setToast({ message: "SVG copied!", slug });
    setTimeout(() => setToast(null), 2000);
  };

  const handleDownloadPng = async (slug: string, svg: string) => {
    try {
      const dataUrl = await svgToPngDataUrl(svg, 256);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${slug}.png`;
      link.click();
    } catch (e) {
      console.error("PNG download failed:", e);
    }
  };

  const handleBatchProcess = async () => {
    if (!batchInput.trim()) return;
    
    const brands = batchInput
      .split(/[\n,]+/)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    if (brands.length === 0) return;

    setBatchLoading(true);
    setBatchModalOpen(true);
    setBatchResults([]);

    try {
      const response = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: brands }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setBatchResults(data.results);
      }
    } catch (error) {
      console.error("Batch error:", error);
    } finally {
      setBatchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8">
            <div className="skeleton mb-2 h-9 w-40 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>
          <div className="skeleton h-12 w-full rounded-xl mb-8" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const visibleIcons = filteredIcons();

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Icons</h1>
          <p className="text-text-secondary">
            {searchQuery 
              ? `Found ${visibleIcons.length} result${visibleIcons.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : `${displayedIcons.length.toLocaleString()} of ${icons.length.toLocaleString()} icons loaded`
            }
          </p>
        </div>

        <div className="relative mb-8">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by brand name (e.g., stripe, github, google)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-4 pl-12 pr-4 text-text-primary placeholder-text-muted transition-all focus:border-accent focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {visibleIcons.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleIcons.map((icon) => (
              <IconCard key={icon.slug} icon={icon} onCopy={handleCopy} onDownloadPng={handleDownloadPng} />
            ))}
            {!searchQuery && loadingMore && Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={`loading-${i}`} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <line x1="8" y1="8" x2="14" y2="14" />
                <line x1="14" y1="8" x2="8" y2="14" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">No icons found</h2>
            <p className="text-text-secondary">
              Try a different search term or use batch lookup below
            </p>
          </div>
        ) : null}

        {!searchQuery && (
          <div ref={observerTarget} className="mt-12 flex justify-center">
            {!loadingMore && displayedIcons.length >= icons.length && (
              <div className="flex items-center gap-2 text-text-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                All {icons.length.toLocaleString()} icons loaded
              </div>
            )}
          </div>
        )}

        <div className="mt-20 border-t border-border pt-12">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Batch Lookup</h2>
              <p className="text-sm text-text-secondary">
                Paste multiple brand names (one per line or comma-separated) to get logos for all of them at once
              </p>
            </div>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="stripe&#10;github&#10;google&#10;fb&#10;AAPL&#10;stripe.com"
              className="w-full h-32 rounded-lg border border-border bg-background p-4 text-sm text-text-primary placeholder-text-muted resize-none font-mono"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-text-muted">
                Supports: brand names, slugs, aliases (fb, gh), tickers (AAPL), domains (stripe.com)
              </p>
              <button
                onClick={handleBatchProcess}
                disabled={!batchInput.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-weight-semibold text-black transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Get Logos
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="flex items-center gap-3 rounded-lg border border-accent bg-surface-elevated px-4 py-3 shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-weight-medium text-text-primary">
              {toast.message} <span className="text-text-muted">{toast.slug}</span>
            </span>
          </div>
        </div>
      )}

      <BatchModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        results={batchResults}
        icons={icons}
        loading={batchLoading}
        onCopy={handleCopy}
      />
    </div>
  );
}