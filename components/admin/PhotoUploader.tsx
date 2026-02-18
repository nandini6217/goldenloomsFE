'use client';

import { useRef, useState } from 'react';
import { uploadApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

type PhotoUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  maxCount?: number;
};

export function PhotoUploader({ value, onChange, maxCount = 10 }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addUrls = (newUrls: string[]) => {
    const combined = [...value, ...newUrls].slice(0, maxCount);
    onChange(combined);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const toAdd: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        if (value.length + toAdd.length >= maxCount) break;
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const url = await uploadApi.uploadImage(file);
        toAdd.push(url);
      }
      addUrls(toAdd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
      inputRef.current?.value && (inputRef.current.value = '');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-[12px] border border-primary/20 overflow-hidden bg-secondary/30 group"
          >
            <img
              src={url}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
              aria-label="Remove image"
            >
              Remove
            </button>
          </div>
        ))}
        {value.length < maxCount && (
          <label className="w-20 h-20 rounded-[12px] border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <span className="text-xs text-primary/60">Uploading…</span>
            ) : (
              <span className="text-2xl text-primary/50">+</span>
            )}
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-primary/60">
        Add up to {maxCount} images (JPEG, PNG, WebP, GIF). Max 5MB each.
      </p>
    </div>
  );
}
