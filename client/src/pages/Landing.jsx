import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PhotoUploadModal from '../components/PhotoUploadModal';
import ManualEntryModal from '../components/ManualEntryModal';

function Landing() {
  const navigate = useNavigate();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const handleSuccess = () => {
    navigate('/library');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          Snap your shelf.
          <br />
          <span className="text-primary">Instantly catalogue</span> your books.
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Transform your physical library into a digital catalogue with just a photo. 
          Track your reading habits and discover insights about your collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors shadow-lg"
          >
            Upload your first shelf photo
          </button>
          
          <button
            onClick={() => setShowManualModal(true)}
            className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Start manually
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="font-semibold text-lg mb-2">Snap & Scan</h3>
            <p className="text-gray-600">Take photos of your bookshelves and let AI extract titles automatically</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-lg mb-2">Organize</h3>
            <p className="text-gray-600">Books are automatically categorized into Fiction, History, and Non-Fiction</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">Analyze</h3>
            <p className="text-gray-600">See beautiful charts showing your reading preferences and collection stats</p>
          </div>
        </div>
      </div>

      {showPhotoModal && (
        <PhotoUploadModal 
          onClose={() => setShowPhotoModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showManualModal && (
        <ManualEntryModal
          onClose={() => setShowManualModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default Landing;