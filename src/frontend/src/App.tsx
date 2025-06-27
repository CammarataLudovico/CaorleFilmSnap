import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import Logo from '/logo.png'
import './App.css'
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css"
import "react-photo-album/masonry.css";

function App() {
  // const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [agreed, setAgreed] = useState(true)
  const [photos, setPhotos] = useState<{ src: string; width: number; height: number }[]>([])

  useEffect(() => {
    // fetch approved files list from backend
    fetch('http://localhost:3001/api/photos/approved')
      .then(res => res.json())
      .then(async data => {
        // for each file, create an object with src and dimensions (use placeholder for width/height)
        const photoObjs = await Promise.all(
          data.files.map(async (filename: string) => {
            const src = `http://localhost:3001/uploads/approved/${filename}`;
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
      })
      .catch(() => setPhotos([]));
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!files || files.length === 0) {
      alert('Please select at least one file before submitting.')
      return
    }

    if (!agreed) {
      alert('You must confirm that you have not uploaded sensitive content.')
      return
    }

    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('file', file)
    })

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Generic error during upload');
      }

      alert(`✅ Upload successful!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`❌ Upload error: ${error.message}`);
      } else {
        alert('❌ Unknown error during upload');
      }
    }
  }

  return (
    <>
      <div>
        <a href="https://caorlefilmfestival.com" target="_blank">
          <img src={Logo} className="logo" alt="Vite logo" />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Pick a file</legend>
          <label className="custom-file-label" style={{ display: 'block', cursor: 'pointer' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Select file(s)
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
          <label className="label">Maximum size per photo: 16MB</label>
        </fieldset>

        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
          <legend className="fieldset-legend">Legal notes</legend>
          <label className="label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="checkbox"
            />
            I have not uploaded sensitive content
          </label>
        </fieldset>

        <button
          type="submit"
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
        >
          Submit Photo
        </button>
      </form>

      <MasonryPhotoAlbum
        photos={photos}
        columns={(containerWidth) => {
          if (containerWidth < 400) return 1;
          if (containerWidth < 600) return 2;
          if (containerWidth < 800) return 3;
          return 3;
        }}
      />
    </>
  )
}

export default App