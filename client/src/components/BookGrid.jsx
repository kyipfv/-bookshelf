import { useState } from 'react';
import BookCard from './BookCard';
import EditBookModal from './EditBookModal';

function BookGrid({ books, onUpdate, onDelete }) {
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Genres</option>
          <option value="Fiction">Fiction</option>
          <option value="History">History</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Uncategorized">Uncategorized</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onEdit={() => setEditingBook(book)}
            onDelete={() => onDelete(book.id)}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found matching your search.</p>
        </div>
      )}

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onSave={(updates) => {
            onUpdate(editingBook.id, updates);
            setEditingBook(null);
          }}
          onClose={() => setEditingBook(null)}
        />
      )}
    </>
  );
}

export default BookGrid;