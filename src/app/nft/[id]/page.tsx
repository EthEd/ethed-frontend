import { prisma } from "@/lib/prisma-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, ExternalLink, Calendar, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ipfsToGatewayUrl } from "@/lib/ipfs";
import { getExplorerTxUrl } from "@/lib/contracts";
import Footer from "@/app/(public)/_components/footer";

interface NFTPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NFTPageProps): Promise<Metadata> {
  const { id } = await params;
  const nft = await prisma.nFT.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!nft) return {};

  const title = `${nft.name} | EthEd NFT`;
  const description = `${nft.user?.name || 'A learner'} earned "${nft.name}" on EthEd — verifiable blockchain education credentials.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function NFTPublicPage({ params }: NFTPageProps) {
  const { id } = await params;

  const nft = await prisma.nFT.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  if (!nft) {
    notFound();
  }

  const metadata = nft.metadata && typeof nft.metadata === 'object' ? nft.metadata as Record<string, unknown> : {};
  const description = (metadata.description as string) || `${nft.name} — earned on EthEd`;
  const txHash = (nft as any).transactionHash as string | null;
  const chainId = (nft as any).chainId as number | null;
  const explorerUrl = txHash && chainId && !txHash.startsWith('0x' + '0'.repeat(64))
    ? getExplorerTxUrl(chainId, txHash)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Back */}
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to EthEd</Link>
          </Button>

          {/* NFT Card */}
          <Card className="overflow-hidden border-border">
            <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-primary/10 flex items-center justify-center relative">
              {nft.image ? (
                <Image
                  src={ipfsToGatewayUrl(nft.image)}
                  alt={nft.name}
                  fill
                  sizes="(max-width: 672px) 100vw, 672px"
                  className="object-cover"
                />
              ) : (
                <Award className="h-24 w-24 text-primary/30" />
              )}
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Title & badges */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{nft.name}</h1>
                <p className="text-muted-foreground">{description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {nft.tokenId && (
                    <Badge variant="outline">Token #{nft.tokenId}</Badge>
                  )}
                  <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Shield className="h-3 w-3 mr-1" /> Verified On-Chain
                  </Badge>
                </div>
              </div>

              {/* Owner */}
              {nft.user && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={nft.user.image || undefined} />
                    <AvatarFallback>{nft.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Earned by</p>
                    <Link href={`/profile/${nft.user.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {nft.user.name || 'Anonymous Learner'}
                    </Link>
                  </div>
                </div>
              )}

              {/* On-chain details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">Minted</span>
                    <span className="text-foreground font-medium">
                      {new Date(nft.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {chainId && (
                    <div className="flex justify-between p-3 rounded-lg bg-muted/20">
                      <span className="text-muted-foreground">Network</span>
                      <span className="text-foreground font-medium">Polygon Amoy</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Explorer link */}
              {explorerUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> View on Polygon Explorer
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
