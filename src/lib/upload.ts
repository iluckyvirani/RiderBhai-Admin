import { api } from './api';

export async function uploadToCloudinary(file: File): Promise<{ url: string; name: string }> {
  const sign = await api<{
    timestamp: number;
    signature: string;
    folder: string;
    apiKey: string;
    cloudName: string;
  }>('/uploads/sign', { method: 'POST' });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  const body = await res.json();
  if (!res.ok || !body.secure_url) {
    throw new Error(body.error?.message || 'Cloudinary upload failed. Check your Cloudinary keys.');
  }
  return { url: body.secure_url as string, name: file.name };
}
