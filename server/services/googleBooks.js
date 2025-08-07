import axios from 'axios';

export async function searchGoogleBooks(extractedText) {
  if (!extractedText || extractedText.trim().length === 0) {
    console.log('No text provided for book search');
    return [];
  }

  const books = [];
  const lines = extractedText.split('\n').filter(line => line.trim().length > 3);
  
  console.log(`Processing ${lines.length} lines of text`);
  
  const potentialBooks = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 5 && line.length < 100) {
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      
      if (nextLine && nextLine.length > 3 && nextLine.length < 50) {
        potentialBooks.push({ title: line, author: nextLine });
      } else if (line.includes(' by ')) {
        const [title, author] = line.split(' by ').map(s => s.trim());
        if (title && author) {
          potentialBooks.push({ title, author });
        }
      } else {
        // Try to identify book-like text (capitalized words, reasonable length)
        const wordCount = line.split(' ').length;
        if (wordCount >= 2 && wordCount <= 10 && /^[A-Z]/.test(line)) {
          potentialBooks.push({ title: line, author: '' });
        }
      }
    }
  }

  console.log(`Found ${potentialBooks.length} potential books`);

  if (potentialBooks.length === 0) {
    // If no books found, return empty array
    return [];
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const maxQueries = Math.min(potentialBooks.length, 10);

  for (let i = 0; i < maxQueries; i++) {
    const { title, author } = potentialBooks[i];
    
    try {
      const query = author ? `intitle:${title} inauthor:${author}` : `intitle:${title}`;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}${apiKey ? `&key=${apiKey}` : ''}&maxResults=1`;
      
      console.log(`Searching for: "${title}" by "${author || 'unknown'}"`);
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data.items && response.data.items.length > 0) {
        const book = response.data.items[0].volumeInfo;
        
        if (book.title) {
          books.push({
            title: book.title,
            author: book.authors ? book.authors.join(', ') : author || 'Unknown Author',
            categories: book.categories || [],
            isbn: book.industryIdentifiers?.[0]?.identifier
          });
          console.log(`Found book: ${book.title}`);
        }
      } else {
        console.log(`No results for: "${title}"`);
      }
    } catch (error) {
      console.error(`Error searching for "${title}":`, error.message);
      
      // If API fails, add the book with original data
      if (title && title.length > 5) {
        books.push({
          title: title,
          author: author || 'Unknown Author',
          categories: []
        });
      }
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`Returning ${books.length} books`);
  return books;
}