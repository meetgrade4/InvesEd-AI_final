import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, BarChart2, TrendingUp, Brain, Trophy, Zap,
  ArrowRight, Play, CheckCircle2, Award, ChevronDown
} from 'lucide-react';

const letters = 'InvesEd AI'.split('');

const stats = [
  { value: 50, label: 'NSE Stocks', suffix: '+' },
  { value: 20, label: 'Mutual Funds', suffix: '' },
  { value: 20, label: 'Crisis Scenarios', suffix: '+' },
];

const features = [
  {
    icon: BookOpen,
    title: 'Academy & Certification',
    desc: '6 course modules with Coursera co-branding',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: BarChart2,
    title: 'Virtual Simulator',
    desc: '₹1,00,000 virtual capital. Real NSE/BSE prices.',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: TrendingUp,
    title: 'SIP Simulator',
    desc: 'Set up virtual SIPs and watch compounding happen',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Zap,
    title: 'Crisis Rounds',
    desc: 'Political fallout, recession, war — test your thinking',
    color: 'bg-red-100 text-red-700',
  },
  {
    icon: Brain,
    title: 'AI Coach',
    desc: 'Powered by Claude. Watches every trade and flags mistakes',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    desc: 'Rank by portfolio, learning depth, and decision quality',
    color: 'bg-cyan-100 text-cyan-700',
  },
];

const steps = [
  { num: '01', title: 'Complete the Academy', desc: 'Learn through 6 structured modules with quizzes & calculators' },
  { num: '02', title: 'Unlock the Simulator', desc: 'Trade virtual ₹1,00,000 across stocks, MFs, and SIPs' },
  { num: '03', title: 'Learn from AI Coach', desc: 'Get personalised feedback on every trade decision you make' },
];

function CountUp({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 brand-gradient opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        {/* Glowing radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/50 text-2xl"
              style={{
                left: `${15 + (i * 15)}%`,
                top: `${20 + (i * 10)}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            >
              {['₹', '📈', '📊', '🚀', '💡', '🏦'][i]}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center z-10 w-full">
          {/* Animated logo text */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-2xl"
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex">
                {letters.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: i * 0.05 + 0.3, duration: 0.5, type: "spring" }}
                    className={`text-4xl sm:text-6xl font-black text-white drop-shadow-md ${letter === ' ' ? 'mr-3' : ''}`}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
            className="inline-block px-5 py-2 rounded-full bg-white/20 border border-white/30 text-white font-semibold text-sm mb-6 shadow-lg backdrop-blur-sm"
          >
            InvestSim for Teens
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl font-medium text-white/90 max-w-3xl mx-auto leading-relaxed mb-10 text-balance"
          >
            India's first AI-powered investment learning platform for teens. <br className="hidden sm:block" />
            <span className="text-white font-bold drop-shadow-sm">Virtual money. Real markets. Real knowledge.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl text-lg shadow-xl transition-all flex items-center gap-2 justify-center w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl text-lg border border-white/30 transition-all flex items-center gap-2 justify-center w-full sm:w-auto backdrop-blur-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Demo
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="bg-card dark:bg-card border-b border-border relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent w-[200%]"
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-4 text-center relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              <div className="text-3xl sm:text-5xl font-black text-gradient drop-shadow-sm">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm sm:text-base text-muted-foreground font-bold mt-2 uppercase tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-black text-primary mb-4 tracking-tight">Everything You Need to Invest Smart</h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">6 powerful features built for Indian teens learning to invest</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                y: -8, 
                boxShadow: '0 20px 40px rgba(30,58,95,0.15)',
              }}
              className="bg-card dark:bg-card rounded-3xl p-8 border border-border shadow-sm transition-all group relative overflow-hidden"
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-muted/30 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-5xl font-black text-primary mb-4 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg sm:text-xl">From zero to investor in three steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative z-10"
              >
                {i < 2 && (
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.2), duration: 0.8 }}
                    className="hidden md:block absolute top-10 left-[calc(50%+48px)] right-[-calc(50%-48px)] h-1 bg-gradient-to-r from-primary to-secondary origin-left rounded-full" 
                  />
                )}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 rounded-3xl brand-gradient flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl relative z-20"
                >
                  {step.num}
                </motion.div>
                <h3 className="font-bold text-2xl mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-base max-w-xs mx-auto leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate showcase */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          className="bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] p-10 sm:p-16 text-white text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" 
          />
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-28 h-28 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm shadow-xl"
              >
                <Award className="w-14 h-14 text-white drop-shadow-md" />
              </motion.div>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-5 tracking-tight drop-shadow-sm">InvesEd x Coursera Certificate</h2>
            <p className="text-white/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Complete all 6 modules and earn a verifiable certificate. Shareable. LinkedIn-ready. Proof you know investing.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['Shareable', 'Verifiable', 'LinkedIn-ready'].map((tag, i) => (
                <motion.div 
                  key={tag} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm sm:text-base font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {tag}
                </motion.div>
              ))}
            </div>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-primary font-black rounded-2xl text-xl shadow-xl transition-all inline-flex items-center gap-3"
              >
                Start Learning Free
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center text-muted-foreground text-sm bg-card dark:bg-card">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">InvesEd AI</span>
        </div>
        <p className="text-base mb-2">India's first AI-powered investment learning platform for teens</p>
        <p className="text-xs opacity-70 font-medium tracking-wide uppercase">100% virtual. No real money. Educational purpose only.</p>
      </footer>
    </div>
  );
}
