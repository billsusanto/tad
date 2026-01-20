'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { useAnchors } from '@/hooks/use-anchors';
import { Timeline, ScheduleModal, UnscheduledList } from '@/components/schedule';
import { cn } from '@/lib/utils/cn';
import type { TaskWithAnchors } from '@/types';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTime, setInitialTime] = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<TaskWithAnchors | null>(null);

  const { tasks, loading } = useTasks();
  const { anchors, loading: anchorsLoading } = useAnchors();

  const isToday = isSameDay(selectedDate, new Date());

  const dayTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === 'archived') return false;
      
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        return isSameDay(dueDate, selectedDate);
      }
      
      if (task.scheduledStart) {
        return true;
      }
      
      return isToday;
    });
  }, [tasks, selectedDate, isToday]);

  const unscheduledTasks = useMemo(() => {
    return dayTasks.filter(
      (task) => !task.scheduledStart || !task.scheduledEnd
    );
  }, [dayTasks]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleSlotClick = (time: string) => {
    setInitialTime(time);
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleTaskClick = (task: TaskWithAnchors) => {
    setSelectedTask(task);
    setInitialTime(task.scheduledStart || undefined);
    setModalOpen(true);
  };

  const handleScheduleUnscheduled = (task: TaskWithAnchors) => {
    setSelectedTask(task);
    setInitialTime(undefined);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
    setInitialTime(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-bg-primary border-b border-border-default">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className={cn(
              'p-2 rounded-lg',
              'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
              'transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
            )}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-semibold text-text-primary">
              {formatDate(selectedDate)}
            </h1>
            {!isToday && (
              <button
                onClick={handleToday}
                className="text-xs text-brand-primary hover:underline"
              >
                Go to Today
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className={cn(
              'p-2 rounded-lg',
              'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
              'transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
            )}
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="space-y-2 px-4 py-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-4 w-12 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
                <div className="h-12 flex-1 bg-bg-secondary rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 py-4">
            <Timeline
              tasks={dayTasks}
              date={selectedDate}
              startHour={6}
              endHour={22}
              onSlotClick={handleSlotClick}
              onTaskClick={handleTaskClick}
            />
          </div>
        )}
      </div>

      {unscheduledTasks.length > 0 && (
        <div className="border-t border-border-default bg-bg-secondary">
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              Unscheduled ({unscheduledTasks.length})
            </h2>
            <div className="max-h-48 overflow-auto">
              <UnscheduledList
                tasks={unscheduledTasks}
                onSchedule={handleScheduleUnscheduled}
              />
            </div>
          </div>
        </div>
      )}

      <ScheduleModal
        open={modalOpen}
        onClose={handleCloseModal}
        initialTime={initialTime}
        anchors={anchors}
        anchorsLoading={anchorsLoading}
        existingTask={selectedTask}
        date={selectedDate}
      />
    </div>
  );
}
