import { describe, it, expect, vi } from 'vitest';
import { searchGoogleBooks } from '../server/services/googleBooks.js';
import axios from 'axios';

vi.mock('axios');

describe('Book Parsing', () => {
  describe('searchGoogleBooks', () => {
    it('should parse book title and author from "by" format', async () => {
      const extractedText = `
        The Great Gatsby by F. Scott Fitzgerald
        1984 by George Orwell
        Random text here
      `;

      axios.get.mockResolvedValueOnce({
        data: {
          items: [{
            volumeInfo: {
              title: 'The Great Gatsby',
              authors: ['F. Scott Fitzgerald'],
              categories: ['Fiction']
            }
          }]
        }
      }).mockResolvedValueOnce({
        data: {
          items: [{
            volumeInfo: {
              title: '1984',
              authors: ['George Orwell'],
              categories: ['Fiction']
            }
          }]
        }
      });

      const results = await searchGoogleBooks(extractedText);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('The Great Gatsby');
      expect(results[0].author).toBe('F. Scott Fitzgerald');
    });

    it('should parse book title and author from separate lines', async () => {
      const extractedText = `
        Pride and Prejudice
        Jane Austen
        
        The Hobbit
        J.R.R. Tolkien
      `;

      axios.get.mockResolvedValue({
        data: {
          items: [{
            volumeInfo: {
              title: 'Pride and Prejudice',
              authors: ['Jane Austen'],
              categories: ['Fiction']
            }
          }]
        }
      });

      const results = await searchGoogleBooks(extractedText);
      
      expect(results.length).toBeGreaterThan(0);
      expect(axios.get).toHaveBeenCalled();
    });

    it('should handle API failures gracefully', async () => {
      const extractedText = 'Some Book Title';
      
      axios.get.mockRejectedValue(new Error('API Error'));

      const results = await searchGoogleBooks(extractedText);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Some Book Title');
      expect(results[0].author).toBe('Unknown Author');
    });

    it('should filter out short lines and noise', async () => {
      const extractedText = `
        A
        BB
        CCC
        Valid Book Title Here
        Author Name
        123
        !@#
      `;

      axios.get.mockResolvedValue({
        data: {
          items: [{
            volumeInfo: {
              title: 'Valid Book Title Here',
              authors: ['Author Name'],
              categories: []
            }
          }]
        }
      });

      const results = await searchGoogleBooks(extractedText);
      expect(axios.get).toHaveBeenCalled();
      const queryUrl = axios.get.mock.calls[0][0];
      expect(queryUrl).toContain('Valid+Book+Title');
    });

    it('should limit API calls to prevent rate limiting', async () => {
      const extractedText = Array(20).fill('Book Title').join('\n');
      
      axios.get.mockResolvedValue({
        data: { items: null }
      });

      await searchGoogleBooks(extractedText);
      
      expect(axios.get.mock.calls.length).toBeLessThanOrEqual(10);
    });

    it('should extract ISBN when available', async () => {
      const extractedText = 'Test Book';
      
      axios.get.mockResolvedValue({
        data: {
          items: [{
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              categories: ['Fiction'],
              industryIdentifiers: [
                { identifier: '9780123456789' }
              ]
            }
          }]
        }
      });

      const results = await searchGoogleBooks(extractedText);
      
      expect(results[0].isbn).toBe('9780123456789');
    });
  });
});