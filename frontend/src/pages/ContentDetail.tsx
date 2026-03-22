import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  getMovieDetails, getTVDetails, getImageUrl, getMovieCredits, getTVCredits,
  type TMDbMovieDetails, type TMDbTVDetails, type TMDbCastMember, type TMDbGenre
} from '../lib/tmdb';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface StreamingPlatform {
  name: string;
  display_name: string;
  logo_url: string;
}

const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { name: 'netflix', display_name: 'Netflix', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { name: 'prime', display_name: 'Prime Video', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.svg' },
  { name: 'hotstar', display_name: 'Disney+ Hotstar', logo_url: 'https://img.hotstar.com/assets/guest/v3/ic_hotstar.svg' },
  { name: 'disney', display_name: 'Disney+', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
  { name: 'hbo', display_name: 'HBO Max', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg' },
  { name: 'hulu', display_name: 'Hulu', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Hulu_logo.svg' },
];

export default function ContentDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState<TMDbMovieDetails | TMDbTVDetails | null>(null);
  const [credits, setCredits] = useState<TMDbCastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);

  useEffect(() => {
    async function fetchContent() {
      if (!type || !id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const contentId = parseInt(id);
        
        if (type === 'movie') {
          const [details, castData] = await Promise.all([
            getMovieDetails(contentId),
            getMovieCredits(contentId)
          ]);
          setContent(details);
          setCredits(castData.cast.slice(0, 12));
        } else {
          const [details, castData] = await Promise.all([
            getTVDetails(contentId),
            getTVCredits(contentId)
          ]);
          setContent(details);
          setCredits(castData.cast.slice(0, 12));
        }
        
        const savedPlatforms = localStorage.getItem(`streaming_${contentId}`);
        if (savedPlatforms) {
          const parsed = JSON.parse(savedPlatforms);
          const platforms = STREAMING_PLATFORMS.filter(p => parsed.includes(p.name));
          setStreamingPlatforms(platforms);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [type, id]);

  const addToHistory = async () => {
    if (!user || !content || addedToHistory) return;

    try {
      const { error } = await supabase.from('watch_history').insert({
        user_id: user.id,
        content_title: 'title' in content ? content.title : content.name,
        content_type: type,
        metadata: {
          tmdb_id: content.id,
          poster_path: content.poster_path,
          overview: content.overview,
        },
      });

      if (!error) {
        setAddedToHistory(true);
      }
    } catch (err) {
      console.error('Error adding to history:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error || 'Content not found'}</p>
        <Link to="/dashboard">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const title = 'title' in content ? content.title : content.name;
  const releaseYear = 'release_date' in content 
    ? content.release_date?.split('-')[0] 
    : content.first_air_date?.split('-')[0];
  const isMovie = type === 'movie';
  const runtime = isMovie && 'runtime' in content ? content.runtime : null;
  const seasons = !isMovie && 'number_of_seasons' in content ? content.number_of_seasons : null;
  const episodes = !isMovie && 'number_of_episodes' in content ? content.number_of_episodes : null;
  const genres = content.genres || [];
  const tagline = content.tagline || null;

  return (
    <div className="pb-20">
      {/* Backdrop & Poster */}
      <div className="relative -mx-4 -mt-8 mb-6 h-64 md:h-80 lg:h-96">
        {content.backdrop_path && (
          <img
            src={getImageUrl(content.backdrop_path, 'w780')}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-6">
          <div className="hidden md:block w-40 h-60 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
            {content.poster_path && (
              <img
                src={getImageUrl(content.poster_path, 'w342')}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {releaseYear && <span>{releaseYear}</span>}
              {isMovie && runtime && <span>{runtime} min</span>}
              {!isMovie && seasons && <span>{seasons} Seasons</span>}
              {!isMovie && episodes && <span>{episodes} Episodes</span>}
              {content.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{content.vote_average.toFixed(1)}</span>
                </div>
              )}
              <Badge variant={isMovie ? 'default' : 'prime'}>{isMovie ? 'Movie' : 'TV Series'}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Mobile Poster */}
        <div className="md:hidden -mt-32 relative z-10 mb-4 flex justify-center">
          <div className="w-40 h-60 rounded-lg overflow-hidden shadow-lg">
            {content.poster_path && (
              <img
                src={getImageUrl(content.poster_path, 'w342')}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button onClick={addToHistory} disabled={addedToHistory}>
            {addedToHistory ? 'Added to History' : 'Add to History'}
          </Button>
          <Button variant="secondary">Add to List</Button>
        </div>

        {/* Tagline */}
        {tagline && (
          <p className="text-lg text-gray-600 italic mb-4">"{tagline}"</p>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {genres.map((genre: TMDbGenre) => (
              <Badge key={genre.id} variant="default">{genre.name}</Badge>
            ))}
          </div>
        )}

        {/* Where to Watch */}
        <Card className="mb-6">
          <h2 className="font-semibold text-lg mb-4">Where to Watch</h2>
          {streamingPlatforms.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {streamingPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  <img
                    src={platform.logo_url}
                    alt={platform.display_name}
                    className="h-6 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm font-medium">{platform.display_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Streaming availability not available. This feature requires API configuration.
            </p>
          )}
        </Card>

        {/* Overview */}
        {content.overview && (
          <Card className="mb-6">
            <h2 className="font-semibold text-lg mb-2">Overview</h2>
            <p className="text-gray-600">{content.overview}</p>
          </Card>
        )}

        {/* Cast */}
        {credits.length > 0 && (
          <Card>
            <h2 className="font-semibold text-lg mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {credits.map((member) => (
                <div key={member.id} className="flex-shrink-0 text-center w-20">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 overflow-hidden mb-2">
                    {member.profile_path ? (
                      <img
                        src={getImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.character}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
