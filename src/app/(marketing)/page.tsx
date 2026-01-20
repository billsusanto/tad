import Link from 'next/link';
import { CheckCircle2, Flame, Tag, Calendar, Sparkles, Heart, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <span className="text-bg-primary font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-text-primary">TAD</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-bg-primary bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-4 py-16 sm:py-24 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Free forever, no credit card required
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight">
            To Actually Do
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
            A humane task manager that celebrates your progress, not your failures. 
            Build consistent habits without the guilt.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-bg-primary bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-text-primary border border-border-default rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              Learn More
            </Link>
          </div>
          
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative rounded-2xl border border-border-default bg-bg-secondary overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-error/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <span className="text-xs text-text-muted">TAD - Today</span>
                </div>
                <div className="space-y-3 text-left">
                  {[
                    { done: true, text: 'Morning workout', tag: 'Health' },
                    { done: true, text: 'Review quarterly report', tag: 'Work' },
                    { done: false, text: 'Read for 30 minutes', tag: 'Learning' },
                  ].map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50">
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${
                        task.done 
                          ? 'bg-brand-primary border-brand-primary' 
                          : 'border-border-default'
                      }`}>
                        {task.done && <CheckCircle2 className="h-3 w-3 text-bg-primary" />}
                      </div>
                      <span className={`flex-1 ${task.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                        {task.text}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-bg-secondary text-text-secondary">
                        {task.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 lg:px-8 bg-bg-secondary">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-4">
              Productivity without the punishment
            </h2>
            <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
              Most apps make you feel guilty when you miss a day. TAD celebrates what you accomplish.
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={CheckCircle2}
                title="Simple Tasks"
                description="Quick add, easy complete. No complex project management."
              />
              <FeatureCard
                icon={Flame}
                title="Flexible Streaks"
                description="Track consistency, not perfection. Grace days built in."
              />
              <FeatureCard
                icon={Tag}
                title="Context Anchors"
                description="Filter tasks by context without location tracking."
              />
              <FeatureCard
                icon={Calendar}
                title="Daily Timeline"
                description="See your day at a glance with the CET view."
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-12">
              Built different
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="p-6 rounded-xl bg-bg-secondary border border-border-default">
                <Heart className="h-8 w-8 text-error mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Humane by Design</h3>
                <p className="text-sm text-text-secondary">
                  No shame. No guilt. Just progress at your pace.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-bg-secondary border border-border-default">
                <Zap className="h-8 w-8 text-warning mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Fast & Focused</h3>
                <p className="text-sm text-text-secondary">
                  No bloat. Just the features you actually need.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-bg-secondary border border-border-default">
                <Sparkles className="h-8 w-8 text-brand-primary mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Celebrate Wins</h3>
                <p className="text-sm text-text-secondary">
                  Watch your streak grow. Feel good about what you do.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-bg-secondary">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Ready to actually do?
            </h2>
            <p className="mt-4 text-text-secondary">
              Join people building better habits with TAD.
            </p>
            <Link
              href="/login"
              className="inline-block mt-8 px-8 py-3 text-base font-medium text-bg-primary bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-4 py-8 sm:px-6 lg:px-8 border-t border-border-default">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-brand-primary flex items-center justify-center">
              <span className="text-bg-primary font-bold text-xs">T</span>
            </div>
            <span>TAD - To Actually Do</span>
          </div>
          <span>Built with consistency, not perfection.</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof CheckCircle2; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-bg-tertiary">
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-primary/10 mb-4">
        <Icon className="h-6 w-6 text-brand-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
