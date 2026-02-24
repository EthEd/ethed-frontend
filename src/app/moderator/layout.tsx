import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ModeratorSidebar } from './ModeratorSidebar';

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
    redirect('/403');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <ModeratorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
