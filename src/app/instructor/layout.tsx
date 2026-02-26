import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InstructorSidebar } from './InstructorSidebar';

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') {
    redirect('/403');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
