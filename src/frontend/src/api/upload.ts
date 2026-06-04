import { API_BASE_URL } from './photos';

export interface UploadResult {
  status: string;
  [key: string]: unknown;
}

export interface UploadResponse {
  results?: UploadResult[];
  message?: string;
}

export async function uploadFiles(
  files: FileList
): Promise<{ res: Response; data: UploadResponse }> {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('file', file));
  const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  const data: UploadResponse = await res.json();
  return { res, data };
}
