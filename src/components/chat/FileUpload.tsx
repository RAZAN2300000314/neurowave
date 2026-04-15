import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Music, Image, CheckCircle, Loader2, X } from 'lucide-react';
import { uploadFile } from '../../services/api';
import type { FileUrls } from '../../types';

interface Props {
  onUploadComplete: (urls: FileUrls, file: File) => void;
  type: 'audio' | 'image';
}

export default function FileUpload({ onUploadComplete, type }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [error, setError] = useState('');

  const accept = type === 'audio' ? 'audio/*,.edf,.bdf' : 'image/*,.png,.jpg,.jpeg,.tiff';
  const Icon = type === 'audio' ? Music : Image;

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const urls = await uploadFile(file, type);
      setUploaded(file.name);
      onUploadComplete(urls, file);
    } catch {
      setError(t('uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setUploaded(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />

      {uploaded ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 truncate font-body">{uploaded}</span>
          <button onClick={reset} className="shrink-0 hover:text-emerald-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            relative flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed cursor-pointer transition-all
            ${dragging
              ? 'border-neural-400 bg-neural-50 dark:bg-neural-900/20'
              : 'border-gray-200 dark:border-dark-500 hover:border-neural-300 dark:hover:border-neural-700 bg-white dark:bg-dark-700'
            }
          `}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-neural-400 animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-body text-center">
                {type === 'audio' ? t('uploadAudio') : t('uploadImage')}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                {type === 'audio' ? 'WAV · MP3 · EDF · BDF' : 'PNG · JPG · TIFF'}
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 font-body">{error}</p>
      )}
    </div>
  );
}
