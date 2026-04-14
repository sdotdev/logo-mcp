"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface IconData {
  title: string;
  slug: string;
  hex: string;
  source: string;
  svg: string;
}

interface SearchResult {
  title: string;
  slug: string;
  hex: string;
  source: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allIcons, setAllIcons] = useState<IconData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load all icons on mount
  useEffect(() => {
    const loadIcons = async () => {
      try {
        const response = await fetch("/api/icons/all");
        if (!response.ok) throw new Error("Failed to fetch icons");
        const icons = await response.json();
        setAllIcons(icons);
      } catch (error) {
        console.error("Error loading icons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, []);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(`/api/icons/search?q=${encodeURIComponent(searchQuery)}&limit=100`);
        if (!response.ok) throw new Error("Failed to search icons");
        const searchResults = await response.json();
        setResults(searchResults);
      } catch (error) {
        console.error("Error searching icons:", error);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);

    // Debounce the search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(newQuery);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="mb-8 text-4xl font-bold text-white">Search Icons</h1>
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
        <h1 className="mb-8 text-4xl font-bold text-white">Search Icons</h1>

        {/* Search Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by brand name (e.g., 'stripe', 'github', 'aws')..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-6 py-4 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Results Count */}
        {query && (
          <p className="mb-6 text-sm text-zinc-400">
            {searching ? "Searching..." : `Found ${results.length} result${results.length !== 1 ? "s" : ""}`}
          </p>
        )}

        {/* No Query Message */}
        {!query && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center text-zinc-500">
              <p className="text-lg">Enter a brand name to search</p>
              <p className="text-sm">Search across {allIcons.length} brand logos</p>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {query && !searching && results.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center text-zinc-500">
              <p className="text-lg">No logos found matching "{query}"</p>
              <p className="text-sm">Try a different brand name</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {results.map((result) => {
              const icon = allIcons.find((i) => i.slug === result.slug);
              if (!icon) return null;

              return (
                <div
                  key={result.slug}
                  className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/30 p-4 transition-all hover:border-blue-500 hover:bg-zinc-900/60"
                >
                  <a
                    href={result.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-16 w-16 items-center justify-center rounded transition-transform group-hover:scale-110"
                    title={result.title}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      dangerouslySetInnerHTML={{ __html: icon.svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "") }}
                      className="h-full w-full fill-current text-white"
                    />
                  </a>
                  <div className="min-w-0 text-center">
                    <p className="truncate text-sm font-medium text-zinc-200">{result.title}</p>
                    <p className="truncate text-xs text-zinc-500">{result.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded border border-zinc-600"
                      style={{ backgroundColor: `#${result.hex}` }}
                    />
                    <code className="text-xs text-zinc-500">#{result.hex}</code>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
