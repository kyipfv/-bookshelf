import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../contexts/VisitorContext';
import { bookService } from '../services/api';
import BookGrid from '../components/BookGrid';
import StatsCard from '../components/StatsCard';
import PhotoUploadModal from '../components/PhotoUploadModal';
import ManualEntryModal from '../components/ManualEntryModal';
import toast from 'react-hot-toast';

function Library() {
  const navigate = useNavigate();
  const { visitorId } = useVisitor();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    if (visitorId) {
      loadBooks();
    }
  }, [visitorId]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBooks(visitorId);
      setBooks(data);
    } catch (error) {
      toast.error('Failed to load books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookUpdate = async (id, updates) => {
    try {
      const updated = await bookService.updateBook(id, {
        visitorId,
        ...updates
      });
      setBooks(books.map(book => book.id === id ? updated : book));
      toast.success('Book updated');
    } catch (error) {
      toast.error('Failed to update book');
      console.error(error);
    }
  };

  const handleBookDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await bookService.deleteBook(id, visitorId);
      setBooks(books.filter(book => book.id !== id));
      toast.success('Book deleted');
    } catch (error) {
      toast.error('Failed to delete book');
      console.error(error);
    }
  };

  const getStats = () => {
    const stats = {
      total: books.length,
      fiction: books.filter(b => b.genre === 'Fiction').length,
      history: books.filter(b => b.genre === 'History').length,
      nonFiction: books.filter(b => b.genre === 'Non-Fiction').length,
      uncategorized: books.filter(b => b.genre === 'Uncategorized').length
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2 bg-white text-primary border border-primary rounded-lg hover:bg-gray-50"
              >
                Add Manually
              </button>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Upload Photos
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-6">Start by uploading a photo of your bookshelf or adding books manually</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowPhotoModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Upload Shelf Photo
              </button>
              <button
                onClick={() => setShowManualModal(true)}
                className="px-6 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-gray-50"
              >
                Add Books Manually
              </button>
            </div>
          </div>
        ) : (
          <>
            <StatsCard stats={getStats()} />
            <BookGrid 
              books={books}
              onUpdate={handleBookUpdate}
              onDelete={handleBookDelete}
            />
          </>
        )}
      </main>

      {showPhotoModal && (
        <PhotoUploadModal 
          onClose={() => setShowPhotoModal(false)}
          onSuccess={() => {
            setShowPhotoModal(false);
            loadBooks();
          }}
        />
      )}

      {showManualModal && (
        <ManualEntryModal
          onClose={() => setShowManualModal(false)}
          onSuccess={() => {
            setShowManualModal(false);
            loadBooks();
          }}
        />
      )}
    </div>
  );
}

export default Library;