import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Defence-in-depth: middleware already guards this, but double-check server-side
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/403');

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
