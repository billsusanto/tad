'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useAnchors } from '@/hooks/use-anchors';
import { useSettings } from '@/hooks/use-settings';
import { useToastActions } from '@/hooks/use-toast';
import { STREAK_THEMES, type StreakTheme } from '@/lib/utils/streak';
import { cn } from '@/lib/utils/cn';
import type { Anchor } from '@/types';

const ANCHOR_ICONS = ['🏠', '💼', '🏃', '📚', '🎯', '🎨', '🎮', '🧘', '🍳', '🛒'];
const ANCHOR_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { settings, loading: settingsLoading, error: settingsError, updateSettings, refetch: refetchSettings } = useSettings();
  const { anchors, loading: anchorsLoading, error: anchorsError, createAnchor, updateAnchor, deleteAnchor, refetch: refetchAnchors } = useAnchors();
  const toast = useToastActions();

  const [editingAnchor, setEditingAnchor] = useState<Anchor | null>(null);
  const [isCreatingAnchor, setIsCreatingAnchor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loading = status === 'loading' || settingsLoading || anchorsLoading;
  const error = settingsError || anchorsError;

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refetchSettings();
          refetchAnchors();
        }}
      />
    );
  }

  const handleThemeChange = async (theme: StreakTheme) => {
    localStorage.setItem('streak-theme', theme);
    await updateSettings({ theme });
    toast.success('Theme updated');
  };

  const handleWeeklyGoalChange = async (goal: number) => {
    await updateSettings({ weeklyGoal: goal });
    toast.success('Weekly goal updated');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSaveAnchor = async (anchor: { name: string; icon: string; color: string }, id?: string) => {
    if (id) {
      const result = await updateAnchor(id, anchor);
      if (result) {
        toast.success('Anchor updated');
        setEditingAnchor(null);
      } else {
        toast.error('Failed to update anchor');
      }
    } else {
      const result = await createAnchor(anchor);
      if (result) {
        toast.success('Anchor created');
        setIsCreatingAnchor(false);
      } else {
        toast.error('Failed to create anchor');
      }
    }
  };

  const handleDeleteAnchor = async (id: string) => {
    const result = await deleteAnchor(id);
    if (result) {
      toast.success('Anchor deleted');
      setDeleteConfirm(null);
    } else {
      toast.error('Failed to delete anchor');
    }
  };

  const joinedDate = session?.user ? 'January 2025' : '';

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>

      <div className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl border border-border-default">
        <div className="h-14 w-14 rounded-full bg-bg-tertiary flex items-center justify-center">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-text-secondary" />
          )}
        </div>
        <div>
          <p className="font-medium text-text-primary">
            {session?.user?.name || session?.user?.email || 'User'}
          </p>
          <p className="text-sm text-text-secondary">
            {session?.user?.email}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Joined {joinedDate}
          </p>
        </div>
      </div>

      <section className="p-4 bg-bg-secondary rounded-xl border border-border-default">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Streak Theme
        </h2>
        <div className="flex gap-3">
          {(Object.keys(STREAK_THEMES) as StreakTheme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={cn(
                'h-10 w-10 rounded-lg transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                settings?.theme === theme
                  ? 'ring-2 ring-brand-primary scale-110'
                  : 'hover:scale-105'
              )}
              style={{ backgroundColor: STREAK_THEMES[theme].color }}
              title={STREAK_THEMES[theme].name}
              aria-label={`Select ${STREAK_THEMES[theme].name} theme`}
            />
          ))}
        </div>
      </section>

      <section className="p-4 bg-bg-secondary rounded-xl border border-border-default">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Weekly Goal
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Complete tasks on</span>
          <select
            value={settings?.weeklyGoal || 5}
            onChange={(e) => handleWeeklyGoalChange(Number(e.target.value))}
            className="bg-bg-tertiary text-text-primary border border-border-default rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {[3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-sm text-text-secondary">days per week</span>
        </div>
      </section>

      <section className="p-4 bg-bg-secondary rounded-xl border border-border-default">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Anchors
          </h2>
          <button
            onClick={() => setIsCreatingAnchor(true)}
            className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {anchors.map((anchor) => (
            <div
              key={anchor.id}
              className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{anchor.icon}</span>
                <span className="text-sm font-medium text-text-primary">{anchor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingAnchor(anchor)}
                  className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  aria-label={`Edit ${anchor.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(anchor.id)}
                  className="p-1.5 rounded-md text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
                  aria-label={`Delete ${anchor.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {anchors.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              No anchors yet. Add one to organize your tasks!
            </p>
          )}
        </div>
      </section>

      <section className="p-4 bg-bg-secondary rounded-xl border border-border-default">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Notifications
        </h2>
        <p className="text-sm text-text-secondary">
          Notification settings coming soon...
        </p>
      </section>

      <Button
        variant="danger"
        className="w-full gap-2"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>

      <AnchorModal
        open={!!editingAnchor || isCreatingAnchor}
        onClose={() => {
          setEditingAnchor(null);
          setIsCreatingAnchor(false);
        }}
        anchor={editingAnchor}
        onSave={handleSaveAnchor}
      />

      <DeleteConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteAnchor(deleteConfirm)}
      />
    </div>
  );
}

interface AnchorModalProps {
  open: boolean;
  onClose: () => void;
  anchor: Anchor | null;
  onSave: (data: { name: string; icon: string; color: string }, id?: string) => void;
}

function AnchorModal({ open, onClose, anchor, onSave }: AnchorModalProps) {
  const [name, setName] = useState(anchor?.name || '');
  const [icon, setIcon] = useState(anchor?.icon || '🏠');
  const [color, setColor] = useState(anchor?.color || '#22c55e');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), icon, color }, anchor?.id);
    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={anchor ? 'Edit Anchor' : 'Create Anchor'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Home"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {ANCHOR_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center text-lg',
                  'border transition-all',
                  icon === i
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border-default bg-bg-tertiary hover:border-border-hover'
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {ANCHOR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'h-8 w-8 rounded-full transition-all',
                  color === c ? 'ring-2 ring-offset-2 ring-offset-bg-secondary ring-brand-primary' : ''
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={saving}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ open, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete Anchor">
      <div className="space-y-4">
        <p className="text-text-secondary">
          Are you sure you want to delete this anchor? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={deleting}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
