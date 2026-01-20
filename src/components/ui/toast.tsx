'use client';

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'border-success/30 bg-success/10',
    error: 'border-error/30 bg-error/10',
    info: 'border-info/30 bg-info/10',
  };

  const iconColors = {
    success: 'text-success',
    error: 'text-error',
    info: 'text-info',
  };

  const Icon = icons[toast.type];

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto max-w-sm w-full mx-auto p-3 rounded-lg border shadow-lg backdrop-blur-sm',
        'flex items-center gap-3',
        'transition-all duration-200',
        colors[toast.type],
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', iconColors[toast.type])} />
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
