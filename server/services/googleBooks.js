import axios from 'axios';

export async function searchGoogleBooks(extractedText) {
  const books = [];
  const lines = extractedText.split('\n').filter(line => line.trim().length > 3);
  
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
        potentialBooks.push({ title: line, author: '' });
      }
    }
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const maxQueries = Math.min(potentialBooks.length, 10);

  for (let i = 0; i < maxQueries; i++) {
    const { title, author } = potentialBooks[i];
    
    try {
      const query = author ? `intitle:${title} inauthor:${author}` : `intitle:${title}`;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}${apiKey ? `&key=${apiKey}` : ''}`;
      
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data.items && response.data.items.length > 0) {
        const book = response.data.items[0].volumeInfo;
        
        if (book.title && book.authors) {
          books.push({
            title: book.title,
            author: book.authors.join(', '),
            categories: book.categories || [],
            isbn: book.industryIdentifiers?.[0]?.identifier
          });
        }
      }
    } catch (error) {
      console.error(`Error searching for "${title}" by "${author}":`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return books.length > 0 ? books : [{
    title: potentialBooks[0]?.title || 'Unknown Title',
    author: potentialBooks[0]?.author || 'Unknown Author',
    categories: []
  }];
}