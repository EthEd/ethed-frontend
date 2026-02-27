import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 backdrop-blur-md py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            EthEd
          </Link>
          <p className="text-muted-foreground max-w-sm">
            Blockchain education made interactive, verifiable, and rewarding. 
            Master Web3 concepts through immersive learning and NFT rewards.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-foreground font-semibold">Platform</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/learn" className="text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            <Link href="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</Link>
            <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How it Works</Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h3 className="text-foreground font-semibold">Legal</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/donate" className="text-muted-foreground hover:text-emerald-500 transition-colors">Donate</Link>
            <div className="flex space-x-4 pt-2">
              <Link href="https://github.com/ethed" target="_blank" rel="noopener noreferrer" aria-label="EthEd on GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com/ethed" target="_blank" rel="noopener noreferrer" aria-label="EthEd on Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </nav>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} EthEd. Built for the decentralized future.
      </div>
    </footer>
  );
}
