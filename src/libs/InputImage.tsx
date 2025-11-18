'use client';

import {useState, useRef} from 'react';
import Image from 'next/image';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';

interface InputImageProps {
  id?: string;
  label?: string;
  value?: string | File | (File | string)[] | null;
  onChange?: (file: string | File | (File | string)[] | null) => void;
  onRemove?: (indexOrId: number | string) => void; // New prop for custom remove handling
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  maxSize?: number; // MB
  acceptedFormats?: string[];
  preview?: boolean;
  previewWidth?: number;
  previewHeight?: number;
  multiple?: boolean; // New prop for multiple images
  maxFiles?: number; // Maximum number of files
}

export default function InputImage({
                                     id = 'image-upload',
                                     label,
                                     value,
                                     onChange,
                                     onRemove,
                                     disabled = false,
                                     error = '',
                                     required = false,
                                     className = '',
                                     maxSize = 3, // 3MB default
                                     acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                                     preview = true,
                                     previewWidth = 200,
                                     previewHeight = 200,
                                     multiple = false,
                                     maxFiles = 10,
                                   }: InputImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get preview URLs from value
  const getPreviewUrls = (): string[] => {
    if (multiple && Array.isArray(value)) {
      return value.map(file => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        } else return file;

      }).filter(Boolean);
    } else if (!multiple && value) {
      if (value instanceof File) {
        return [URL.createObjectURL(value)];
      } else if (typeof value === 'string') {
        return [value];
      }
    }
    return [];
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      validFiles.push(file);

      // If not multiple, only take the first valid file
      if (!multiple) break;
    }

    if (onChange) {
      if (multiple) {
        // Keep both existing Files and URLs (strings)
        const existingValues = Array.isArray(value) ? value : [];
        const combinedFiles = [...existingValues, ...validFiles].slice(0, maxFiles);
        onChange(combinedFiles);
      } else {
        onChange(validFiles[0]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    handleFileChange(e.dataTransfer.files);
  };

  const handleRemove = (index?: number) => {
    if (multiple && Array.isArray(value) && typeof index === 'number') {
      // Call custom onRemove if provided (for strings/URLs)
      const itemToRemove = value[index];
      if (onRemove && typeof itemToRemove === 'string') {
        onRemove(itemToRemove);
        return;
      }

      // Default remove behavior - keep both Files and strings (URLs)
      const filteredValues: (File | string)[] = value.filter((_, i) => i !== index);
      if (onChange) {
        onChange(filteredValues.length > 0 ? filteredValues : null);
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onChange) {
        onChange(null);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const previewUrls = getPreviewUrls();

  return (
    <div className={`relative flex flex-col gap-2 w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-bold transition-all ${
            disabled ? 'text-grey-c500' : error ? 'text-support-c900' : 'text-primary-c700'
          }`}
        >
          {label}
          {required && <span className="text-support-c800"> *</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
          ${disabled ? 'bg-grey-c50 cursor-not-allowed border-grey-c300' : ''}
          ${error ? 'border-support-c500 bg-support-c50 hover:border-support-c700' : ''}
          ${!error && !disabled ? 'border-primary-c300 hover:border-primary-c500 hover:bg-primary-c50' : ''}
          ${isDragging ? 'border-primary-c700 bg-primary-c100' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          multiple={multiple}
          className="hidden"
        />

        {previewUrls.length > 0 && preview ? (
          // Preview Images
          <div className="flex flex-col gap-4">
            <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'justify-center'}`}>
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative rounded-lg overflow-hidden border-2 border-grey-c200"
                       style={{width: multiple ? '100%' : previewWidth, height: multiple ? 150 : previewHeight}}>
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(multiple ? index : undefined);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-support-c700 hover:bg-support-c900 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <DeleteRoundedIcon fontSize="small"/>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {multiple && previewUrls.length < maxFiles && !disabled && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="px-4 py-2 bg-primary-c700 hover:bg-primary-c900 text-white rounded-lg transition-colors font-semibold"
                >
                  <CloudUploadRoundedIcon className="mr-2" fontSize="small"/>
                  Thêm ảnh ({previewUrls.length}/{maxFiles})
                </button>
              </div>
            )}
          </div>
        ) : (
          // Upload Prompt
          <div className="flex flex-col items-center gap-3 text-center">
            {isDragging ? (
              <CloudUploadRoundedIcon className="text-primary-c700" style={{fontSize: 64}}/>
            ) : (
              <ImageRoundedIcon className={`${disabled ? 'text-grey-c400' : 'text-primary-c500'}`}
                                style={{fontSize: 64}}/>
            )}

            <div>
              <p className={`font-semibold ${disabled ? 'text-grey-c500' : 'text-grey-c800'}`}>
                {isDragging ? 'Thả ảnh vào đây' : `Kéo thả ảnh vào đây hoặc click để chọn${multiple ? ' (nhiều ảnh)' : ''}`}
              </p>
              <p className="text-sm text-grey-c600 mt-1">
                Định dạng: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
              </p>
              <p className="text-sm text-grey-c600">
                Kích thước tối đa: {maxSize}MB{multiple ? ` | Tối đa ${maxFiles} ảnh` : ''}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              disabled
                ? 'bg-grey-c200 text-grey-c500'
                : 'bg-primary-c700 text-white hover:bg-primary-c900'
            }`}>
              <CloudUploadRoundedIcon className="mr-2" fontSize="small"/>
              Chọn ảnh
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <span className="text-sm text-support-c900 ml-2">{error}</span>}
    </div>
  );
}
