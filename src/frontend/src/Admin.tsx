import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  API_BASE_URL,
  fetchApprovedPhotos,
  deleteApprovedPhoto,
} from './api/photos';

const ADMIN_KEY_STORAGE = 'caorle-admin-key';
const ADMIN_PAGE_LIMIT = 30;

const Admin = () => {
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem(ADMIN_KEY_STORAGE) || ''
  );
  const [files, setFiles] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_LIMIT));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApprovedPhotos(page, ADMIN_PAGE_LIMIT);
      setFiles(data.files ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Unable to load photos');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveKey = () => {
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
  };

  const handleDelete = async (filename: string) => {
    if (!adminKey.trim()) {
      setError('Enter the admin key first');
      return;
    }
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    setDeleting(filename);
    setError(null);
    try {
      await deleteApprovedPhoto(filename, adminKey.trim());
      // If last item on a page beyond the first, step back a page.
      if (files.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-base-content">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin — Photos</h1>
        <Link to="/" className="link link-primary text-sm">
          ← Back to site
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="password"
          className="input input-bordered w-full sm:max-w-md"
          placeholder="Admin key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSaveKey}>
          Save key
        </button>
        <button className="btn" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading && (
        <div className="w-full flex justify-center my-8">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}

      {!loading && files.length === 0 && (
        <p className="text-center opacity-70 my-8">No approved photos.</p>
      )}

      {!loading && files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((filename) => (
            <div
              key={filename}
              className="relative group rounded-lg overflow-hidden shadow bg-base-200"
            >
              <img
                src={`${API_BASE_URL}/uploads/approved/${encodeURIComponent(filename)}`}
                alt={filename}
                loading="lazy"
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                aria-label="Delete photo"
                title="Delete photo"
                onClick={() => handleDelete(filename)}
                disabled={deleting === filename}
                className="btn btn-error btn-sm btn-circle absolute top-2 right-2 opacity-90"
              >
                {deleting === filename ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            className="btn btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="inline-flex items-center px-3">
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;
