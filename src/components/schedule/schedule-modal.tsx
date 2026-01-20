'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnchorSelector } from '@/components/anchors/anchor-selector';
import { cn } from '@/lib/utils/cn';
import { taskEvents } from '@/lib/events';
import type { Anchor, TaskWithAnchors } from '@/types';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  initialTime?: string;
  anchors: Anchor[];
  anchorsLoading?: boolean;
  existingTask?: TaskWithAnchors | null;
  date: Date;
}

const durationOptions = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
];

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

export function ScheduleModal({
  open,
  onClose,
  initialTime,
  anchors,
  anchorsLoading,
  existingTask,
  date,
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(initialTime || '09:00');
  const [duration, setDuration] = useState(60);
  const [isFixed, setIsFixed] = useState(false);
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!existingTask;

  useEffect(() => {
    if (open) {
      if (existingTask) {
        setTitle(existingTask.title);
        setStartTime(existingTask.scheduledStart || initialTime || '09:00');
        setIsFixed(existingTask.isFixed ?? false);
        setSelectedAnchorIds(existingTask.anchors?.map((a) => a.id) || []);
        
        if (existingTask.scheduledStart && existingTask.scheduledEnd) {
          const [startH, startM] = existingTask.scheduledStart.split(':').map(Number);
          const [endH, endM] = existingTask.scheduledEnd.split(':').map(Number);
          const dur = (endH * 60 + endM) - (startH * 60 + startM);
          setDuration(dur > 0 ? dur : 60);
        }
      } else {
        setTitle('');
        setStartTime(initialTime || '09:00');
        setDuration(60);
        setIsFixed(false);
        setSelectedAnchorIds([]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, existingTask, initialTime]);

  const endTime = addMinutesToTime(startTime, duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        dueDate: date.toISOString(),
        scheduledStart: startTime,
        scheduledEnd: endTime,
        isFixed,
        timeEstimate: duration,
        anchorIds: selectedAnchorIds.length > 0 ? selectedAnchorIds : undefined,
      };

      let response: Response;
      if (isEditing && existingTask) {
        response = await fetch(`/api/tasks/${existingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        resetForm();
        onClose();
        taskEvents.emit();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTask) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        resetForm();
        onClose();
        taskEvents.emit();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnschedule = async () => {
    if (!existingTask) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledStart: null,
          scheduledEnd: null,
          isFixed: false,
        }),
      });

      if (response.ok) {
        resetForm();
        onClose();
        taskEvents.emit();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartTime('09:00');
    setDuration(60);
    setIsFixed(false);
    setSelectedAnchorIds([]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Time Block' : 'Schedule Event'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's happening?"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-bg-tertiary text-text-primary',
                'border border-border-default focus:border-brand-primary',
                'focus:outline-none focus:ring-1 focus:ring-brand-primary',
                'transition-colors'
              )}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">End Time</label>
            <div className="px-3 py-2 rounded-lg text-sm bg-bg-tertiary text-text-secondary border border-border-default">
              {(() => {
                const [h, m] = endTime.split(':').map(Number);
                const period = h >= 12 ? 'PM' : 'AM';
                const hour = h % 12 || 12;
                return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
              })()}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-2">Duration</label>
          <div className="flex flex-wrap gap-1">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  duration === option.value
                    ? 'bg-brand-primary text-bg-primary'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                )}
              >
                <Clock className="h-3 w-3" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsFixed(!isFixed)}
            className={cn(
              'flex items-center gap-2 w-full p-3 rounded-lg transition-colors',
              isFixed
                ? 'bg-amber-500/20 border border-amber-500/50'
                : 'bg-bg-tertiary border border-border-default hover:border-border-hover'
            )}
          >
            <Lock className={cn('h-4 w-4', isFixed ? 'text-amber-500' : 'text-text-muted')} />
            <div className="text-left flex-1">
              <p className={cn('text-sm font-medium', isFixed ? 'text-amber-500' : 'text-text-primary')}>
                Fixed Event (CET)
              </p>
              <p className="text-xs text-text-muted">
                Cannot be moved - meetings, appointments, etc.
              </p>
            </div>
            <div
              className={cn(
                'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                isFixed ? 'bg-amber-500 border-amber-500' : 'border-border-default'
              )}
            >
              {isFixed && (
                <svg
                  className="h-3 w-3 text-bg-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-2">Context</label>
          <AnchorSelector
            anchors={anchors}
            selectedIds={selectedAnchorIds}
            onChange={setSelectedAnchorIds}
            loading={anchorsLoading}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!title.trim()}
              className="flex-1"
            >
              {isEditing ? 'Update' : 'Schedule'}
            </Button>
          </div>
          
          {isEditing && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleUnschedule}
                disabled={loading}
                className="flex-1 text-text-secondary"
              >
                Unschedule
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 text-error"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
