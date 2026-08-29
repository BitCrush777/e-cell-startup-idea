'use client';

import React, { useState, useRef } from 'react';
import { useToast } from './ToastProvider';

interface FileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendFile: (file: { id: string; name: string; size: number; type: string; dataUrl: string }) => void;
}

export default function FileShareModal({ isOpen, onClose, onSendFile }: FileShareModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast('File exceeds 10MB temporary transfer limit', 'error');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSend = () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      onSendFile({
        id: Math.random().toString(36).substring(2, 9),
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        dataUrl: reader.result as string,
      });
      setIsUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
      toast('File shared in room session!', 'success');
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-white/15 bg-[#0D1C2D]/95 shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">attach_file</span>
            <h3 className="font-display font-bold text-base text-on-surface">Ephemeral File Share</h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant">
          Files reside strictly in volatile room memory and are wiped on session expiration.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="p-4 bg-[#051424] rounded-xl border border-white/10 flex flex-col items-center gap-2">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-36 rounded-lg object-contain border border-white/10"
              />
            ) : (
              <span className="material-symbols-outlined text-4xl text-primary">description</span>
            )}
            <span className="text-xs font-semibold text-on-surface text-center truncate max-w-full">
              {selectedFile.name}
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono-timer">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-2 bg-[#051424]/40 hover:bg-primary/5 transition-all"
          >
            <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
            <span className="text-xs font-semibold text-on-surface">Choose Image or Document</span>
            <span className="text-[10px] text-on-surface-variant">Max size 10MB</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onClose}
            className="btn-ghost py-2 rounded-xl text-xs font-semibold uppercase"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedFile || isUploading}
            className="btn-primary py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-40"
          >
            {isUploading ? 'Sending...' : 'Send File'}
          </button>
        </div>
      </div>
    </div>
  );
}
