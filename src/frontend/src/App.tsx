import { useState, useEffect, useRef } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import Logo from '/logo.png'
import './App.css'
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css"
import "react-photo-album/masonry.css";
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_IP ||
  'https://api.caorlefilmsnap.ludov.dev'
).replace(/\/+$/, '');

function App() {
  // Ref per la gallery (deve stare dentro il componente)
  const galleryRef = useRef<HTMLDivElement | null>(null);
  // const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [agreed, setAgreed] = useState(true)
  const [photos, setPhotos] = useState<{ src: string; width: number; height: number }[]>([])
  const [page, setPage] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0); // track total photos
  const limitPhotoPage = 9;
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Cambiato da string | null a array di stringhe
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage('it');
  }, [i18n]);

  // On mount, update URL to include #gallery (anchor)
  // Aggiorna hash e scrolla alla gallery SOLO dopo che le foto sono caricate
  useEffect(() => {
    if (!loadingPhotos) {
      if (window.location.hash !== '#gallery') {
        window.location.hash = 'gallery';
      }
      setTimeout(() => {
        if (galleryRef.current) {
          galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [loadingPhotos]);

  // Fetch photos function (to reuse after upload)
  const fetchPhotos = () => {
    setLoadingPhotos(true);
    fetch(`${API_BASE_URL}/api/photos/approved?page=${page}&limit=${limitPhotoPage}`)
      .then(res => res.json())
      .then(async data => {
        setTotalPhotos(data.total || 0); // track total for pagination
        const filesFromApi = Array.isArray(data?.files) ? data.files : [];
        // For each file, create an object with src and dimensions (use placeholder for width/height)
        const photoObjs = await Promise.all(
          filesFromApi.map(async (filename: string) => {
            const src = `${API_BASE_URL}/uploads/approved/${encodeURIComponent(filename)}`;
            // Just get image dimensions, do NOT try to orient remote images with EXIF-js (not possible)
            return new Promise<{ src: string; width: number; height: number }>((resolve) => {
              const img = new window.Image();
              img.crossOrigin = "Anonymous";
              img.onload = () => {
                resolve({ src, width: img.width, height: img.height });
              };
              // fallback
              img.onerror = () => resolve({ src, width: 800, height: 600 });
              img.src = src;
            });
          })
        );
        // Show newest first (first in array)
        setPhotos(photoObjs);
        setLoadingPhotos(false);
      })
      .catch(() => {
        setPhotos([]);
        setLoadingPhotos(false);
      });
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // fetch photos when page changes

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFilesArr = Array.from(e.target.files);

      // Merge new files before existing ones
      let updatedFilesArr: File[] = [];
      if (files && files.length > 0) {
        updatedFilesArr = newFilesArr.concat(Array.from(files));
      } else {
        updatedFilesArr = newFilesArr;
      }

      // Recreate updated FileList
      const dt = new DataTransfer();
      updatedFilesArr.forEach(file => dt.items.add(file));
      setFiles(dt.files);

      // Generate preview for each new file and add them BEFORE the previous ones
      Promise.all(
        newFilesArr.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      ).then(newPreviews => setImagePreviews(prev => [...newPreviews, ...prev]));
    }
    // If no file selected, do nothing (do not clear existing previews)
  }

  const handleRemovePreview = (idx: number) => {
    if (!files) return;
    // Remove preview and associated file
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImagePreviews(newPreviews);

    // Recreate FileList without the removed file
    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== idx) dt.items.add(file);
    });
    setFiles(dt.files);

    // Aggiorna input file
    const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.files = dt.files;
      if (dt.files.length === 0) fileInput.value = '';
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!files || files.length === 0) {
      setUploadMessage({ type: 'error', text: t('file.plsSelect') });
      return
    }

    if (!agreed) {
      setUploadMessage({ type: 'error', text: t('file.sensitiveAgreed') });
      return
    }

    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('file', file)
    })

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      type UploadResult = { status: string; [key: string]: unknown };
      type UploadResponse = { results?: UploadResult[]; message?: string };

      const data: UploadResponse = await res.json();

      // If at least one photo was rejected, notify the user and DO NOT show the success message
      if (data?.results?.some((r: UploadResult) => r.status === 'rejected')) {
        setUploadMessage({ type: 'error', text: t('upload.sensitiveRejected') });
      } else if (!res.ok) {
        setUploadMessage({ type: 'error', text: data.message || t('upload.genericError') });
      } else {
        setUploadMessage({ type: 'success', text: t('upload.success') });
      }

      setFiles(null); // clear selected files
      setImagePreviews([]); // clear previews
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      fetchPhotos();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadMessage({ type: 'error', text: `${t('upload.uploadError')} ${error.message}` });
      } else {
        setUploadMessage({ type: 'error', text: t('upload.unkownError') });
      }
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (uploadMessage && uploadMessage.type === 'success') {
      const timer = setTimeout(() => setUploadMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadMessage]);

  return (
  <div className="text-white">
      {/* Language selector */}
      <div className="flex justify-end p-4">
        <div className="flex items-center gap-2 bg-base-200 rounded-xl px-4 py-5 shadow-sm">
          <span className="text-sm font-semibold text-black dark:text-white flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414m12.728 0l-1.414-1.414M6.343 6.343L4.929 4.929" />
            </svg>
          </span>
          <select
            className="select select-primary select-xs"
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
          >
            <option value="it">🇮🇹 Italiano</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>
      </div>

      <div>
        <a href="https://caorlefilmfestival.com" target="_blank" rel="noopener noreferrer">
          <img src={Logo} className="logo" alt="Vite logo" />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-white">{t('file.pickFile')}</legend>
          <label className="custom-file-label" style={{ display: 'block', cursor: 'pointer' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => document.getElementById('file-input')?.click()}
              style = {{ backgroundColor: "blueviolet"}}
            >
              <span className="text-white">{t('file.pickFile')}</span>
            </button>
            <input
              id="file-input"
              type="file"
              className="file-input"
              onChange={handleFileChange}
              accept="image/*"
              multiple // allows multiple selection
              style={{ display: 'none' }}
            />
          </label>
          {/* Image preview DaisyUI style */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap justify-center mt-4 gap-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="bg-base-200 rounded-lg p-2 border border-dashed border-primary w-64 flex flex-col items-center">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="rounded-lg mb-2"
                    style={{
                      maxHeight: '160px',
                      width: 'auto',
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }}
                    loading='lazy'
                  />
                  <span className="text-xs text-gray-500">{files && files[idx]?.name}</span>
                  <button
                    type="button"
                    className='btn btn-xs mt-2'
                    style={{ backgroundColor: "red" }}
                    onClick={() => handleRemovePreview(idx)}
                  >
                    <span className="text-white">{t('file.remove')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="label text-white">{t('file.fileSize')}</label>
        </fieldset>

        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
          <legend className="fieldset-legend text-white">{t('file.legalNotes')}</legend>
          <label className="label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="checkbox"
            />
            <span className="text-white">{t('file.sensitiveCheckbox')}</span>
          </label>
        </fieldset>

        <button
          type="submit"
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          disabled={uploading} // Already disables during upload
          style={{ marginTop: "1rem"}}
        >
          <span className="text-white">{t('file.upload')}</span>
        </button>
      </form>

      {/* ALL ELEMENTS AFTER THE FORM */}
      
      {/* Upload loading state */}
      {uploading && (
        <div className="w-full flex justify-center my-8">
          <div className="bg-base-100 shadow-md rounded-lg p-6 max-w-sm w-full flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-primary mb-3"></span>
            <p className="font-semibold mb-4 text-center text-white">
              {t('upload.uploading')}
            </p>
            <progress className="progress progress-secondary w-75 h-3" value="100" max="100"></progress>
          </div>
        </div>
      )}

      {/* Upload result message */}
      {uploadMessage && (
        <div className="uploadMess">
        <div className="w-full flex justify-center my-8 ">
          <div
              className={`shadow-md rounded-lg p-6 max-w-sm w-full flex flex-col items-center 
                ${uploadMessage.type === 'error'
                  ? 'bg-red-600 border-red-700'
                  : 'bg-red-600 border-red-700'}`}
            >
            <div className={`font-semibold mb-4 text-center ${uploadMessage.type === 'success' ? 'text-success' : 'text-error'} text-white`}>
              {uploadMessage.text}
            </div>
            <button
              className="btn btn-outline w-32"
              onClick={() => setUploadMessage(null)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Loading indicator for photos */}
      {loadingPhotos && (
        <div className="w-full flex justify-center my-8">
          <div className="max-w-md w-full px-4">
            <progress className="progress progress-secondary w-full h-3" value="100" max="100"></progress>
            <p className="mt-2 text-center font-semibold text-white">
              {t('upload.pageStartLoading')}
            </p>
          </div>
        </div>
      )}

      {!loadingPhotos && (
        <>
          {/* Photo gallery section with anchor and ref */}
          <div id="gallery" ref={galleryRef} className="w-full">
            <MasonryPhotoAlbum
              photos={photos}
              columns={(containerWidth) => {
                if (containerWidth < 400) return 1;
                if (containerWidth < 600) return 2;
                if (containerWidth < 800) return 3;
                return 3;
              }}
              componentsProps={(containerWidth) => ({
                image: { loading: (containerWidth || 0) > 600 ? "eager" : "lazy" },
              })}
            />
            {/* Pagination controls */}
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {t('pages.prev')}
              </button>
              <span
                className="inline-flex items-center justify-center rounded-full bg-primary text-white font-bold px-3 py-1 text-lg shadow"
                style={{ minWidth: 36, minHeight: 36 }}
              >
                {page}
              </span>
              <button
                className="btn btn-sm"
                disabled={page >= Math.ceil(totalPhotos / limitPhotoPage)}
                onClick={() => setPage(page + 1)}
              >
                {t('pages.next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Link to privacy policy and copyright at the bottom of the page */}
      <div className="w-full flex flex-col items-center justify-center mt-12 mb-4 gap-2">
        <Link to="/policy" className="underline text-primary text-sm font-semibold mb-1">
          Privacy Policy
        </Link>
  <span className="text-xs text-black dark:text-white text-center">&copy; 2025 CaorleFilmFestival</span>
      </div>
  </div>
  )
}

export default App