import { Link } from 'react-router-dom';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { getImageUrl, type TMDBMovie, type TMDbTVShow, type TMDbMultiResult } from '../lib/tmdb';

type ContentItem = TMDBMovie | TMDbTVShow | TMDbMultiResult;

interface ContentCardProps {
  item: ContentItem;
  showType?: boolean;
}

function getItemType(item: ContentItem): 'movie' | 'series' {
  if ('media_type' in item && item.media_type) {
    return item.media_type === 'tv' ? 'series' : 'movie';
  }
  if ('title' in item && item.title) return 'movie';
  return 'series';
}

function getItemTitle(item: ContentItem): string {
  if ('title' in item && item.title) return item.title;
  if ('name' in item && item.name) return item.name;
  return '';
}

function getItemYear(item: ContentItem): string {
  if ('release_date' in item && item.release_date) return item.release_date.split('-')[0];
  if ('first_air_date' in item && item.first_air_date) return item.first_air_date.split('-')[0];
  return '';
}

export function ContentCard({ item, showType = true }: ContentCardProps) {
  const type = getItemType(item);
  const title = getItemTitle(item);
  const year = getItemYear(item);
  const posterUrl = getImageUrl(item.poster_path);

  return (
    <Link to={`/content/${type}/${item.id}`}>
      <Card className="hover:border-[#2563EB] cursor-pointer group overflow-hidden p-0">
        <div className="relative aspect-[2/3] bg-gray-200">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            {showType && (
              <Badge variant={type === 'movie' ? 'default' : 'prime'} size="sm">
                {type === 'movie' ? 'Movie' : 'Series'}
              </Badge>
            )}
          </div>
          {item.vote_average > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-white font-medium">{item.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{year}</p>
        </div>
      </Card>
    </Link>
  );
}

interface ContentListProps {
  items: ContentItem[];
  showType?: boolean;
  emptyMessage?: string;
}

export function ContentList({ items, showType = true, emptyMessage = 'No content found' }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} showType={showType} />
      ))}
    </div>
  );
}
