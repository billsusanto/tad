'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Anchor } from '@/types';

interface CreateAnchorInput {
  name: string;
  icon?: string;
  color?: string;
}

interface UpdateAnchorInput {
  name?: string;
  icon?: string;
  color?: string;
}

interface UseAnchorsReturn {
  anchors: Anchor[];
  loading: boolean;
  error: string | null;
  createAnchor: (input: CreateAnchorInput) => Promise<Anchor | null>;
  updateAnchor: (id: string, input: UpdateAnchorInput) => Promise<Anchor | null>;
  deleteAnchor: (id: string) => Promise<boolean>;
  createDefaultAnchors: () => Promise<Anchor[]>;
  refetch: () => Promise<void>;
}

export function useAnchors(): UseAnchorsReturn {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnchors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/anchors');
      if (!response.ok) {
        throw new Error('Failed to fetch anchors');
      }
      const data = await response.json();
      setAnchors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch anchors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnchors();
  }, [fetchAnchors]);

  const createAnchor = useCallback(async (input: CreateAnchorInput): Promise<Anchor | null> => {
    try {
      const response = await fetch('/api/anchors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to create anchor');
      }
      const anchor = await response.json();
      setAnchors((prev) => [...prev, anchor]);
      return anchor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create anchor');
      return null;
    }
  }, []);

  const updateAnchor = useCallback(async (id: string, input: UpdateAnchorInput): Promise<Anchor | null> => {
    try {
      const response = await fetch(`/api/anchors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to update anchor');
      }
      const anchor = await response.json();
      setAnchors((prev) => prev.map((a) => (a.id === id ? anchor : a)));
      return anchor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update anchor');
      return null;
    }
  }, []);

  const deleteAnchor = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/anchors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete anchor');
      }
      setAnchors((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete anchor');
      return false;
    }
  }, []);

  const createDefaultAnchors = useCallback(async (): Promise<Anchor[]> => {
    try {
      const response = await fetch('/api/anchors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createDefaults: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to create default anchors');
      }
      const newAnchors = await response.json();
      if (newAnchors.length > 0) {
        setAnchors((prev) => [...prev, ...newAnchors]);
      }
      return newAnchors;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create default anchors');
      return [];
    }
  }, []);

  return {
    anchors,
    loading,
    error,
    createAnchor,
    updateAnchor,
    deleteAnchor,
    createDefaultAnchors,
    refetch: fetchAnchors,
  };
}
