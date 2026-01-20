'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full bg-transparent p-0"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          ref={contentRef}
          role="document"
          className={cn(
            'relative w-full sm:max-w-md bg-bg-secondary rounded-t-2xl sm:rounded-2xl shadow-xl',
            'animate-in fade-in-0 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
            'max-h-[90vh] overflow-hidden flex flex-col',
            className
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}
