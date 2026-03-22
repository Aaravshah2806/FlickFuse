const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
}

export interface TMDbTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
}

export interface TMDbMultiResult {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  release_date?: string;
  name?: string;
  first_air_date?: string;
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbGenreList {
  genres: TMDbGenre[];
}

export interface TMDbMovieDetails extends TMDBMovie {
  genres: TMDbGenre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { english_name: string; iso_639_1: string }[];
}

export interface TMDbTVDetails extends TMDbTVShow {
  genres: TMDbGenre[];
  episode_run_time: number[];
  seasons: TMDbSeason[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string | null;
}

export interface TMDbSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

export interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDbCredits {
  id: number;
  cast: TMDbCastMember[];
}

export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
  );
  
  if (!response.ok) throw new Error('Failed to search movies');
  return response.json();
}

export async function searchTVShows(query: string, page = 1): Promise<TMDBSearchResponse<TMDbTVShow>> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  
  if (!response.ok) throw new Error('Failed to search TV shows');
  return response.json();
}

export async function searchMulti(query: string, page = 1): Promise<TMDBSearchResponse<TMDbMultiResult>> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );
  
  if (!response.ok) throw new Error('Failed to search');
  return response.json();
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse<TMDBMovie>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch trending movies');
  return response.json();
}

export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse<TMDbTVShow>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch trending TV shows');
  return response.json();
}

export async function getMovieDetails(movieId: number): Promise<TMDbMovieDetails> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
  );
  
  if (!response.ok) throw new Error('Failed to fetch movie details');
  return response.json();
}

export async function getTVDetails(tvId: number): Promise<TMDbTVDetails> {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
  );
  
  if (!response.ok) throw new Error('Failed to fetch TV details');
  return response.json();
}

export async function getMovieCredits(movieId: number): Promise<TMDbCredits> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch movie credits');
  return response.json();
}

export async function getTVCredits(tvId: number): Promise<TMDbCredits> {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch TV credits');
  return response.json();
}

export async function getGenres(type: 'movie' | 'tv'): Promise<TMDbGenreList> {
  const response = await fetch(
    `${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch genres');
  return response.json();
}

export async function getPopularMovies(page = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch popular movies');
  return response.json();
}

export async function getPopularTVShows(page = 1): Promise<TMDBSearchResponse<TMDbTVShow>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch popular TV shows');
  return response.json();
}

export async function getTopRatedMovies(page = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch top rated movies');
  return response.json();
}

export async function getTopRatedTVShows(page = 1): Promise<TMDBSearchResponse<TMDbTVShow>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
  );
  
  if (!response.ok) throw new Error('Failed to fetch top rated TV shows');
  return response.json();
}

export function getImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function isMovie(item: TMDBMovie | TMDbTVShow): item is TMDBMovie {
  return 'title' in item && 'release_date' in item;
}

export function isTVShow(item: TMDBMovie | TMDbTVShow): item is TMDbTVShow {
  return 'name' in item && 'first_air_date' in item;
}

export function getYear(item: TMDBMovie | TMDbTVShow): string {
  if (isMovie(item)) {
    return item.release_date?.split('-')[0] || 'N/A';
  }
  return item.first_air_date?.split('-')[0] || 'N/A';
}

export function getTitle(item: TMDBMovie | TMDbTVShow): string {
  if (isMovie(item)) {
    return item.title;
  }
  return item.name;
}
