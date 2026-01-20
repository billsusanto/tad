import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import LandingPage from './(marketing)/page';

export default async function RootPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/today');
  }

  return <LandingPage />;
}
