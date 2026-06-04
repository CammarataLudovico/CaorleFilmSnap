export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_IP ||
  'https://api.caorlefilmsnap.ludov.dev'
).replace(/\/+$/, '');

export interface ApprovedPhotosResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  files: string[];
}

export interface Photo {
  src: string;
  width: number;
  height: number;
}

export async function fetchApprovedPhotos(page: number, limit: number): Promise<ApprovedPhotosResponse> {
  const res = await fetch(`${API_BASE_URL}/api/photos/approved?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch photos');
  return res.json();
}

export async function deleteApprovedPhoto(filename: string, adminKey: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/photos/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete photo');
  }
}

export async function loadPhotoDimensions(filenames: string[]): Promise<Photo[]> {
  return Promise.all(
    filenames.map((filename) => {
      const src = `${API_BASE_URL}/uploads/approved/${encodeURIComponent(filename)}`;
      return new Promise<Photo>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve({ src, width: img.width, height: img.height });
        img.onerror = () => resolve({ src, width: 800, height: 600 });
        img.src = src;
      });
    })
  );
}
