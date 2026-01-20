'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Inbox, BarChart3, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  href: string;
  label: string;
  icon: typeof ClipboardList;
}

const navItems: NavItem[] = [
  { href: '/today', label: 'Today', icon: ClipboardList },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  onAddClick: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-sm border-t border-border-default safe-area-inset-bottom lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 2).map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
        
        <button
          onClick={onAddClick}
          className={cn(
            'flex items-center justify-center h-12 w-12 -mt-4 rounded-full',
            'bg-brand-primary text-bg-primary shadow-lg shadow-brand-primary/30',
            'hover:bg-brand-primary/90 active:bg-brand-primary/80 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary'
          )}
          aria-label="Add task"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {navItems.slice(2).map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full',
        'transition-colors',
        isActive
          ? 'text-brand-primary'
          : 'text-text-muted hover:text-text-secondary'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{item.label}</span>
    </Link>
  );
}
