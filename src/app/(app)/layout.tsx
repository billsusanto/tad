'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { QuickAdd } from '@/components/tasks/quick-add';
import { useAnchors } from '@/hooks/use-anchors';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { anchors, loading: anchorsLoading, createDefaultAnchors } = useAnchors();

  useEffect(() => {
    if (!anchorsLoading && anchors.length === 0) {
      createDefaultAnchors();
    }
  }, [anchorsLoading, anchors.length, createDefaultAnchors]);

  return (
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
  );
}
