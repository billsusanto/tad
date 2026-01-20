'use client';

import { useCallback } from 'react';
import { useToast as useToastContext } from '@/components/ui/toast';

export function useToastActions() {
  const { addToast } = useToastContext();

  const success = useCallback((message: string) => {
    addToast('success', message);
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast('error', message);
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast('info', message);
  }, [addToast]);

  return { success, error, info };
}

export { useToast } from '@/components/ui/toast';
