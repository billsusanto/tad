'use client';

import { useMemo, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TimeBlock } from './time-block';
import type { TaskWithAnchors } from '@/types';

interface TimelineProps {
  tasks: TaskWithAnchors[];
  date: Date;
  startHour?: number;
  endHour?: number;
  onSlotClick?: (time: string) => void;
  onTaskClick?: (task: TaskWithAnchors) => void;
}

const HOUR_HEIGHT = 60;

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getCurrentTimePosition(startHour: number): number | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutes = currentHour * 60 + currentMinute;
  const startMinutes = startHour * 60;
  
  if (totalMinutes < startMinutes) return null;
  
  return ((totalMinutes - startMinutes) / 60) * HOUR_HEIGHT;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function CurrentTimeIndicator({ startHour, show }: { startHour: number; show: boolean }) {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !indicatorRef.current) return;

    const updatePosition = () => {
      const pos = getCurrentTimePosition(startHour);
      if (indicatorRef.current) {
        if (pos !== null && pos >= 0) {
          indicatorRef.current.style.top = `${pos}px`;
          indicatorRef.current.style.display = 'block';
        } else {
          indicatorRef.current.style.display = 'none';
        }
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, [startHour, show]);

  if (!show) return null;

  return (
    <div
      ref={indicatorRef}
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ display: 'none' }}
    >
      <div className="flex items-center">
        <div className="w-14 flex justify-end pr-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
        </div>
        <div className="flex-1 h-0.5 bg-red-500" />
      </div>
      <div className="absolute left-14 -top-3 text-xs text-red-500 font-medium">
        NOW
      </div>
    </div>
  );
}

export function Timeline({
  tasks,
  date,
  startHour = 6,
  endHour = 22,
  onSlotClick,
  onTaskClick,
}: TimelineProps) {
  const showCurrentTime = isToday(date);
  
  const hours = useMemo(() => {
    const result = [];
    for (let h = startHour; h <= endHour; h++) {
      result.push(h);
    }
    return result;
  }, [startHour, endHour]);

  const scheduledTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.scheduledStart && t.scheduledEnd && t.status !== 'archived'
    );
  }, [tasks]);

  const getTaskStyle = (task: TaskWithAnchors): React.CSSProperties => {
    if (!task.scheduledStart || !task.scheduledEnd) return {};
    
    const startMinutes = timeToMinutes(task.scheduledStart);
    const endMinutes = timeToMinutes(task.scheduledEnd);
    const dayStartMinutes = startHour * 60;
    
    const top = ((startMinutes - dayStartMinutes) / 60) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;
    
    return {
      top: `${top}px`,
      height: `${Math.max(height - 2, 20)}px`,
    };
  };

  const handleHourClick = (hour: number) => {
    if (onSlotClick) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      onSlotClick(time);
    }
  };

  return (
    <div className="relative">
      {hours.map((hour) => (
        <div
          key={hour}
          className="relative flex border-t border-border-default"
          style={{ height: `${HOUR_HEIGHT}px` }}
        >
          <div className="w-14 flex-shrink-0 pr-2 -mt-2.5">
            <span className="text-xs text-text-muted">{formatHour(hour)}</span>
          </div>
          <button
            onClick={() => handleHourClick(hour)}
            className={cn(
              'flex-1 relative group',
              'hover:bg-bg-tertiary/50 transition-colors',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand-primary'
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </div>
            </div>
          </button>
        </div>
      ))}

      {scheduledTasks.map((task) => (
        <TimeBlock
          key={task.id}
          task={task}
          startTime={task.scheduledStart!}
          endTime={task.scheduledEnd!}
          isFixed={task.isFixed ?? false}
          onClick={() => onTaskClick?.(task)}
          style={getTaskStyle(task)}
        />
      ))}

      <CurrentTimeIndicator startHour={startHour} show={showCurrentTime} />
    </div>
  );
}
