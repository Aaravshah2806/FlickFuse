import { useState, useEffect } from 'react';
import { getTrendingMovies, getTrendingTVShows, getPopularMovies, getPopularTVShows, type TMDBMovie, type TMDbTVShow } from '../lib/tmdb';
import { ContentCard } from '../components/ContentCard';

export default function Discover() {
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TMDbTVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [popularTV, setPopularTV] = useState<TMDbTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [tMovie, tTV, pMovie, pTV] = await Promise.all([
          getTrendingMovies('week'),
          getTrendingTVShows('week'),
          getPopularMovies(),
          getPopularTVShows(),
        ]);
        setTrendingMovies(tMovie.results.slice(0, 12));
        setTrendingTV(tTV.results.slice(0, 12));
        setPopularMovies(pMovie.results.slice(0, 12));
        setPopularTV(pTV.results.slice(0, 12));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
      </div>
    );
  }

  const trendingAll = [...trendingMovies, ...trendingTV].sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="pb-20">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'border-[#2563EB] text-[#2563EB]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'movies' 
              ? 'border-[#2563EB] text-[#2563EB]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'tv' 
              ? 'border-[#2563EB] text-[#2563EB]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          TV Shows
        </button>
      </div>

      {/* Trending Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Trending This Week</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(activeTab === 'all' ? trendingAll : activeTab === 'movies' ? trendingMovies : trendingTV)
            .slice(0, 12)
            .map((item) => (
              <ContentCard key={`${'title' in item ? 'movie' : 'tv'}-${item.id}`} item={item} />
            ))}
        </div>
      </section>

      {/* Popular Movies */}
      {(activeTab === 'all' || activeTab === 'movies') && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Popular Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularMovies.slice(0, 12).map((item) => (
              <ContentCard key={`movie-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Popular TV Shows */}
      {(activeTab === 'all' || activeTab === 'tv') && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Popular TV Shows</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularTV.slice(0, 12).map((item) => (
              <ContentCard key={`tv-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
