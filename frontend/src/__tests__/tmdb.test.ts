import { describe, it, expect } from 'vitest';
import {
  getImageUrl,
  isMovie,
  isTVShow,
  getYear,
  getTitle,
} from '../lib/tmdb';
import type { TMDBMovie, TMDbTVShow } from '../lib/tmdb';

describe('tmdb utilities', () => {
  describe('getImageUrl', () => {
    it('should return placeholder for null path', () => {
      const url = getImageUrl(null);
      expect(url).toBe('/placeholder.png');
    });

    it('should return original URL for http paths', () => {
      const url = getImageUrl('https://example.com/image.jpg');
      expect(url).toBe('https://example.com/image.jpg');
    });

    it('should construct TMDB URL for relative paths', () => {
      const url = getImageUrl('/abc123.jpg');
      expect(url).toContain('https://image.tmdb.org/t/p/w342/abc123.jpg');
    });

    it('should use custom size when specified', () => {
      const url = getImageUrl('/abc123.jpg', 'w500');
      expect(url).toContain('/w500/abc123.jpg');
    });
  });

  describe('isMovie', () => {
    it('should return true for movie objects', () => {
      const movie: TMDBMovie = {
        id: 1,
        title: 'Test Movie',
        overview: 'Test',
        poster_path: null,
        backdrop_path: null,
        release_date: '2020-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        genre_ids: [28],
        adult: false,
        original_language: 'en',
        popularity: 100,
      };

      expect(isMovie(movie)).toBe(true);
      expect(isTVShow(movie)).toBe(false);
    });

    it('should return false for TV show objects', () => {
      const tvShow: TMDbTVShow = {
        id: 1,
        name: 'Test Show',
        overview: 'Test',
        poster_path: null,
        backdrop_path: null,
        first_air_date: '2020-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        genre_ids: [28],
        adult: false,
        original_language: 'en',
        popularity: 100,
      };

      expect(isMovie(tvShow)).toBe(false);
      expect(isTVShow(tvShow)).toBe(true);
    });
  });

  describe('getYear', () => {
    it('should extract year from movie release_date', () => {
      const movie: TMDBMovie = {
        id: 1,
        title: 'Test',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2020-06-15',
        vote_average: 8,
        vote_count: 100,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        popularity: 50,
      };

      expect(getYear(movie)).toBe('2020');
    });

    it('should extract year from TV show first_air_date', () => {
      const tvShow: TMDbTVShow = {
        id: 1,
        name: 'Test',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        first_air_date: '2021-12-25',
        vote_average: 8,
        vote_count: 100,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        popularity: 50,
      };

      expect(getYear(tvShow)).toBe('2021');
    });

    it('should return N/A for missing dates', () => {
      const movie: TMDBMovie = {
        id: 1,
        title: 'Test',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '',
        vote_average: 8,
        vote_count: 100,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        popularity: 50,
      };

      expect(getYear(movie)).toBe('N/A');
    });
  });

  describe('getTitle', () => {
    it('should return title for movies', () => {
      const movie: TMDBMovie = {
        id: 1,
        title: 'Test Movie Title',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2020-01-01',
        vote_average: 8,
        vote_count: 100,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        popularity: 50,
      };

      expect(getTitle(movie)).toBe('Test Movie Title');
    });

    it('should return name for TV shows', () => {
      const tvShow: TMDbTVShow = {
        id: 1,
        name: 'Test TV Show',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        first_air_date: '2020-01-01',
        vote_average: 8,
        vote_count: 100,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        popularity: 50,
      };

      expect(getTitle(tvShow)).toBe('Test TV Show');
    });
  });
});
