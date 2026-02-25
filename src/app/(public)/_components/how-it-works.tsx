"use client";

import { motion } from "motion/react";
import { Wallet, PawPrint, Globe, Gift, Coins, ShieldCheck } from "lucide-react";

const steps = [
  { icon: <Wallet className="h-5 w-5 text-emerald-400" />, title: "Connect", desc: "Sign in or connect wallet (SIWE ready)." },
  { icon: <PawPrint className="h-5 w-5 text-cyan-400" />, title: "Pick Buddy", desc: "Choose your AI mentor and start chatting." },
  { icon: <Globe className="h-5 w-5 text-blue-400" />, title: "Claim ENS", desc: "Reserve your subdomain: username.ayushetty.eth." },
  { icon: <Coins className="h-5 w-5 text-yellow-400" />, title: "Pay-as-you-go", desc: "Micropay per lesson via x402 (simulated)." },
  { icon: <Gift className="h-5 w-5 text-purple-400" />, title: "Earn NFTs", desc: "Collect badges and credentials on progress." },
  { icon: <ShieldCheck className="h-5 w-5 text-teal-400" />, title: "Own It", desc: "Your identity and rewards are portable." },
];

export default function HowItWorks() {
  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl"
        >
          How eth.ed Works
        </motion.h3>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((s, i) => (
            <motion.li
              key={i}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-xl border border-cyan-300/20 bg-gradient-to-br from-blue-900/20 via-teal-800/10 to-emerald-900/10 p-4"
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-300">
                {s.icon}
                {s.title}
              </div>
              <p className="text-slate-400 text-sm">{s.desc}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}