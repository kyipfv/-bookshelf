import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Library from './pages/Library';
import { VisitorProvider } from './contexts/VisitorContext';

function App() {
  return (
    <VisitorProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </div>
      </Router>
    </VisitorProvider>
  );
}

export default App;
