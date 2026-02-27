import type { Metadata } from 'next';
import { Globe, Users, Brain, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About | EthEd',
  description: 'EthEd is a Web3 education platform making blockchain learning accessible, interactive, and rewarding.',
  openGraph: {
    title: 'About EthEd',
    description: 'Making blockchain learning accessible, interactive, and rewarding.',
  },
};

const AboutPage = () => {
  return (
    <div className="bg-slate-950 text-white">
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <Image
          src="/og-image.png"
          alt="Background"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center opacity-20"
          layout="fill"
        />
        <div
          className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#00ff87] to-[#60efff] opacity-20"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div
          className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
          aria-hidden="true"
        >
          <div
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#00ff87] to-[#60efff] opacity-20"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">About EthEd</h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              EthEd is a decentralized learning platform designed to empower the next generation of blockchain developers and enthusiasts. We believe education should be accessible, verifiable, and rewarding.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-8">
            <div className="flex gap-x-4 rounded-xl bg-slate-900/80 p-6 ring-1 ring-inset ring-white/10">
              <Globe className="h-7 w-5 flex-none text-cyan-400" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-white">Verifiable Credentials</h3>
                <p className="mt-2 text-slate-400">
                  Every course you complete, every skill you master, is recorded on-chain as an NFT. Your achievements are your own, forever.
                </p>
              </div>
            </div>
            <div className="flex gap-x-4 rounded-xl bg-slate-900/80 p-6 ring-1 ring-inset ring-white/10">
              <Users className="h-7 w-5 flex-none text-cyan-400" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-white">Community Owned</h3>
                <p className="mt-2 text-slate-400">
                  EthEd is built on decentralized principles. Your data, your identity, and your learning path are controlled by you.
                </p>
              </div>
            </div>
            <div className="flex gap-x-4 rounded-xl bg-slate-900/80 p-6 ring-1 ring-inset ring-white/10">
              <Brain className="h-7 w-5 flex-none text-cyan-400" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-white">AI-Powered Learning</h3>
                <p className="mt-2 text-slate-400">
                  Our AI tutor provides personalized feedback, guidance, and support, helping you learn faster and more effectively.
                </p>
              </div>
            </div>
            <div className="flex gap-x-4 rounded-xl bg-slate-900/80 p-6 ring-1 ring-inset ring-white/10">
              <Target className="h-7 w-5 flex-none text-cyan-400" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-white">Mission-Driven</h3>
                <p className="mt-2 text-slate-400">
                  Our mission is to onboard millions of users to Web3 by providing a clear, engaging, and rewarding educational experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Join a community of learners, builders, and innovators.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/onboarding">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="link" className="text-white">
              <Link href="/learn">
                Browse Courses <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
