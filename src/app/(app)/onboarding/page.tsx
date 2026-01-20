'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ListTodo, Palette, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { useSettings } from '@/hooks/use-settings';
import { useTasks } from '@/hooks/use-tasks';
import { STREAK_THEMES, type StreakTheme } from '@/lib/utils/streak';

type OnboardingStep = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { updateSettings } = useSettings();
  const { createTask } = useTasks();
  
  const [step, setStep] = useState<OnboardingStep>(1);
  const [name, setName] = useState('');
  const [firstTask, setFirstTask] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<StreakTheme>('github');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkip = async () => {
    await updateSettings({ hasCompletedOnboarding: true });
    router.push('/today');
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as OnboardingStep);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (firstTask.trim()) {
        await createTask({ title: firstTask.trim() });
      }
      
      localStorage.setItem('streak-theme', selectedTheme);
      await updateSettings({ 
        hasCompletedOnboarding: true,
        theme: selectedTheme,
      });
      
      router.push('/today');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <div className="flex justify-between items-center p-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-2 w-8 rounded-full transition-colors',
                s <= step ? 'bg-brand-primary' : 'bg-bg-tertiary'
              )}
            />
          ))}
        </div>
        <button
          onClick={handleSkip}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === 1 && (
          <StepOne name={name} setName={setName} onNext={handleNext} />
        )}
        {step === 2 && (
          <StepTwo firstTask={firstTask} setFirstTask={setFirstTask} onNext={handleNext} />
        )}
        {step === 3 && (
          <StepThree
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

interface StepOneProps {
  name: string;
  setName: (name: string) => void;
  onNext: () => void;
}

function StepOne({ name, setName, onNext }: StepOneProps) {
  return (
    <div className="w-full max-w-sm text-center space-y-8">
      <div className="space-y-4">
        <div className="h-20 w-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="h-10 w-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome to TAD
        </h1>
        <p className="text-text-secondary">
          Let&apos;s set you up for success. What should we call you?
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-center"
        />
        <Button
          onClick={onNext}
          className="w-full gap-2"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface StepTwoProps {
  firstTask: string;
  setFirstTask: (task: string) => void;
  onNext: () => void;
}

function StepTwo({ firstTask, setFirstTask, onNext }: StepTwoProps) {
  return (
    <div className="w-full max-w-sm text-center space-y-8">
      <div className="space-y-4">
        <div className="h-20 w-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto">
          <ListTodo className="h-10 w-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">
          Your First Task
        </h1>
        <p className="text-text-secondary">
          What&apos;s one thing you want to actually do today?
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="e.g., Read for 30 minutes"
          value={firstTask}
          onChange={(e) => setFirstTask(e.target.value)}
          className="text-center"
        />
        <Button
          onClick={onNext}
          className="w-full gap-2"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
        <button
          onClick={onNext}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          I&apos;ll add one later
        </button>
      </div>
    </div>
  );
}

interface StepThreeProps {
  selectedTheme: StreakTheme;
  setSelectedTheme: (theme: StreakTheme) => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

function StepThree({ selectedTheme, setSelectedTheme, onComplete, isSubmitting }: StepThreeProps) {
  const themes: { id: StreakTheme; emoji: string }[] = [
    { id: 'github', emoji: '🟢' },
    { id: 'ocean', emoji: '🔵' },
    { id: 'sunset', emoji: '🟠' },
    { id: 'purple', emoji: '🟣' },
  ];

  return (
    <div className="w-full max-w-sm text-center space-y-8">
      <div className="space-y-4">
        <div className="h-20 w-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto">
          <Palette className="h-10 w-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">
          Choose Your Style
        </h1>
        <p className="text-text-secondary">
          Pick a theme for your streak graph. You can change this anytime.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center gap-4">
          {themes.map(({ id, emoji }) => (
            <button
              key={id}
              onClick={() => setSelectedTheme(id)}
              className={cn(
                'h-16 w-16 rounded-xl flex items-center justify-center text-2xl',
                'border-2 transition-all',
                selectedTheme === id
                  ? 'border-brand-primary bg-bg-tertiary scale-110'
                  : 'border-border-default bg-bg-secondary hover:border-border-hover'
              )}
            >
              {emoji}
              {selectedTheme === id && (
                <Check className="absolute h-4 w-4 text-brand-primary bottom-1 right-1" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          {STREAK_THEMES[selectedTheme].name}
        </p>
        <Button
          onClick={onComplete}
          loading={isSubmitting}
          className="w-full gap-2"
        >
          Get Started
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
