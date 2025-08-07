function BookCard({ book, onEdit, onDelete }) {
  const genreColors = {
    'Fiction': 'bg-blue-100 text-blue-800',
    'History': 'bg-green-100 text-green-800',
    'Non-Fiction': 'bg-orange-100 text-orange-800',
    'Uncategorized': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-gray-600 mb-3">by {book.author}</p>
        
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${genreColors[book.genre]}`}>
          {book.genre}
        </span>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-primary transition-colors"
            title="Edit book"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete book"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;