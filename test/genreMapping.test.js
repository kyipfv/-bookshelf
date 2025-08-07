import { describe, it, expect } from 'vitest';
import { mapGenre } from '../server/utils/genreMapping.js';

describe('Genre Mapping', () => {
  describe('mapGenre', () => {
    it('should map fiction categories correctly', () => {
      expect(mapGenre(['Fiction'])).toBe('Fiction');
      expect(mapGenre(['Fantasy'])).toBe('Fiction');
      expect(mapGenre(['Science Fiction'])).toBe('Fiction');
      expect(mapGenre(['Mystery'])).toBe('Fiction');
      expect(mapGenre(['Young Adult Fiction'])).toBe('Fiction');
      expect(mapGenre(['Literary Fiction'])).toBe('Fiction');
    });

    it('should map history categories correctly', () => {
      expect(mapGenre(['History'])).toBe('History');
      expect(mapGenre(['Biography'])).toBe('History');
      expect(mapGenre(['World War II'])).toBe('History');
      expect(mapGenre(['American History'])).toBe('History');
      expect(mapGenre(['Military History'])).toBe('History');
      expect(mapGenre(['Ancient History'])).toBe('History');
    });

    it('should map non-fiction categories correctly', () => {
      expect(mapGenre(['Science'])).toBe('Non-Fiction');
      expect(mapGenre(['Technology'])).toBe('Non-Fiction');
      expect(mapGenre(['Self-Help'])).toBe('Non-Fiction');
      expect(mapGenre(['Business & Economics'])).toBe('Non-Fiction');
      expect(mapGenre(['Cooking'])).toBe('Non-Fiction');
      expect(mapGenre(['Philosophy'])).toBe('Non-Fiction');
    });

    it('should handle empty or null categories', () => {
      expect(mapGenre([])).toBe('Uncategorized');
      expect(mapGenre(null)).toBe('Uncategorized');
      expect(mapGenre(undefined)).toBe('Uncategorized');
    });

    it('should handle multiple categories and prioritize first match', () => {
      expect(mapGenre(['Art', 'Fiction'])).toBe('Non-Fiction');
      expect(mapGenre(['Fiction', 'History'])).toBe('Fiction');
    });

    it('should handle case insensitive matching', () => {
      expect(mapGenre(['FICTION'])).toBe('Fiction');
      expect(mapGenre(['history'])).toBe('History');
      expect(mapGenre(['SCIENCE'])).toBe('Non-Fiction');
    });

    it('should default to Non-Fiction for unrecognized categories', () => {
      expect(mapGenre(['Unknown Category'])).toBe('Non-Fiction');
      expect(mapGenre(['Random Text'])).toBe('Non-Fiction');
    });
  });
});