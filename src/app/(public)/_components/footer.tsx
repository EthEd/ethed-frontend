import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-md py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            EthEd
          </Link>
          <p className="text-slate-400 max-w-sm">
            Blockchain education made interactive, verifiable, and rewarding. 
            Master Web3 concepts through immersive learning and NFT rewards.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-semibold">Platform</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/learn" className="text-slate-400 hover:text-cyan-400 transition-colors">Courses</Link>
            <Link href="/how-it-works" className="text-slate-400 hover:text-cyan-400 transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-slate-400 hover:text-cyan-400 transition-colors">Pricing</Link>
            <Link href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">About Us</Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-semibold">Legal</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms of Service</Link>
            <div className="flex space-x-4 pt-2">
              <Link href="https://github.com/ethed" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com/ethed" target="_blank" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </nav>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-slate-900 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} EthEd. Built for the decentralized future.
      </div>
    </footer>
  );
}
