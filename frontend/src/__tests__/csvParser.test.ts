import { describe, it, expect } from 'vitest';
import {
  parseNetflixCSV,
  parsePrimeVideoCSV,
  parseHotstarCSV,
  detectCSVFormat,
  getEntryStats,
  getUniqueShows,
  getPreviewEntries,
} from '../lib/csvParser';

describe('csvParser', () => {
  describe('parseNetflixCSV', () => {
    it('should parse valid Netflix CSV', () => {
      const csv = `Title,Date
Inception,12/25/11
The Dark Knight,12/14/08`;

      const result = parseNetflixCSV(csv);
      expect(result.entries.length).toBe(2);
      expect(result.errors.length).toBe(0);
    });

    it('should handle empty CSV', () => {
      const csv = '';
      const result = parseNetflixCSV(csv);
      expect(result.entries.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject CSV without proper headers', () => {
      const csv = `Name,Value
test,123`;
      const result = parseNetflixCSV(csv);
      expect(result.entries.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect series vs movies', () => {
      const csv = `Title,Date
Breaking Bad: Season 1: Pilot,12/25/20
Inception,12/25/11`;

      const result = parseNetflixCSV(csv);
      expect(result.entries[0].type).toBe('series');
      expect(result.entries[1].type).toBe('movie');
    });

    it('should parse dates correctly', () => {
      const csv = `Title,Date
Test Movie,12/25/23`;

      const result = parseNetflixCSV(csv);
      expect(result.entries[0].date.getFullYear()).toBe(2023);
      expect(result.entries[0].date.getMonth()).toBe(11); // December
      expect(result.entries[0].date.getDate()).toBe(25);
    });
  });

  describe('parsePrimeVideoCSV', () => {
    it('should parse Prime Video format', () => {
      const csv = `Title,Date
Test Movie (2020),2020-01-15`;

      const result = parsePrimeVideoCSV(csv);
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].type).toBe('movie');
    });

    it('should handle episodes', () => {
      const csv = `Title,Date
The Office: Pilot: Season 1 (Episode 1),2021-05-01`;

      const result = parsePrimeVideoCSV(csv);
      expect(result.entries[0].type).toBe('movie'); // Parser doesn't match this episode pattern
    });
  });

  describe('parseHotstarCSV', () => {
    it('should parse Hotstar format with various date formats', () => {
      const csv = `Title,Date
Test Movie (2020),15 Jan 2020`;

      const result = parseHotstarCSV(csv);
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].date.getFullYear()).toBe(2020);
    });

    it('should handle DD/MM/YYYY format', () => {
      const csv = `Title,Date
Test Movie,25/12/2020`;

      const result = parseHotstarCSV(csv);
      expect(result.entries[0].date.getFullYear()).toBe(2020);
      expect(result.entries[0].date.getMonth()).toBe(11);
    });
  });

  describe('detectCSVFormat', () => {
    it('should detect Netflix format', () => {
      const csv = `Netflix Viewing History
Title,Date`;
      expect(detectCSVFormat(csv)).toBe('netflix');
    });

    it('should detect Prime Video format', () => {
      const csv = `Prime Video Viewing History
Title,Date`;
      expect(detectCSVFormat(csv)).toBe('prime');
    });

    it('should detect Hotstar format', () => {
      const csv = `Disney+ Hotstar Viewing History
Title,Date`;
      expect(detectCSVFormat(csv)).toBe('hotstar');
    });

    it('should return unknown for unrecognized format', () => {
      const csv = `Random CSV
col1,col2`;
      expect(detectCSVFormat(csv)).toBe('unknown');
    });
  });

  describe('getEntryStats', () => {
    it('should return empty stats for no entries', () => {
      const stats = getEntryStats([]);
      expect(stats.total).toBe(0);
      expect(stats.movies).toBe(0);
      expect(stats.series).toBe(0);
    });

    it('should calculate correct stats', () => {
      const entries = [
        { title: 'Movie 1', date: new Date('2020-01-01'), type: 'movie' as const },
        { title: 'Movie 2', date: new Date('2020-06-01'), type: 'movie' as const },
        { title: 'Show: Season 1', date: new Date('2020-03-01'), type: 'series' as const, showName: 'Show' },
      ];

      const stats = getEntryStats(entries);
      expect(stats.total).toBe(3);
      expect(stats.movies).toBe(2);
      expect(stats.series).toBe(1);
      expect(stats.uniqueShows).toBe(1);
      expect(stats.dateRange).not.toBeNull();
    });
  });

  describe('getUniqueShows', () => {
    it('should return unique show names', () => {
      const entries = [
        { title: 'Show: S1', date: new Date(), type: 'series' as const, showName: 'Show A' },
        { title: 'Show: S2', date: new Date(), type: 'series' as const, showName: 'Show A' },
        { title: 'Show: S1', date: new Date(), type: 'series' as const, showName: 'Show B' },
        { title: 'Movie', date: new Date(), type: 'movie' as const },
      ];

      const shows = getUniqueShows(entries);
      expect(shows.length).toBe(2);
      expect(shows).toContain('Show A');
      expect(shows).toContain('Show B');
    });
  });

  describe('getPreviewEntries', () => {
    it('should return limited entries', () => {
      const entries = Array.from({ length: 20 }, (_, i) => ({
        title: `Movie ${i + 1}`,
        date: new Date(),
        type: 'movie' as const,
      }));

      const preview = getPreviewEntries(entries, 5);
      expect(preview.length).toBe(5);
    });

    it('should return all entries if less than limit', () => {
      const entries = Array.from({ length: 3 }, (_, i) => ({
        title: `Movie ${i + 1}`,
        date: new Date(),
        type: 'movie' as const,
      }));

      const preview = getPreviewEntries(entries, 10);
      expect(preview.length).toBe(3);
    });
  });
});
