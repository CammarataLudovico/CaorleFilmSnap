import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import Logo from '/logo.png'
import './App.css'
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css"
import "react-photo-album/masonry.css";
import "../../locales/i18n.js"
import { useTranslation } from 'react-i18next';

function App() {
  // const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [agreed, setAgreed] = useState(true)
  const [photos, setPhotos] = useState<{ src: string; width: number; height: number }[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  useEffect(() => {
  i18n.changeLanguage('it');
}, []);

  useEffect(() => {
    setLoadingPhotos(true);
    // fetch approved files list from backend
    fetch('https://api.caorlefilmsnap.ludov.dev/api/photos/approved')
      .then(res => res.json())
      .then(async data => {
        // for each file, create an object with src and dimensions (use placeholder for width/height)
        const photoObjs = await Promise.all(
          data.files.map(async (filename: string) => {
            const src = `https://api.caorlefilmsnap.ludov.dev/uploads/approved/${filename}`;
            // try to load the image to get real dimensions
            return new Promise<{ src: string; width: number; height: number }>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve({ src, width: img.width, height: img.height });
              // fallback
              img.onerror = () => resolve({ src, width: 800, height: 600 });
              img.src = src;
            });
          })
        );
        setPhotos(photoObjs);
        setLoadingPhotos(false);
      })
      .catch(() => {
        setPhotos([]);
        setLoadingPhotos(false);
      });
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    // Image preview logic
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
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
      const res = await fetch("https://api.caorlefilmsnap.ludov.dev/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || t('upload.genericError'));
      }

      setUploadMessage({ type: 'success', text: t('upload.success') });
      setFiles(null); // clear selected files
      setImagePreview(null); // clear preview
      // Optionally, reset the file input value as well
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
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
    <>
      {/* Language selector */}
      <div className="flex justify-end p-4">
        <div className="flex items-center gap-2 bg-base-200 rounded-xl px-4 py-5 shadow-sm">
          <span className="text-sm font-semibold text-base-content flex items-center gap-1">
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
        <a href="https://caorlefilmfestival.com" target="_blank">
          <img src={Logo} className="logo" alt="Vite logo" />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{t('file.pickFile')}</legend>
          <label className="custom-file-label" style={{ display: 'block', cursor: 'pointer' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => document.getElementById('file-input')?.click()}
              style = {{ backgroundColor: "blueviolet"}}
            >
              {t('file.pickFile')}
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
          {imagePreview && (
            <div className="flex justify-center mt-4">
              <div className="bg-base-200 rounded-lg p-2 border border-dashed border-primary w-64 flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-lg mb-2"
                  style={{
                    maxHeight: '160px', // max height for mobile
                    width: 'auto',
                    maxWidth: '100%',   // responsive width
                    objectFit: 'contain',
                  }}
                  loading='lazy'
                />
                <span className="text-xs text-gray-500">{files && files[0]?.name}</span>
              </div>
            </div>
          )}
          <label className="label">{t('file.fileSize')}</label>
        </fieldset>

        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
          <legend className="fieldset-legend">{t('file.legalNotes')}</legend>
          <label className="label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="checkbox"
            />
            {t('file.sensitiveCheckbox')}
          </label>
        </fieldset>

        <button
          type="submit"
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          disabled={uploading} // Already disables during upload
          style={{ marginTop: "1rem"}}
        >
          {t('file.upload')}
        </button>
      </form>

      {/* ALL ELEMENTS AFTER THE FORM */}
      
      {/* Upload loading state */}
      {uploading && (
        <div className="w-full flex justify-center my-8">
          <div className="bg-base-100 shadow-md rounded-lg p-6 max-w-sm w-full flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-primary mb-3"></span>
            <p className="font-semibold mb-4 text-center">
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
            <div className={`font-semibold mb-4 text-center ${uploadMessage.type === 'success' ? 'text-success' : 'text-error'}`}>
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
            <p className="mt-2 text-center font-semibold">
              {t('upload.pageStartLoading')}
            </p>
          </div>
        </div>
      )}

      {!loadingPhotos && (
        <MasonryPhotoAlbum
          photos={photos}
          columns={(containerWidth) => {
            if (containerWidth < 400) return 1;
            if (containerWidth < 600) return 2;
            if (containerWidth < 800) return 3;
            return 3;
          }}
        />
      )}
    </>
  )
}

export default App
