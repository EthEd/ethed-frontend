import {
  Sparkles,
  Database,
  Award,
  GraduationCap,
  UserPlus,
  LockKeyhole,
} from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
    title: 'Smart Tutoring',
    desc: 'Personal AI guidance tracks your learning, helps you through complex topics, and suggests your next lesson.',
  },
  {
    icon: <Database className="h-6 w-6 text-cyan-400" />,
    title: 'Verifiable Rewards',
    desc: 'Earn NFT badges, points, and certificates—instantly accessible and verifiable on-chain.',
  },
  {
    icon: <Award className="h-6 w-6 text-blue-400" />,
    title: 'Professional Profile',
    desc: 'Your ENS identity stores your learning history and achievements as digital credentials.',
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-blue-400" />,
    title: 'Focused Courses',
    desc: 'Bite-sized modules designed for the Ethereum ecosystem, from EIPs to Protocol basics.',
  },
  {
    icon: <UserPlus className="h-6 w-6 text-cyan-500" />,
    title: 'Seamless Onboarding',
    desc: 'Get started in seconds with social login. We provision your Web3 identity automatically.',
  },
  {
    icon: <LockKeyhole className="h-6 w-6 text-cyan-500" />,
    title: 'Owned Progress',
    desc: 'Your learning data is linked to your ENS name, putting you in control of your digital reputation.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: 'spring' as const, // Use string instead of number
      stiffness: 76, 
      damping: 17 
    }
  },
  hover: {
    scale: 1.04,
    boxShadow: '0 4px 40px 0 #38bdf833, 0 2px 10px #0e74902e',
    transition: { type: 'spring'as const, stiffness: 140, damping: 12 },
  },
};

const iconPulse = {
  rest: { scale: 1, filter: 'drop-shadow(0 0 0 #5eead4)' },
  hover: { scale: 1.12, filter: 'drop-shadow(0 0 16px #22d3ee)', transition: { yoyo: 2, duration: 0.35 } },
};

export default function EthEdFeatures() {
  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', duration: 0.7 }}
            className="relative z-10"
          >
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Built for <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Web3 Learners</span>
            </h3>
            <p className="font-geist text-slate-400 mt-3 text-lg">
              EthEd combines on-chain rewards, AI support, and ENS identity to help everyone master blockchain—securely and transparently.
            </p>
          </motion.div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(122deg,rgba(36,180,231,0.15) 20%,rgba(52,217,196,0.16) 50%,rgba(36,180,231,0.08) 100%)',
            }}
          ></div>
        </div>
        <hr className="bg-cyan-300/30 mx-auto mt-5 h-px w-1/2" />
        <motion.ul
          className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.13 }}
        >
          {features.map((item, idx) => (
            <motion.li
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              initial="hidden"
              animate="visible"
              className="relative p-6 rounded-2xl border border-cyan-400/20 bg-slate-950/60 shadow-lg shadow-cyan-500/5 hover:border-cyan-400/40 hover:shadow-cyan-glow transition-all duration-300 backdrop-blur-sm group"
              style={{ cursor: 'pointer' }}
            >
              <motion.div
                variants={iconPulse}
                initial="rest"
                whileHover="hover"
                className="w-12 h-12 mb-6 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 transition-colors"
              >
                {item.icon}
              </motion.div>
              <h4 className="text-xl font-semibold text-white mb-2">
                {item.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
