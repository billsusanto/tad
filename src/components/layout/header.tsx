'use client';

import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border-default safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <button
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors lg:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-text-primary">TAD</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          
          {user && (
            <Link
              href="/profile"
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-full',
                'bg-bg-tertiary text-text-secondary hover:bg-border-default transition-colors',
                'overflow-hidden'
              )}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
