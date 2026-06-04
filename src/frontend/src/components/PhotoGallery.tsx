import { MasonryPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import { useTranslation } from 'react-i18next';
import type { Photo } from '../api/photos';

interface PhotoGalleryProps {
  photos: Photo[];
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function PhotoGallery({ photos, page, total, limit, onPageChange }: PhotoGalleryProps) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="w-full">
      <MasonryPhotoAlbum
        photos={photos}
        columns={(containerWidth) => {
          if (containerWidth < 400) return 1;
          if (containerWidth < 600) return 2;
          return 3;
        }}
        componentsProps={(containerWidth) => ({
          image: { loading: (containerWidth || 0) > 600 ? 'eager' : 'lazy' },
        })}
      />
      <div className="flex justify-center mt-4 gap-2">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
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
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('pages.next')}
        </button>
      </div>
    </div>
  );
}
