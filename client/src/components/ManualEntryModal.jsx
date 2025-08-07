import { useState } from 'react';
import { useVisitor } from '../contexts/VisitorContext';
import { bookService } from '../services/api';
import toast from 'react-hot-toast';

function ManualEntryModal({ onClose, onSuccess }) {
  const { visitorId } = useVisitor();
  const [books, setBooks] = useState([{ title: '', author: '', genre: 'Uncategorized' }]);
  const [submitting, setSubmitting] = useState(false);

  const genres = ['Fiction', 'History', 'Non-Fiction', 'Uncategorized'];

  const addBookField = () => {
    setBooks([...books, { title: '', author: '', genre: 'Uncategorized' }]);
  };

  const removeBookField = (index) => {
    setBooks(books.filter((_, i) => i !== index));
  };

  const updateBook = (index, field, value) => {
    const updated = [...books];
    updated[index][field] = value;
    setBooks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validBooks = books.filter(book => book.title && book.author);
    if (validBooks.length === 0) {
      toast.error('Please enter at least one book with title and author');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const book of validBooks) {
      try {
        await bookService.addBook({
          visitorId,
          ...book
        });
        successCount++;
      } catch (error) {
        if (error.response?.status === 409) {
          toast.error(`"${book.title}" already exists in your library`);
        } else {
          errorCount++;
        }
      }
    }

    setSubmitting(false);

    if (successCount > 0) {
      toast.success(`Added ${successCount} book(s) to your library!`);
      onSuccess();
    } else if (errorCount > 0) {
      toast.error('Failed to add some books');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Books Manually</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {books.map((book, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">Book {index + 1}</h3>
                    {books.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBookField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={book.title}
                        onChange={(e) => updateBook(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter book title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={book.author}
                        onChange={(e) => updateBook(index, 'author', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter author name"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        value={book.genre}
                        onChange={(e) => updateBook(index, 'genre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {genres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addBookField}
              className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors"
            >
              + Add Another Book
            </button>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : `Add ${books.filter(b => b.title && b.author).length} Book(s)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManualEntryModal;