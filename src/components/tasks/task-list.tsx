'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TaskItem } from './task-item';
import { cn } from '@/lib/utils/cn';
import type { TaskWithAnchors } from '@/types';

interface TaskListProps {
  tasks: TaskWithAnchors[];
  onToggle: (id: string) => void;
  loading?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggle,
  loading,
  emptyIcon = '🎯',
  emptyTitle = 'No tasks yet',
  emptyMessage = 'Tap the + button to add your first task',
}: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-bg-secondary animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
          <span className="text-2xl">{emptyIcon}</span>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">
          {emptyTitle}
        </h3>
        <p className="text-sm text-text-secondary">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={cn(
              'flex items-center gap-2 w-full py-2 text-sm font-medium text-text-secondary',
              'hover:text-text-primary transition-colors'
            )}
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                showCompleted && 'rotate-180'
              )}
            />
            Completed ({completedTasks.length})
          </button>
          
          {showCompleted && (
            <div className="space-y-2 mt-2">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={onToggle} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
