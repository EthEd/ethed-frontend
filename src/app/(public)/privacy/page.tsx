import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-4xl">
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Privacy Policy
          </CardTitle>
          <p className="text-slate-400">Last updated: February 19, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, connect your wallet, or participate in our learning modules. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Public wallet addresses (Ethereum/Polygon)</li>
              <li>Email addresses (if provided via social login)</li>
              <li>On-chain interaction data (NFT mints, ENS registrations)</li>
              <li>Learning progress and quiz scores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Track your learning progress and issue NFT rewards</li>
              <li>Communicate with you about updates and new features</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information. However, please remember that no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. Since many interactions are stored on the blockchain, please note that on-chain data is permanent and cannot be deleted by us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@ethed.app.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
