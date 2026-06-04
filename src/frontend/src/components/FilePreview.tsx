import { useTranslation } from 'react-i18next';

interface FilePreviewProps {
  previews: string[];
  files: FileList | null;
  onRemove: (idx: number) => void;
}

export function FilePreview({ previews, files, onRemove }: FilePreviewProps) {
  const { t } = useTranslation();
  if (previews.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center mt-4 gap-4">
      {previews.map((preview, idx) => {
        const filename = files?.[idx]?.name ?? '';
        return (
          <div
            key={`${filename}-${idx}`}
            className="bg-base-200 rounded-lg p-2 border border-dashed border-primary w-64 flex flex-col items-center"
          >
            <img
              src={preview}
              alt={`Preview ${idx + 1}`}
              className="rounded-lg mb-2 max-h-40 w-auto max-w-full object-contain"
              loading="lazy"
            />
            <span className="text-xs text-gray-500">{filename}</span>
            <button
              type="button"
              className="btn btn-xs mt-2 bg-red-600 text-white"
              onClick={() => onRemove(idx)}
            >
              {t('file.remove')}
            </button>
          </div>
        );
      })}
    </div>
  );
}
