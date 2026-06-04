import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FilePreview } from './FilePreview';
import { uploadFiles } from '../api/upload';

interface UploadFormProps {
  onUploadComplete: (result: { type: 'success' | 'error'; text: string }) => void;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileList | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFilesArr = Array.from(e.target.files);
    const existingArr = files ? Array.from(files) : [];
    const merged = [...newFilesArr, ...existingArr];
    const dt = new DataTransfer();
    merged.forEach((f) => dt.items.add(f));
    setFiles(dt.files);

    Promise.all(
      newFilesArr.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((newPreviews) => setImagePreviews((prev) => [...newPreviews, ...prev]));
  };

  const handleRemovePreview = (idx: number) => {
    if (!files) return;
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    const dt = new DataTransfer();
    Array.from(files).forEach((f, i) => {
      if (i !== idx) dt.items.add(f);
    });
    setFiles(dt.files);
    const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.files = dt.files;
      if (dt.files.length === 0) fileInput.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      onUploadComplete({ type: 'error', text: t('file.plsSelect') });
      return;
    }
    if (!agreed) {
      onUploadComplete({ type: 'error', text: t('file.sensitiveAgreed') });
      return;
    }
    setUploading(true);
    try {
      const { res, data } = await uploadFiles(files);
      if (data?.results?.some((r) => r.status === 'rejected')) {
        onUploadComplete({ type: 'error', text: t('upload.sensitiveRejected') });
      } else if (!res.ok) {
        onUploadComplete({ type: 'error', text: data.message ?? t('upload.genericError') });
      } else {
        onUploadComplete({ type: 'success', text: t('upload.success') });
      }
      setFiles(null);
      setImagePreviews([]);
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      onUploadComplete({
        type: 'error',
        text:
          err instanceof Error
            ? `${t('upload.uploadError')} ${err.message}`
            : t('upload.unkownError'),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-white">{t('file.pickFile')}</legend>
          <label className="custom-file-label block cursor-pointer">
            <button
              type="button"
              className="btn btn-primary bg-[blueviolet]"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <span className="text-white">{t('file.pickFile')}</span>
            </button>
            <input
              id="file-input"
              type="file"
              className="file-input hidden"
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
          </label>
          <FilePreview previews={imagePreviews} files={files} onRemove={handleRemovePreview} />
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
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl mt-4"
          disabled={uploading}
        >
          <span className="text-white">{t('file.upload')}</span>
        </button>
      </form>

      {uploading && (
        <div className="w-full flex justify-center my-8">
          <div className="bg-base-100 shadow-md rounded-lg p-6 max-w-sm w-full flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-primary mb-3"></span>
            <p className="font-semibold mb-4 text-center text-white">{t('upload.uploading')}</p>
            <progress className="progress progress-secondary w-75 h-3" value="100" max="100"></progress>
          </div>
        </div>
      )}
    </>
  );
}
