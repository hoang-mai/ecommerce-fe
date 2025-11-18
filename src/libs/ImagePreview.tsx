'use client';

import Image from "next/image";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import {useState} from "react";

interface ImagePreviewProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
}

export default function ImagePreview({imageUrl, onClose, alt = "Preview"}: ImagePreviewProps) {
  const [scale, setScale] = useState(1);

  if (!imageUrl) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-image flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleZoomOut}
          className="cursor-pointer p-3 bg-grey-c800 hover:bg-grey-c900 rounded-lg transition-all text-white shadow-lg hover:scale-110 active:scale-95"
          title="Thu nhỏ"
        >
          <ZoomOutRoundedIcon />
        </button>
        <button
          onClick={handleReset}
          className="cursor-pointer p-3 bg-primary-c700 hover:bg-primary-c800 rounded-lg transition-all text-white shadow-lg hover:scale-110 active:scale-95"
          title="Đặt lại"
        >
          <RestartAltRoundedIcon />
        </button>
        <button
          onClick={handleZoomIn}
          className="cursor-pointer p-3 bg-grey-c800 hover:bg-grey-c900 rounded-lg transition-all text-white shadow-lg hover:scale-110 active:scale-95"
          title="Phóng to"
        >
          <ZoomInRoundedIcon />
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer p-3 bg-error-c700 hover:bg-error-c800 rounded-lg transition-all text-white shadow-lg hover:scale-110 active:scale-95"
          title="Đóng"
        >
          <CloseRoundedIcon />
        </button>
      </div>

      {/* Scale Indicator */}
      <div className="absolute top-4 left-4 px-4 py-2 bg-grey-c800 text-white rounded-lg shadow-lg text-sm font-medium">
        {Math.round(scale * 100)}%
      </div>

      {/* Image Container */}
      <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto">
        <div
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.2s ease-out',
          }}
          className="origin-center"
        >
          <Image
            src={imageUrl}
            alt={alt}
            width={1200}
            height={800}
            className="max-w-full h-auto rounded-lg shadow-2xl"
            style={{
              maxHeight: '85vh',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-grey-c800 text-white rounded-lg shadow-lg text-sm">
        Click bên ngoài hoặc nhấn ESC để đóng
      </div>
    </div>
  );
}
