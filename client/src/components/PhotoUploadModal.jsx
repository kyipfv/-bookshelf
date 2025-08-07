import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useVisitor } from '../contexts/VisitorContext';
import { bookService } from '../services/api';
import toast from 'react-hot-toast';

function PhotoUploadModal({ onClose, onSuccess }) {
  const { visitorId } = useVisitor();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    
    const newPreviews = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif', '.HEIC', '.HEIF']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading(`Processing ${files.length} image(s)...`);

    try {
      const result = await bookService.uploadImages(visitorId, files);
      
      toast.dismiss(loadingToast);
      
      if (result.books.length > 0) {
        toast.success(`Added ${result.books.length} book(s) to your library!`);
        onSuccess();
      } else {
        toast.error('No books could be extracted from the images');
      }

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(err => {
          toast.error(`Error with ${err.file}: ${err.error}`);
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to process images');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[85vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Shelf Photos</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {isDragActive ? (
              <p className="text-primary">Drop the images here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">Drag & drop shelf photos here, or click to select</p>
                <p className="text-sm text-gray-400">Supports JPG, PNG, GIF, WebP, HEIC (iPhone photos)</p>
              </>
            )}
          </div>

          {previews.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Selected Images ({previews.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processing...' : `Upload ${files.length} Image(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoUploadModal;