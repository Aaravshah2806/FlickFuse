import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti, type TMDbMultiResult } from '../lib/tmdb';
import { ContentCard } from '../components/ContentCard';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<TMDbMultiResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function search() {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchMulti(query, page);
        const filtered = response.results.filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        
        if (page === 1) {
          setResults(filtered);
        } else {
          setResults((prev) => [...prev, ...filtered]);
        }
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [query, page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-600 mb-6">
        {query ? `Results for "${query}"` : 'Enter a search term'}
      </p>

      {isLoading && results.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {results.map((item) => (
              <ContentCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>

          {page < totalPages && (
            <div className="text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
                className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF] disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
