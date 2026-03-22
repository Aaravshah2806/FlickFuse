import { searchMovies, searchTVShows, getImageUrl, type TMDBMovie, type TMDbTVShow } from './tmdb';
import type { ParsedEntry } from './csvParser';

export interface TMDBMatch {
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  match_confidence: number;
  overview?: string;
}

export interface MatchResult {
  entry: ParsedEntry;
  match: TMDBMatch | null;
  status: 'matched' | 'no_match' | 'error';
  error?: string;
}

export interface BatchMatchResult {
  results: MatchResult[];
  matched: number;
  unmatched: number;
  errors: number;
}

const CONCURRENCY_LIMIT = 8;
const MIN_CONFIDENCE = 70;

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(a: string, b: string): number {
  const aNorm = normalizeTitle(a);
  const bNorm = normalizeTitle(b);
  
  if (aNorm === bNorm) return 100;
  
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) {
    return 90;
  }
  
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (maxLen === 0) return 0;
  
  let matches = 0;
  for (let i = 0; i < Math.min(aNorm.length, bNorm.length); i++) {
    if (aNorm[i] === bNorm[i]) matches++;
  }
  
  return Math.round((matches / maxLen) * 100);
}

function extractYear(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.split('-')[0]);
  return isNaN(year) ? null : year;
}

async function searchMovie(title: string, year?: number): Promise<TMDBMatch | null> {
  try {
    const response = await searchMovies(title, 1);
    
    if (!response.results || response.results.length === 0) return null;
    
    let bestMatch: { movie: TMDBMovie; confidence: number } | null = null;
    
    for (const movie of response.results.slice(0, 5)) {
      const titleSimilarity = calculateSimilarity(title, movie.title);
      
      let yearBonus = 0;
      if (year && movie.release_date) {
        const movieYear = extractYear(movie.release_date);
        if (movieYear === year) {
          yearBonus = 10;
        } else if (movieYear && Math.abs(movieYear - year) <= 1) {
          yearBonus = 5;
        }
      }
      
      const confidence = titleSimilarity + yearBonus;
      
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { movie, confidence };
      }
    }
    
    if (bestMatch && bestMatch.confidence >= MIN_CONFIDENCE) {
      return {
        tmdb_id: bestMatch.movie.id,
        title: bestMatch.movie.title,
        poster_url: getImageUrl(bestMatch.movie.poster_path, 'w342'),
        release_year: extractYear(bestMatch.movie.release_date),
        match_confidence: bestMatch.confidence,
        overview: bestMatch.movie.overview,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

async function searchTV(title: string): Promise<TMDBMatch | null> {
  try {
    const response = await searchTVShows(title, 1);
    
    if (!response.results || response.results.length === 0) return null;
    
    let bestMatch: { show: TMDbTVShow; confidence: number } | null = null;
    
    for (const show of response.results.slice(0, 5)) {
      const titleSimilarity = calculateSimilarity(title, show.name);
      
      if (!bestMatch || titleSimilarity > bestMatch.confidence) {
        bestMatch = { show, confidence: titleSimilarity };
      }
    }
    
    if (bestMatch && bestMatch.confidence >= MIN_CONFIDENCE) {
      return {
        tmdb_id: bestMatch.show.id,
        title: bestMatch.show.name,
        poster_url: getImageUrl(bestMatch.show.poster_path, 'w342'),
        release_year: extractYear(bestMatch.show.first_air_date),
        match_confidence: bestMatch.confidence,
        overview: bestMatch.show.overview,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function findBestMatch(entry: ParsedEntry): Promise<MatchResult> {
  try {
    if (entry.type === 'movie') {
      const match = await searchMovie(entry.title, entry.year);
      return {
        entry,
        match,
        status: match ? 'matched' : 'no_match',
      };
    } else {
      const showName = entry.showName || entry.title;
      const match = await searchTV(showName);
      return {
        entry,
        match,
        status: match ? 'matched' : 'no_match',
      };
    }
  } catch (error) {
    return {
      entry,
      match: null,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function processChunk<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  onProgress?: (completed: number, total: number) => void,
  concurrency: number = CONCURRENCY_LIMIT
): Promise<R[]> {
  const results: R[] = [];
  let completed = 0;
  
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    completed += chunk.length;
    
    if (onProgress) {
      onProgress(completed, items.length);
    }
  }
  
  return results;
}

export async function batchMatch(
  entries: ParsedEntry[],
  onProgress?: (current: number, total: number) => void
): Promise<BatchMatchResult> {
  const normalizedCache = new Map<string, ParsedEntry>();
  
  entries.forEach(entry => {
    const key = `${entry.type}:${normalizeTitle(entry.showName || entry.title)}`;
    if (!normalizedCache.has(key)) {
      normalizedCache.set(key, entry);
    }
  });
  
  const uniqueList = Array.from(normalizedCache.values());
  
  const results = await processChunk(
    uniqueList,
    findBestMatch,
    onProgress,
    CONCURRENCY_LIMIT
  );
  
  let matched = 0;
  let unmatched = 0;
  let errors = 0;
  
  for (const result of results) {
    if (result.status === 'matched') matched++;
    else if (result.status === 'no_match') unmatched++;
    else errors++;
  }
  
  const allResults: MatchResult[] = [];
  const seenKeys = new Set<string>();
  
  for (const result of results) {
    const key = `${result.entry.type}:${normalizeTitle(result.entry.showName || result.entry.title)}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      allResults.push(result);
    }
  }
  
  entries.forEach(entry => {
    const key = `${entry.type}:${normalizeTitle(entry.showName || entry.title)}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      allResults.push({
        entry,
        match: null,
        status: 'no_match',
      });
    }
  });
  
  return { results: allResults, matched, unmatched, errors };
}

export function buildMatchLookup(results: MatchResult[]): Map<string, TMDBMatch | null> {
  const lookup = new Map<string, TMDBMatch | null>();
  
  results.forEach(result => {
    const key = `${result.entry.type}:${normalizeTitle(result.entry.showName || result.entry.title)}`;
    lookup.set(key, result.match);
  });
  
  return lookup;
}
