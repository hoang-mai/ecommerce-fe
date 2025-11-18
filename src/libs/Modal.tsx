'use client';

import {ReactNode, useEffect, useState} from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveAsRoundedIcon from '@mui/icons-material/SaveAsRounded';
import Button from './Button';
import {ColorButton} from '@/enum';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saveButtonText?: string;
  cancelButtonText?: string;
  showSaveButton?: boolean;
  showCancelButton?: boolean;
  disableSave?: boolean;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  saveButtonColor?: ColorButton;
  cancelButtonColor?: ColorButton;
  showOnCancel?: boolean;
}

export default function Modal({
                                isOpen,
                                onClose,
                                title,
                                children,
                                onSave,
                                onCancel,
                                saveButtonText = 'Lưu',
                                cancelButtonText = 'Hủy',
                                showSaveButton = true,
                                showCancelButton = true,
                                disableSave = false,
                                isLoading = false,
                                maxWidth = '2xl',
                                saveButtonColor = ColorButton.PRIMARY,
                                cancelButtonColor,
                                showOnCancel
                              }: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsAnimating(true);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  return (
    <div
      className={`fixed inset-0 z-modal flex items-center justify-center p-4 transition-all duration-200 ${
        isAnimating ? 'bg-black/50' : 'bg-black/0'
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl ${maxWidthClass} w-full max-h-[90vh] flex flex-col transition-all duration-200 ${
          isAnimating
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Header with X button */}
        <div
          className="sticky top-0 bg-white border-b-2 border-grey-c200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-primary-c800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-grey-c600 hover:text-grey-c800 transition-colors p-1 hover:bg-grey-c100 rounded-full cursor-pointer"
            disabled={isLoading}
            type="button"
          >
            <CloseRoundedIcon/>
          </button>
        </div>

        {onSave ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }} className="flex-1 flex flex-col min-h-0">
            {/* Content */}
            <div className="overflow-y-auto p-4">
              {children}
            </div>

            {/* Divider before footer */}
            <div className="border-t-2 border-grey-c200"></div>

            {/* Footer with buttons */}
            {(showSaveButton || showCancelButton) && (
              <div className="px-6 py-4 flex gap-4 justify-end">
                {showSaveButton && (
                  <Button
                    type="submit"
                    disabled={isLoading || disableSave}
                    color={saveButtonColor}
                  >
                    <SaveAsRoundedIcon/> {saveButtonText}
                  </Button>
                )}
                {showCancelButton && (
                  <Button
                    type="button"
                    onClick={(showOnCancel ? onCancel : null ) || handleClose}
                    disabled={isLoading}
                    color={cancelButtonColor}
                    className={!cancelButtonColor ? "border-2 border-support-c900 bg-white font-bold text-support-c900" : undefined}
                  >
                    <CloseRoundedIcon/> {cancelButtonText}
                  </Button>
                )}

              </div>
            )}
          </form>
        ) : (
          <>
            {/* Content without form */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Footer with buttons */}
            {(showSaveButton || showCancelButton) && (
              <>
                <div className="border-t-2 border-grey-c200"></div>
                <div className="px-6 py-4 flex gap-4 justify-end">
                  {showSaveButton && (
                    <Button
                      type="button"
                      onClick={onSave}
                      disabled={isLoading}
                      color={saveButtonColor}
                    >
                      <SaveAsRoundedIcon/> {saveButtonText}
                    </Button>
                  )}
                  {showCancelButton && (
                    <Button
                      type="button"
                      onClick={(showOnCancel ? onCancel : null ) || handleClose}
                      disabled={isLoading}
                      color={cancelButtonColor}
                      className={!cancelButtonColor ? "border-2 border-support-c900 bg-white !font-bold !text-support-c900" : undefined}
                    >
                      <CloseRoundedIcon/> {cancelButtonText}
                    </Button>
                  )}

                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
