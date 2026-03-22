import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMulti, getImageUrl, type TMDbMultiResult } from '../lib/tmdb';

type SearchResult = Pick<TMDbMultiResult, 'id' | 'media_type' | 'title' | 'name' | 'poster_path' | 'release_date' | 'first_air_date' | 'vote_average'>;

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchMulti(query);
        const filtered = response.results.filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setResults(filtered.slice(0, 8));
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/content/${item.media_type}/${item.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Search movies & TV shows..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2563EB] border-t-transparent"></div>
            </div>
          )}
        </div>
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {results.map((item) => (
            <button
              key={`${item.media_type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                {item.poster_path && (
                  <img
                    src={getImageUrl(item.poster_path, 'w185')}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.title || item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.media_type === 'movie' ? item.release_date?.split('-')[0] : item.first_air_date?.split('-')[0]} • {item.media_type === 'movie' ? 'Movie' : 'Series'}
                </p>
              </div>
              {item.vote_average && item.vote_average > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-600">{item.vote_average.toFixed(1)}</span>
                </div>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }}
            className="w-full p-3 text-sm text-[#2563EB] hover:bg-gray-50 border-t"
          >
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
