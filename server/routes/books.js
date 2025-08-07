import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { processImage } from '../services/ocr.js';
import { extractBooksFromImage } from '../services/claudeVision.js';
import { searchGoogleBooks } from '../services/googleBooks.js';
import { mapGenre } from '../utils/genreMapping.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|heic|heif)/.test(file.mimetype) || 
                     file.mimetype === 'image/heic' || 
                     file.mimetype === 'image/heif';
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { visitorId } = req.query;
    if (!visitorId) {
      return res.status(400).json({ error: 'Visitor ID required' });
    }

    const books = await prisma.book.findMany({
      where: { visitorId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { visitorId, title, author, genre } = req.body;
    
    if (!visitorId || !title || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingBook = await prisma.book.findFirst({
      where: {
        visitorId,
        title: { equals: title, mode: 'insensitive' },
        author: { equals: author, mode: 'insensitive' }
      }
    });

    if (existingBook) {
      return res.status(409).json({ error: 'Book already exists in your library' });
    }

    const book = await prisma.book.create({
      data: {
        visitorId,
        title,
        author,
        genre: genre || 'Uncategorized'
      }
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) {
      return res.status(400).json({ error: 'Visitor ID required' });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`Processing ${files.length} files for visitor ${visitorId}`);
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.originalname}, path: ${file.path}`);
        
        let bookDataArray = [];
        
        // Try Claude Vision API first if available
        if (process.env.CLAUDE_API_KEY) {
          try {
            const claudeBooks = await extractBooksFromImage(file.path);
            
            // Enhance with Google Books metadata
            for (const book of claudeBooks) {
              const searchQuery = `${book.title} ${book.author}`;
              const enhancedBooks = await searchGoogleBooks(searchQuery);
              
              if (enhancedBooks.length > 0) {
                bookDataArray.push(enhancedBooks[0]);
              } else {
                // Use Claude's data if Google Books doesn't find it
                bookDataArray.push({
                  title: book.title,
                  author: book.author,
                  categories: []
                });
              }
            }
          } catch (claudeError) {
            console.error('Claude Vision failed, falling back to OCR:', claudeError.message);
          }
        }
        
        // Fall back to OCR if Claude didn't work or isn't configured
        if (bookDataArray.length === 0) {
          const extractedText = await processImage(file.path);
          console.log(`OCR extracted text length: ${extractedText.length} characters`);
          
          if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('Could not extract readable text from image. Try a clearer photo with better lighting.');
          }
          
          bookDataArray = await searchGoogleBooks(extractedText);
        }
        
        console.log(`Found ${bookDataArray.length} potential books`);
        
        if (bookDataArray.length === 0) {
          throw new Error('No books could be identified in the image. Make sure book spines are clearly visible.');
        }
        
        for (const bookData of bookDataArray) {
          const existingBook = await prisma.book.findFirst({
            where: {
              visitorId,
              title: { equals: bookData.title, mode: 'insensitive' },
              author: { equals: bookData.author, mode: 'insensitive' }
            }
          });

          if (!existingBook) {
            const genre = mapGenre(bookData.categories);
            const book = await prisma.book.create({
              data: {
                visitorId,
                title: bookData.title,
                author: bookData.author,
                genre,
                imageUrl: `/uploads/${file.filename}`
              }
            });
            results.push(book);
            console.log(`Added book: ${bookData.title} by ${bookData.author}`);
          } else {
            console.log(`Book already exists: ${bookData.title} by ${bookData.author}`);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
        errors.push({ 
          file: file.originalname, 
          error: error.message || 'Failed to process image'
        });
      }
    }

    console.log(`Processing complete: ${results.length} books added, ${errors.length} errors`);

    res.json({ 
      success: true, 
      books: results, 
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${files.length} image(s), added ${results.length} book(s)`
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: error.message || 'Failed to process upload' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId, title, author, genre } = req.body;

    const book = await prisma.book.findFirst({
      where: { id, visitorId }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updated = await prisma.book.update({
      where: { id },
      data: { title, author, genre }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId } = req.query;

    const book = await prisma.book.findFirst({
      where: { id, visitorId }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await prisma.book.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;