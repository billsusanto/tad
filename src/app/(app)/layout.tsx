'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { QuickAdd } from '@/components/tasks/quick-add';
import { ToastProvider } from '@/components/ui/toast';
import { useAnchors } from '@/hooks/use-anchors';

function AppLayoutInner({ children }: { children: ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { anchors, loading: anchorsLoading, createDefaultAnchors } = useAnchors();

  useEffect(() => {
    if (!anchorsLoading && anchors.length === 0) {
      createDefaultAnchors();
    }
  }, [anchorsLoading, anchors.length, createDefaultAnchors]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <main className="pb-20 lg:pb-4">
          {children}
        </main>
        <BottomNav onAddClick={() => setQuickAddOpen(true)} />
        <QuickAdd
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          anchors={anchors}
          anchorsLoading={anchorsLoading}
        />
      </div>
    </ToastProvider>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SessionProvider>
  );
}
