import Link from 'next/link';
import { CheckCircle2, Flame, Tag, Calendar } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <span className="text-2xl font-bold text-text-primary">TAD</span>
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
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 lg:px-8 bg-bg-secondary">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-12">
              Productivity without the punishment
            </h2>
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
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Ready to actually do?
            </h2>
            <p className="mt-4 text-text-secondary">
              Join thousands of people building better habits with TAD.
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
          <span>TAD - To Actually Do</span>
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
