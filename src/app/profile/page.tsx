import ProfilePortfolio from "./_components/ProfilePortfolio";

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params;
  return <ProfilePortfolio handle={handle} />;
}