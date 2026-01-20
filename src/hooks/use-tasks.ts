'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TaskWithAnchors, CreateTaskInput, UpdateTaskInput } from '@/types';
import { taskEvents } from '@/lib/events';

interface UseTasksReturn {
  tasks: TaskWithAnchors[];
  loading: boolean;
  error: string | null;
  createTask: (input: CreateTaskInput) => Promise<TaskWithAnchors | null>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<TaskWithAnchors | null>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<TaskWithAnchors | null>;
  refetch: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<TaskWithAnchors[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const unsubscribe = taskEvents.subscribe(fetchTasks);
    return unsubscribe;
  }, [fetchTasks]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<TaskWithAnchors | null> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      const task = await response.json();
      setTasks((prev) => [task, ...prev]);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput): Promise<TaskWithAnchors | null> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const task = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)));
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  }, []);

  const completeTask = useCallback(async (id: string): Promise<TaskWithAnchors | null> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return updateTask(id, { 
      status: newStatus,
    });
  }, [tasks, updateTask]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refetch: fetchTasks,
  };
}
