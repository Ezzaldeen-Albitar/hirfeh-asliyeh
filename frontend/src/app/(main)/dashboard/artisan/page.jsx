import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import ArtisanDashboardClient from './ArtisanDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  return (
    <AuthGuard requiredRole="artisan">
      <ArtisanDashboardClient />
    </AuthGuard>
  );
}
