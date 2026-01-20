'use client';

import { useState, useCallback } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useAnchors } from '@/hooks/use-anchors';
import { useToastActions } from '@/hooks/use-toast';
import { TaskList } from '@/components/tasks/task-list';
import { FilterBar } from '@/components/anchors/filter-bar';
import { isToday } from '@/lib/utils/date';

export default function TodayPage() {
  const { tasks, loading, completeTask } = useTasks();
  const { anchors, loading: anchorsLoading } = useAnchors();
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(null);
  const toast = useToastActions();

  const handleToggle = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const wasCompleted = task?.status === 'completed';
    const result = await completeTask(id);
    if (result) {
      if (!wasCompleted) {
        toast.success('Task completed!');
      }
    } else {
      toast.error('Failed to update task');
    }
  }, [tasks, completeTask, toast]);

  const todayTasks = tasks.filter((task) => {
    if (task.status === 'archived') return false;
    
    if (task.status === 'completed' && !isToday(task.completedAt)) {
      return false;
    }
    
    if (task.dueDate) {
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      const isDueToday =
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate();
      if (!isDueToday) return false;
    }

    if (selectedAnchorId) {
      return task.anchors?.some((a) => a.id === selectedAnchorId);
    }

    return true;
  });

  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">Today</h1>
        <p className="text-sm text-text-secondary mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="mb-4">
        <FilterBar
          anchors={anchors}
          selectedAnchorId={selectedAnchorId}
          onSelect={setSelectedAnchorId}
          loading={anchorsLoading}
        />
      </div>

      <TaskList
        tasks={todayTasks}
        onToggle={handleToggle}
        loading={loading}
        emptyIcon="🌟"
        emptyTitle="Your slate is clean!"
        emptyMessage="No tasks for today. Add something you want to actually do."
      />
    </div>
  );
}
