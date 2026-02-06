import { Metadata } from 'next';
import ProfileClient from "./_components/ProfileClient";

export const metadata: Metadata = {
  title: 'Profile | eth.ed',
  description: 'View your learning profile, courses, and achievements'
};

export default function ProfilePage() {
  return <ProfileClient />;
}