import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma-client';

// Change from 'edge' to 'nodejs' runtime for higher bundle size limits
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        level: true,
        xp: true,
        streak: true,
        image: true,
      },
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #111 0%, transparent 50%), radial-gradient(circle at 75% 75%, #111 0%, transparent 50%)',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '40px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {user.image && (
              <img
                src={user.image}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '60px',
                  marginBottom: '20px',
                  border: '4px solid #3b82f6',
                }}
              />
            )}
            <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              {user.name || 'Anonymous Learner'}
            </h1>
            <div style={{ display: 'flex', gap: '20px', fontSize: '24px', color: '#94a3b8' }}>
              <span>Level {user.level}</span>
              <span>•</span>
              <span>{user.xp} XP</span>
              <span>•</span>
              <span>{user.streak} Day Streak 🔥</span>
            </div>
            <div
              style={{
                marginTop: '30px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              EthEd Pioneer
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '40px', fontSize: '24px', opacity: 0.5 }}>
            ethed.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
