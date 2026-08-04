'use client';
import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
}

export default function CloudinaryUpload({ onUpload }: CloudinaryUploadProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const configured = cloudName && cloudName !== 'your_cloud_name';

  async function handleFile(file: File) {
    if (!configured) {
      setError('Cloudinary is not configured yet. Add your credentials to .env.local');
      return;
    }

    setStatus('uploading');
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset!);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );
      const data = await res.json();
      if (data.secure_url) {
        setPreview(data.secure_url);
        setStatus('done');
        onUpload(data.secure_url);
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (e: unknown) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className="cursor-pointer border-2 border-dashed border-green-200 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50/50 transition-colors"
      >
        {status === 'uploading' && (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Uploading photo…</p>
          </div>
        )}
        {status === 'done' && preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Uploaded" className="mx-auto max-h-40 rounded-lg object-cover" />
        )}
        {(status === 'idle' || status === 'error') && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">
              {configured
                ? 'Click or drag & drop a photo here'
                : '⚠️ Cloudinary not configured — add credentials to .env.local'}
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {status === 'done' && (
        <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" /> Photo uploaded successfully
        </p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
