'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Suggestion {
  title: string;
  type: string;
  slug: string;
}

function getTypeRoute(type: string): string {
  const routes: Record<string, string> = {
    articles: '/news',
    events: '/events',
    restaurants: '/dining',
    guides: '/guide',
    videos: '/videos',
    classifieds: '/classifieds',
    products: '/store',
  };
  return routes[type] || '/';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    articles: 'Article',
    events: 'Event',
    restaurants: 'Restaurant',
    guides: 'Guide',
    videos: 'Video',
    classifieds: 'Classified',
    products: 'Product',
  };
  return labels[type] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    articles: 'text-blue-600',
    events: 'text-purple-600',
    restaurants: 'text-orange-600',
    guides: 'text-green-600',
    videos: 'text-red-600',
    classifieds: 'text-yellow-600',
    products: 'text-pink-600',
  };
  return colors[type] || 'text-gray-600';
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Debounced search for suggestions
  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await apiClient.get('/search/suggest', {
          params: { q: searchQuery },
        });
        const items: Suggestion[] = (Array.isArray(data) ? data : data.suggestions ?? [])
          .slice(0, 8)
          .map((s: Record<string, unknown>) => ({
            title: String(s.title || ''),
            type: String(s.type || ''),
            slug: String(s.slug || ''),
          }));
        setSuggestions(items);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSuggestions([]);
    setIsOpen(false);
    setQuery('');
    router.push(`${getTypeRoute(suggestion.type)}/${suggestion.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Keyboard shortcut: Cmd/Ctrl+K to focus
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        if (!query) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Group suggestions by type
  const groupedSuggestions: Record<string, Suggestion[]> = {};
  for (const suggestion of suggestions) {
    if (!groupedSuggestions[suggestion.type]) {
      groupedSuggestions[suggestion.type] = [];
    }
    groupedSuggestions[suggestion.type].push(suggestion);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        aria-label="Open search"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs text-gray-400 bg-white border border-gray-300 rounded font-mono">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Berlin..."
            className="w-48 sm:w-64 pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setQuery('');
            setSuggestions([]);
          }}
          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {Object.entries(groupedSuggestions).map(([type, items]) => (
            <div key={type}>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                {getTypeLabel(type)}s
              </div>
              {items.map((suggestion, idx) => {
                const flatIndex = suggestions.indexOf(suggestion);
                return (
                  <button
                    key={`${type}-${idx}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(flatIndex)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      flatIndex === selectedIndex
                        ? 'bg-primary-50 text-primary-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs font-medium ${getTypeColor(type)}`}>
                      {getTypeLabel(type)}
                    </span>
                    <span className="truncate">{suggestion.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="border-t border-gray-100 px-3 py-2">
            <button
              onClick={handleSubmit}
              className="w-full text-left text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Search for &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
