import { useState, useEffect, useRef } from 'react';
import Logo from '/logo.png';
import './App.css';
import { Link } from 'react-router-dom';
import { LanguageSelector } from './components/LanguageSelector';
import { UploadMessage } from './components/UploadMessage';
import { UploadForm } from './components/UploadForm';
import { PhotoGallery } from './components/PhotoGallery';
import { usePhotos } from './hooks/usePhotos';

function App() {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);
  const { photos, total, loading, limit, refresh } = usePhotos(page);
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!loading) {
      if (window.location.hash !== '#gallery') window.location.hash = 'gallery';
      setTimeout(
        () => galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      );
    }
  }, [loading]);

  useEffect(() => {
    if (uploadMessage?.type === 'success') {
      const timer = setTimeout(() => setUploadMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadMessage]);

  const handleUploadComplete = (result: { type: 'success' | 'error'; text: string }) => {
    setUploadMessage(result);
    if (result.type === 'success') refresh();
  };

  return (
    <div className="text-white">
      <LanguageSelector />
      <div>
        <a href="https://caorlefilmfestival.com" target="_blank" rel="noopener noreferrer">
          <img src={Logo} className="logo" alt="CaorleFilmFestival logo" />
        </a>
      </div>
      <UploadForm onUploadComplete={handleUploadComplete} />
      {uploadMessage && (
        <UploadMessage message={uploadMessage} onDismiss={() => setUploadMessage(null)} />
      )}
      {loading && (
        <div className="w-full flex justify-center my-8">
          <div className="max-w-md w-full px-4">
            <progress className="progress progress-secondary w-full h-3" value="100" max="100"></progress>
          </div>
        </div>
      )}
      {!loading && (
        <div id="gallery" ref={galleryRef} className="w-full">
          <PhotoGallery
            photos={photos}
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}
      <div className="w-full flex flex-col items-center justify-center mt-12 mb-4 gap-2">
        <Link to="/policy" className="underline text-primary text-sm font-semibold mb-1">
          Privacy Policy
        </Link>
        <span className="text-xs text-black dark:text-white text-center">
          &copy; {new Date().getFullYear()} CaorleFilmFestival
        </span>
      </div>
    </div>
  );
}

export default App;
