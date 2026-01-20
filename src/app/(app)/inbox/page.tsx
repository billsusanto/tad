'use client';

import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { useAnchors } from '@/hooks/use-anchors';
import { TaskList } from '@/components/tasks/task-list';
import { FilterBar } from '@/components/anchors/filter-bar';

export default function InboxPage() {
  const { tasks, loading, completeTask } = useTasks();
  const { anchors, loading: anchorsLoading } = useAnchors();
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(null);

  const inboxTasks = tasks.filter((task) => {
    if (task.dueDate) return false;
    if (task.status === 'archived') return false;

    if (selectedAnchorId) {
      return task.anchors?.some((a) => a.id === selectedAnchorId);
    }

    return true;
  });

  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-6 w-6 text-text-secondary" />
          <h1 className="text-2xl font-bold text-text-primary">Inbox</h1>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Tasks without a due date
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
        tasks={inboxTasks}
        onToggle={completeTask}
        loading={loading}
        emptyIcon="📥"
        emptyTitle="Inbox is empty"
        emptyMessage="Tasks without due dates will appear here"
      />
    </div>
  );
}
