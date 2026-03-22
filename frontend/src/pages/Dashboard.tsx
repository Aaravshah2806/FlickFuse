import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { supabase, getImageUrl } from '../lib/supabase';
import { getTrendingMovies } from '../lib/tmdb';
import type { WatchHistory, Recommendation, TrendingItem } from '../types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;
      
      try {
        const [historyRes, recsRes, trendingRes] = await Promise.all([
          supabase
            .from('watch_history')
            .select('*')
            .eq('user_id', profile.id)
            .order('watched_at', { ascending: false })
            .limit(5),
          supabase
            .from('recommendations')
            .select('*, content(*)')
            .eq('user_id', profile.id)
            .eq('status', 'pending')
            .order('match_score', { ascending: false })
            .limit(5),
          getTrendingMovies('week').catch(() => ({ results: [] }))
        ]);

        setWatchHistory(historyRes.data || []);
        setRecommendations(recsRes.data || []);
        setTrending(trendingRes.results?.slice(0, 5) || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.display_name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Your unique ID: <span className="font-mono font-medium">{profile?.unique_id || '---'}</span>
            </p>
          </div>
          <Button onClick={() => navigator.clipboard.writeText(profile?.unique_id || '')} variant="secondary" size="sm">
            Copy ID
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/discover">
            <Card className="flex flex-col items-center justify-center py-6 hover:border-primary cursor-pointer">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Discover</span>
            </Card>
          </Link>
          <Link to="/discover?tab=trending">
            <Card className="flex flex-col items-center justify-center py-6 hover:border-primary cursor-pointer">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Trending</span>
            </Card>
          </Link>
          <Link to="/friends">
            <Card className="flex flex-col items-center justify-center py-6 hover:border-primary cursor-pointer">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Add Friends</span>
            </Card>
          </Link>
          <Link to="/settings">
            <Card className="flex flex-col items-center justify-center py-6 hover:border-primary cursor-pointer">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Settings</span>
            </Card>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recommendations For You</h2>
          <Link to="/discover" className="text-primary hover:text-primary-dark font-medium text-sm">
            View All →
          </Link>
        </div>
        {recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <Link key={rec.id} to={`/content/${rec.content?.content_type || 'movie'}/${rec.content?.tmdb_id}`}>
                <Card className="flex gap-4 hover:border-primary cursor-pointer transition-colors">
                  <div className="w-20 h-28 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {rec.content?.poster_url && (
                      <img 
                        src={getImageUrl(rec.content.poster_url)} 
                        alt={rec.content.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{rec.content?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {rec.content?.content_type === 'movie' ? 'Movie' : 'Series'}
                      {rec.content?.release_year && ` • ${rec.content.release_year}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success" size="sm">{rec.match_score}% Match</Badge>
                    </div>
                    {rec.reason && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{rec.reason}</p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="text-gray-600">Import your watch history to get personalized recommendations!</p>
            <Link to="/import" className="mt-4 inline-block">
              <Button>Import Your Data</Button>
            </Link>
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Trending Now</h2>
          <Link to="/discover?tab=trending" className="text-primary hover:text-primary-dark font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((item) => (
            <Link key={item.id} to={`/content/movie/${item.id}`}>
              <Card className="flex gap-4 hover:border-primary cursor-pointer transition-colors">
                <div className="w-20 h-28 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                  {item.poster_path && (
                    <img 
                      src={getImageUrl(item.poster_path)} 
                      alt={item.title || item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title || item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{item.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Watch History</h2>
          <Link to="/history" className="text-primary hover:text-primary-dark font-medium text-sm">
            View All →
          </Link>
        </div>
        {watchHistory.length > 0 ? (
          <div className="space-y-3">
            {watchHistory.map((item) => (
              <Card key={item.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.content_title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.content_type === 'movie' ? 'Movie' : 'Series'}
                    {item.watched_at && ` • ${new Date(item.watched_at).toLocaleDateString()}`}
                  </p>
                </div>
                <Badge variant="default" size="sm">
                  {(item.metadata as { platform?: string })?.platform || 'Unknown'}
                </Badge>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="text-gray-600">Your watch history is empty. Import your data to get started!</p>
          </Card>
        )}
      </section>
    </div>
  );
}
