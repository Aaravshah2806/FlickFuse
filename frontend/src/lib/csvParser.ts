export interface ParsedEntry {
  title: string;
  date: Date;
  type: 'movie' | 'series';
  season?: number;
  episode?: number;
  episodeName?: string;
  showName?: string;
  year?: number;
}

export interface ParseResult {
  entries: ParsedEntry[];
  errors: string[];
  totalRows: number;
}

const SEASON_PATTERN = /Season\s+(\d+)/i;
const EPISODE_PATTERN = /^([^:,]+):\s*Season\s+(\d+):\s*(.+)$/;
const SIMPLE_MOVIE_PATTERN = /^([^:,]+)(?:,\s*(\d{4}))?$/;

function parseNetflixDate(dateStr: string): Date | null {
  const cleaned = dateStr.trim();
  
  const MMDDYY = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/;
  const match = cleaned.match(MMDDYY);
  if (match) {
    const [, month, day, year] = match;
    const fullYear = parseInt(year) + 2000;
    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
  }
  
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date;
}

function detectContentType(title: string): 'movie' | 'series' {
  return SEASON_PATTERN.test(title) ? 'series' : 'movie';
}

function extractShowInfo(title: string): ParsedEntry {
  const episodeMatch = title.match(EPISODE_PATTERN);
  
  if (episodeMatch) {
    const [, showName, seasonStr, episodeName] = episodeMatch;
    return {
      title,
      date: new Date(),
      type: 'series',
      showName: showName.trim(),
      season: parseInt(seasonStr),
      episodeName: episodeName.trim(),
    };
  }
  
  const simpleMatch = title.match(SIMPLE_MOVIE_PATTERN);
  if (simpleMatch) {
    const [, movieName, yearStr] = simpleMatch;
    return {
      title: movieName.trim(),
      date: new Date(),
      type: 'movie',
      year: yearStr ? parseInt(yearStr) : undefined,
    };
  }
  
  return {
    title,
    date: new Date(),
    type: 'movie',
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function parseNetflixCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const errors: string[] = [];
  const entries: ParsedEntry[] = [];
  
  if (lines.length < 2) {
    return { entries: [], errors: ['CSV file is empty or has no data rows'], totalRows: 0 };
  }
  
  const headerLine = lines[0].toLowerCase();
  if (!headerLine.includes('title') || !headerLine.includes('date')) {
    return { 
      entries: [], 
      errors: ['Invalid CSV format. Expected columns: Title, Date'], 
      totalRows: 0 
    };
  }
  
  const dataLines = lines.slice(1);
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;
    
    const columns = parseCSVLine(line);
    
    if (columns.length < 2) {
      errors.push(`Row ${i + 2}: Invalid format - expected at least 2 columns`);
      continue;
    }
    
    const title = columns[0].replace(/^["']|["']$/g, '').trim();
    const dateStr = columns[1].replace(/^["']|["']$/g, '').trim();
    
    if (!title) {
      errors.push(`Row ${i + 2}: Missing title`);
      continue;
    }
    
    const date = parseNetflixDate(dateStr);
    if (!date) {
      errors.push(`Row ${i + 2}: Invalid date format "${dateStr}"`);
      continue;
    }
    
    const type = detectContentType(title);
    const parsed = extractShowInfo(title);
    
    entries.push({
      ...parsed,
      date,
      type,
    });
  }
  
  return {
    entries,
    errors: errors.slice(0, 10),
    totalRows: dataLines.length,
  };
}

function parsePrimeVideoDate(dateStr: string): Date | null {
  const cleaned = dateStr.trim();
  
  const YYYY_MM_DD = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = cleaned.match(YYYY_MM_DD);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const DD_MM_YYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const euMatch = cleaned.match(DD_MM_YYYY);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date;
}

const PRIME_EPISODE_PATTERN = /^(.+?)\s*:\s*(.+?)\s*\(\s*Season\s*(\d+),\s*Episode\s*(\d+)\s*\)$/i;
const PRIME_MOVIE_PATTERN = /^(.+?)\s*\((\d{4})\)$/;

export function parsePrimeVideoCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const errors: string[] = [];
  const entries: ParsedEntry[] = [];
  
  if (lines.length < 2) {
    return { entries: [], errors: ['CSV file is empty or has no data rows'], totalRows: 0 };
  }
  
  const headerLine = lines[0].toLowerCase();
  const hasHeaders = headerLine.includes('title') || headerLine.includes('name');
  
  const dataLines = hasHeaders ? lines.slice(1) : lines;
  
  let dateColumnIndex = 0;
  let titleColumnIndex = 0;
  
  if (hasHeaders) {
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    titleColumnIndex = headers.findIndex(h => h.includes('title') || h.includes('name'));
    dateColumnIndex = headers.findIndex(h => h.includes('date') || h.includes('watched'));
    
    if (titleColumnIndex === -1) titleColumnIndex = 0;
    if (dateColumnIndex === -1) dateColumnIndex = 1;
  }
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;
    
    const columns = parseCSVLine(line);
    
    if (columns.length < 2) {
      errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid format - expected at least 2 columns`);
      continue;
    }
    
    const title = columns[titleColumnIndex]?.replace(/^["']|["']$/g, '').trim() || '';
    const dateStr = columns[dateColumnIndex]?.replace(/^["']|["']$/g, '').trim() || '';
    
    if (!title) {
      errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Missing title`);
      continue;
    }
    
    const date = parsePrimeVideoDate(dateStr);
    if (!date) {
      errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid date format "${dateStr}"`);
      continue;
    }
    
    const episodeMatch = title.match(PRIME_EPISODE_PATTERN);
    
    if (episodeMatch) {
      const [, showName, episodeName, seasonStr, episodeStr] = episodeMatch;
      entries.push({
        title,
        date,
        type: 'series',
        showName: showName.trim(),
        season: parseInt(seasonStr),
        episode: parseInt(episodeStr),
        episodeName: episodeName.trim(),
      });
    } else {
      const movieMatch = title.match(PRIME_MOVIE_PATTERN);
      entries.push({
        title,
        date,
        type: 'movie',
        year: movieMatch ? parseInt(movieMatch[2]) : undefined,
      });
    }
  }
  
  return {
    entries,
    errors: errors.slice(0, 10),
    totalRows: dataLines.length,
  };
}

function parseHotstarDate(dateStr: string): Date | null {
  const cleaned = dateStr.trim();
  
  const DD_MMM_YYYY = /^(\d{1,2})\s+(\w+)\s+(\d{4})$/i;
  const match = cleaned.match(DD_MMM_YYYY);
  if (match) {
    const months: { [key: string]: number } = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11,
    };
    const [, day, monthStr, year] = match;
    const month = months[monthStr.toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(year), month, parseInt(day));
    }
  }
  
  const DD_MM_YYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const euMatch = cleaned.match(DD_MM_YYYY);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const YYYY_MM_DD = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = cleaned.match(YYYY_MM_DD);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date;
}

const HOTSTAR_EPISODE_PATTERN = /^([^:]+):\s*(.+?)\s*-\s*Season\s*(\d+)\s*,\s*Episode\s*(\d+)$/i;

export function parseHotstarCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const errors: string[] = [];
  const entries: ParsedEntry[] = [];
  
  if (lines.length < 2) {
    return { entries: [], errors: ['CSV file is empty or has no data rows'], totalRows: 0 };
  }
  
  const headerLine = lines[0].toLowerCase();
  const hasHeaders = headerLine.includes('title') || headerLine.includes('content');
  
  const dataLines = hasHeaders ? lines.slice(1) : lines;
  
  let dateColumnIndex = -1;
  let titleColumnIndex = -1;
  
  if (hasHeaders) {
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    titleColumnIndex = headers.findIndex(h => h.includes('title') || h.includes('content') || h.includes('name'));
    dateColumnIndex = headers.findIndex(h => h.includes('date') || h.includes('watched') || h.includes('time'));
    
    if (titleColumnIndex === -1) titleColumnIndex = 0;
    if (dateColumnIndex === -1) {
      for (let i = 0; i < headers.length; i++) {
        if (i !== titleColumnIndex) {
          dateColumnIndex = i;
          break;
        }
      }
    }
  }
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;
    
    const columns = parseCSVLine(line);
    
    if (columns.length < 2) {
      errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid format - expected at least 2 columns`);
      continue;
    }
    
    const title = columns[titleColumnIndex]?.replace(/^["']|["']$/g, '').trim() || '';
    const dateStr = columns[dateColumnIndex]?.replace(/^["']|["']$/g, '').trim() || '';
    
    if (!title) {
      errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Missing title`);
      continue;
    }
    
    const date = parseHotstarDate(dateStr);
    if (!date) {
      errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid date format "${dateStr}"`);
      continue;
    }
    
    const episodeMatch = title.match(HOTSTAR_EPISODE_PATTERN);
    
    if (episodeMatch) {
      const [, showName, episodeName, seasonStr, episodeStr] = episodeMatch;
      entries.push({
        title,
        date,
        type: 'series',
        showName: showName.trim(),
        season: parseInt(seasonStr),
        episode: parseInt(episodeStr),
        episodeName: episodeName.trim(),
      });
    } else {
      const yearMatch = title.match(/\((\d{4})\)\s*$/);
      entries.push({
        title,
        date,
        type: yearMatch ? 'movie' : 'movie',
        year: yearMatch ? parseInt(yearMatch[1]) : undefined,
      });
    }
  }
  
  return {
    entries,
    errors: errors.slice(0, 10),
    totalRows: dataLines.length,
  };
}

export function detectCSVFormat(csvText: string): 'netflix' | 'prime' | 'hotstar' | 'unknown' {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return 'unknown';
  
  const headerLine = lines[0].toLowerCase();
  
  if (headerLine.includes('netflix')) return 'netflix';
  if (headerLine.includes('prime') || headerLine.includes('amazon')) return 'prime';
  if (headerLine.includes('hotstar') || headerLine.includes('disney')) return 'hotstar';
  
  const sampleLine = lines[1].toLowerCase();
  if (sampleLine.includes('season') && sampleLine.includes('episode')) {
    if (sampleLine.includes('netflix')) return 'netflix';
    if (sampleLine.includes('prime') || sampleLine.includes('amazon')) return 'prime';
    if (sampleLine.includes('hotstar') || sampleLine.includes('disney')) return 'hotstar';
  }
  
  return 'unknown';
}

export function autoParseCSV(csvText: string): ParseResult {
  const format = detectCSVFormat(csvText);
  
  switch (format) {
    case 'netflix':
      return parseNetflixCSV(csvText);
    case 'prime':
      return parsePrimeVideoCSV(csvText);
    case 'hotstar':
      return parseHotstarCSV(csvText);
    default:
      return parseNetflixCSV(csvText);
  }
}

export function getPreviewEntries(entries: ParsedEntry[], count = 10): ParsedEntry[] {
  return entries.slice(0, count);
}

export function getUniqueShows(entries: ParsedEntry[]): string[] {
  const shows = new Set<string>();
  entries.forEach(entry => {
    if (entry.type === 'series' && entry.showName) {
      shows.add(entry.showName);
    }
  });
  return Array.from(shows).sort();
}

export function getEntryStats(entries: ParsedEntry[]): {
  total: number;
  movies: number;
  series: number;
  uniqueShows: number;
  dateRange: { earliest: Date; latest: Date } | null;
} {
  if (entries.length === 0) {
    return { total: 0, movies: 0, series: 0, uniqueShows: 0, dateRange: null };
  }
  
  const movies = entries.filter(e => e.type === 'movie').length;
  const series = entries.filter(e => e.type === 'series').length;
  const shows = getUniqueShows(entries);
  const dates = entries.map(e => e.date.getTime());
  
  return {
    total: entries.length,
    movies,
    series,
    uniqueShows: shows.length,
    dateRange: {
      earliest: new Date(Math.min(...dates)),
      latest: new Date(Math.max(...dates)),
    },
  };
}
