'use client';

import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/tasks/task-list';

export default function TodayPage() {
  const { tasks, loading, completeTask } = useTasks();

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return true;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    );
  });

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Today</h1>
        <p className="text-sm text-text-secondary mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <TaskList
        tasks={todayTasks}
        onToggle={completeTask}
        loading={loading}
      />
    </div>
  );
}
