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
    articles: 'News',
    events: 'Events',
    restaurants: 'Dining',
    guides: 'Guides',
    videos: 'Videos',
    classifieds: 'Classifieds',
    products: 'Store',
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

function getTypeBgColor(type: string): string {
  const colors: Record<string, string> = {
    articles: 'bg-blue-50 text-blue-700 border-blue-100',
    events: 'bg-purple-50 text-purple-700 border-purple-100',
    restaurants: 'bg-orange-50 text-orange-700 border-orange-100',
    guides: 'bg-green-50 text-green-700 border-green-100',
    videos: 'bg-red-50 text-red-700 border-red-100',
    classifieds: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    products: 'bg-pink-50 text-pink-700 border-pink-100',
  };
  return colors[type] || 'bg-gray-50 text-gray-700 border-gray-100';
}

/** SVG icon per content type */
function TypeIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  const color = getTypeColor(type);
  const cls = `${className} ${color} flex-shrink-0`;

  switch (type) {
    case 'articles':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    case 'events':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'restaurants':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6M3 7a4 4 0 014-4h10a4 4 0 014 4v.5M7 3v4m10-4v4M5 14h14M8 21h8" />
        </svg>
      );
    case 'guides':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case 'videos':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'classifieds':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
    case 'products':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
  }
}

/** Animated three-dot loading indicator */
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1" aria-label="Loading suggestions">
      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '600ms' }} />
      <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '600ms' }} />
    </span>
  );
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const listboxId = 'search-suggestions-listbox';

  // Debounced search for suggestions
  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

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
      } finally {
        setIsLoadingSuggestions(false);
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

  // Generate a stable option id for aria-activedescendant
  const getOptionId = (index: number) => `search-option-${index}`;

  // Detect macOS for shortcut display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group"
        aria-label="Open search"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm font-mono tracking-wide group-hover:border-primary-300 group-hover:text-primary-600 transition-colors">
          {isMac ? (
            <span className="text-xs">&#8984;</span>
          ) : (
            <span>Ctrl</span>
          )}
          <span>K</span>
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
            aria-hidden="true"
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
            className="w-48 sm:w-72 pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ease-out origin-right"
            style={{ transition: 'width 300ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out' }}
            role="combobox"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls={suggestions.length > 0 ? listboxId : undefined}
            aria-activedescendant={selectedIndex >= 0 ? getOptionId(selectedIndex) : undefined}
          />
          {/* Loading dots or clear button */}
          {isLoadingSuggestions && query.length >= 2 ? (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <LoadingDots />
            </span>
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setQuery('');
            setSuggestions([]);
          }}
          className="ml-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Live region to announce result count */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {suggestions.length > 0
          ? `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'} available`
          : query.length >= 2
            ? 'No suggestions available'
            : ''}
      </div>

      {/* Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[26rem] overflow-y-auto animate-fade-in ring-1 ring-black/5"
        >
          {Object.entries(groupedSuggestions).map(([type, items], groupIdx) => (
            <div key={type} role="group" aria-label={`${getTypeLabel(type)}`}>
              {/* Section header with icon */}
              <div
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider ${getTypeBgColor(type)} ${groupIdx > 0 ? 'border-t border-gray-100' : ''}`}
                aria-hidden="true"
              >
                <TypeIcon type={type} className="w-3.5 h-3.5" />
                <span>{getTypeLabel(type)}</span>
              </div>
              {items.map((suggestion, idx) => {
                const flatIndex = suggestions.indexOf(suggestion);
                return (
                  <button
                    key={`${type}-${idx}`}
                    id={getOptionId(flatIndex)}
                    role="option"
                    aria-selected={flatIndex === selectedIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(flatIndex)}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                      flatIndex === selectedIndex
                        ? 'bg-primary-50 text-primary-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TypeIcon type={type} className="w-4 h-4" />
                    <span className="truncate flex-1">{suggestion.title}</span>
                    {flatIndex === selectedIndex && (
                      <svg className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {/* Footer: search all */}
          <div className="border-t border-gray-100 px-3 py-2.5 bg-gray-50/50">
            <button
              onClick={handleSubmit}
              className="w-full text-left text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search all results for &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}

      {/* Loading state dropdown (shown while fetching, before suggestions arrive) */}
      {isLoadingSuggestions && suggestions.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in ring-1 ring-black/5">
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Finding suggestions
            <LoadingDots />
          </div>
        </div>
      )}
    </div>
  );
}
