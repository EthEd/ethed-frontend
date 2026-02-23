import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | eth.ed',
  description: 'View your learning profile, courses, and achievements'
};

/**
 * /profile now redirects to /dashboard (unified experience).
 * The public-facing third-party portfolio view remains at /profile/[id].
 */
export default function ProfilePage() {
  redirect('/dashboard');
}