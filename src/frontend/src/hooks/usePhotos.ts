import { useState, useEffect, useCallback } from 'react';
import { fetchApprovedPhotos, loadPhotoDimensions } from '../api/photos';
import type { Photo } from '../api/photos';

export const PHOTOS_LIMIT = 9;

export function usePhotos(page: number) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApprovedPhotos(page, PHOTOS_LIMIT);
      setTotal(data.total ?? 0);
      const photoObjs = await loadPhotoDimensions(data.files ?? []);
      setPhotos(photoObjs);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return { photos, total, loading, limit: PHOTOS_LIMIT, refresh: load };
}
