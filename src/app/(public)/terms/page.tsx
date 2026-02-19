import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-4xl">
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Terms of Service
          </CardTitle>
          <p className="text-slate-400">Last updated: February 19, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using EthEd, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Use License</h2>
            <p>
              Permission is granted to temporarily use the materials on EthEd for personal, non-commercial transitory learning purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Blockchain Interactions</h2>
            <p>
              EthEd facilitates interactions with the Polygon blockchain. You are responsible for any gas fees associated with on-chain transactions unless stated otherwise. We are not responsible for any losses resulting from blockchain network issues or wallet misconfigurations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. NFTs and Digital Assets</h2>
            <p>
              NFTs earned on EthEd are for educational recognition and personal collection. They do not represent financial investments or equity in EthEd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Disclaimer</h2>
            <p>
              The materials on EthEd are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which EthEd operates.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
