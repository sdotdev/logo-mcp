"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const ITEMS_PER_PAGE = 30;

interface IconData {
  title: string;
  slug: string;
  hex: string;
  source: string;
  svg: string;
}

export default function BrowsePage() {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [displayedIcons, setDisplayedIcons] = useState<IconData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load all icons once
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
        setLoading(false);
      }
    };

    loadIcons();
  }, []);

  // Load more icons when scrolling
  const loadMore = useCallback(() => {
    if (loadingMore || page * ITEMS_PER_PAGE >= icons.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIdx = 0;
      const endIdx = nextPage * ITEMS_PER_PAGE;
      setDisplayedIcons(icons.slice(startIdx, endIdx));
      setPage(nextPage);
      setLoadingMore(false);
    }, 300);
  }, [page, icons, loadingMore]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loadingMore, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="mb-8 text-4xl font-bold text-white">Browse Icons</h1>
          <div className="flex items-center justify-center py-24">
            <div className="text-zinc-400">Loading icons...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-2 text-4xl font-bold text-white">Browse Icons</h1>
        <p className="mb-8 text-zinc-400">
          Scroll to load more • {displayedIcons.length} of {icons.length} icons loaded
        </p>

        {/* Icon Grid */}
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {displayedIcons.map((icon) => (
            <div
              key={icon.slug}
              className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/30 p-4 transition-all hover:border-blue-500 hover:bg-zinc-900/60"
            >
              <a
                href={icon.source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded transition-transform group-hover:scale-110"
                title={icon.title}
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  dangerouslySetInnerHTML={{ __html: icon.svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") }}
                  className="h-full w-full fill-current text-white"
                />
              </a>
              <div className="min-w-0 text-center">
                <p className="truncate text-xs font-medium text-zinc-300">{icon.title}</p>
                <p className="truncate text-xs text-zinc-500">{icon.slug}</p>
              </div>
              <div
                className="h-3 w-3 rounded-full border border-zinc-600"
                style={{ backgroundColor: `#${icon.hex}` }}
                title={`#${icon.hex}`}
              />
            </div>
          ))}
        </div>

        {/* Infinite scroll observer target */}
        <div ref={observerTarget} className="mt-12 flex justify-center">
          {loadingMore && <div className="text-zinc-400">Loading more icons...</div>}
          {!loadingMore && displayedIcons.length >= icons.length && (
            <div className="text-zinc-500">All {icons.length} icons loaded</div>
          )}
        </div>
      </div>
    </div>
  );
}
