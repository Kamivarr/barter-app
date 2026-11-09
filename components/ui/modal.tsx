'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps extends React.ComponentProps<'div'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  ...props
}: ModalProps) {
  // Zamknięcie modala klawiszem Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Tło z efektem rozmycia (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kontener okna modalnego */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all',
          'my-8 animate-in fade-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        {...props}
      >
        {/* Nagłówek modala */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-stone-800">
            <div>
              {title && (
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Zamknij okno"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Ciało modala */}
        <div className="p-5 sm:p-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
