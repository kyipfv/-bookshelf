const genreMappings = {
  'Fiction': [
    'fiction', 'novel', 'literature', 'fantasy', 'science fiction', 
    'mystery', 'thriller', 'romance', 'horror', 'adventure',
    'young adult', 'literary fiction', 'contemporary', 'classics',
    'drama', 'poetry', 'graphic novels', 'comics', 'manga'
  ],
  'History': [
    'history', 'historical', 'biography', 'autobiography', 'memoir',
    'war', 'military', 'ancient', 'medieval', 'renaissance',
    'world war', 'civil war', 'american history', 'european history',
    'asian history', 'african history', 'archaeology', 'anthropology'
  ],
  'Non-Fiction': [
    'non-fiction', 'nonfiction', 'science', 'technology', 'mathematics',
    'philosophy', 'psychology', 'self-help', 'business', 'economics',
    'cooking', 'travel', 'art', 'music', 'sports', 'health',
    'medicine', 'nature', 'politics', 'religion', 'education',
    'reference', 'computers', 'programming', 'engineering'
  ]
};

export function mapGenre(categories = []) {
  if (!categories || categories.length === 0) {
    return 'Uncategorized';
  }

  const categoryString = categories.join(' ').toLowerCase();

  for (const [genre, keywords] of Object.entries(genreMappings)) {
    for (const keyword of keywords) {
      if (categoryString.includes(keyword)) {
        return genre;
      }
    }
  }

  return 'Non-Fiction';
}