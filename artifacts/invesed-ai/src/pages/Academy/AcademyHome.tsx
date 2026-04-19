import { useState } from 'react';
import { Link } from 'wouter';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, ChevronRight, Zap, Award, Clock } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const CORE_MODULES = [
  { id: 'CF1', title: 'Money & You', desc: 'Pocket money, saving, compound interest, time value of money', lessons: 5, xp: 200, icon: '💰', alwaysFree: true },
  { id: 'CF2', title: 'What is Investing?', desc: 'Inflation, why FD alone fails, asset classes overview', lessons: 4, xp: 250, icon: '📈', alwaysFree: true },
  { id: 'CF3', title: 'Stocks Explained', desc: 'Shares, BSE/NSE, bulls & bears, market cap, stock mechanics', lessons: 5, xp: 300, icon: '📊', prereq: 'CF2' },
  { id: 'CF4', title: 'Mutual Funds & SIPs', desc: 'NAV, units, fund types, SIP, AMCs, SEBI, expense ratio', lessons: 5, xp: 300, icon: '🏦', prereq: 'CF3' },
  { id: 'CF5', title: 'Risk & Returns', desc: 'Risk-return tradeoff, diversification, correlation', lessons: 4, xp: 250, icon: '⚡', prereq: 'CF4' },
  { id: 'CF6', title: 'How to Research', desc: 'Balance sheet basics, P/E, revenue growth, fund fact sheets', lessons: 4, xp: 300, icon: '🔍', prereq: 'CF5' },
];

const ADVANCED_MODULES = [
  { id: 'AE1', title: 'Technical Analysis', desc: 'Candlesticks, moving averages, support & resistance levels', lessons: 5, xp: 400, icon: '📉', prereq: 'CF6' },
  { id: 'AE2', title: 'Fundamental Analysis', desc: 'DCF simplified, moat concept, reading quarterly results', lessons: 6, xp: 450, icon: '🔬', prereq: 'AE1' },
  { id: 'AE3', title: 'Portfolio Construction', desc: 'Asset allocation, rebalancing, tax efficiency (ELSS, LTCG)', lessons: 5, xp: 400, icon: '🗂️', prereq: 'AE2' },
  { id: 'AE4', title: 'Behavioural Finance', desc: 'Loss aversion, FOMO, herd mentality, AI-detected patterns', lessons: 4, xp: 350, icon: '🧠', prereq: 'AE3' },
];

interface ModuleCardProps {
  module: { id: string; title: string; desc: string; lessons: number; xp: number; icon: string; prereq?: string; alwaysFree?: boolean };
  completed: boolean;
  locked: boolean;
  isPro?: boolean;
}

function ModuleCard({ module, completed, locked, isPro }: ModuleCardProps) {
  const isFirstTwo = module.id === 'CF1' || module.id === 'CF2';
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const content = (
    <motion.div
      style={{ rotateX: !locked ? rotateX : 0, rotateY: !locked ? rotateY : 0, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={!locked ? { scale: 1.02, zIndex: 10 } : {}}
      className={`bg-card rounded-2xl border p-6 relative transition-colors h-full flex flex-col ${
        !locked ? 'hover:shadow-xl cursor-pointer' : 'opacity-60 cursor-not-allowed'
      } ${completed ? 'border-green-300 dark:border-green-800 shadow-[0_0_15px_rgba(27,107,58,0.1)]' : 'border-border shadow-sm'}`}
    >
      <div style={{ transform: "translateZ(30px)" }}>
        {isPro && !completed && (
          <div className="absolute top-0 right-0 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-bl-xl rounded-tr-2xl border-b border-l border-amber-200 dark:border-amber-800">Pro</div>
        )}
        {completed && (
          <div className="absolute top-3 right-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            >
              <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400 fill-green-100 dark:fill-green-900/30" />
            </motion.div>
          </div>
        )}
        {locked && !isPro && (
          <div className="absolute top-3 right-3"><Lock className="w-5 h-5 text-muted-foreground" /></div>
        )}
        {isFirstTwo && !completed && (
          <div className="absolute top-0 right-0 px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-bl-xl rounded-tr-2xl border-b border-l border-green-200 dark:border-green-800">Free</div>
        )}

        <div className="text-4xl mb-4 p-3 bg-muted/30 rounded-2xl inline-block">{module.icon}</div>
        <div className="text-xs font-black text-primary/80 uppercase tracking-widest mb-1">{module.id}</div>
        <h3 className="font-bold text-lg text-foreground mb-2 leading-tight">{module.title}</h3>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-3 flex-1">{module.desc}</p>

        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground bg-muted/40 p-3 rounded-xl mt-auto">
          <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><span>{module.lessons} lessons</span></div>
          <div className="w-px h-4 bg-border" />
          <motion.div 
            className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"
            animate={{ filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4" /><span>+{module.xp} XP</span>
          </motion.div>
        </div>

        {!locked && !completed && (
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-secondary group">
            Start module <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
        {completed && (
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400">
            Completed <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        {locked && !isPro && (
          <div className="mt-4 text-xs font-medium text-muted-foreground">
            <Lock className="w-3 h-3 inline mr-1" /> Complete {module.prereq} first
          </div>
        )}
      </div>
    </motion.div>
  );

  if (locked) return content;
  return <Link href={`/academy/${module.id}`} className="block h-full">{content}</Link>;
}

export default function AcademyHome() {
  const { completedModules } = useUser();
  const totalModules = CORE_MODULES.length + ADVANCED_MODULES.length;
  const completedCount = completedModules.length;
  const progressPercent = (completedCount / totalModules) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 perspective-1000">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black text-primary mb-3 flex items-center gap-3">
          <BookOpen className="w-10 h-10" /> InvesEd Academy
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Learn investing the right way — structured, interactive, and built for Indian teens.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl border border-border p-6 sm:p-8 mb-10 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <div className="font-black text-xl text-foreground mb-1">Certification Progress</div>
            <div className="font-medium text-muted-foreground">{completedCount} of {totalModules} modules completed</div>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-base font-black text-amber-700 dark:text-amber-400">{Math.round(progressPercent)}%</span>
          </div>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden relative z-10 border border-border/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }} 
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }} 
            className="h-full brand-gradient rounded-full relative overflow-hidden" 
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-5 mb-8 flex items-center gap-4 sm:gap-6"
      >
        <div className="text-4xl hidden sm:block">🎓</div>
        <div className="flex-1">
          <div className="font-bold text-green-800 dark:text-green-300 text-base mb-1">CF1 & CF2 are fully unlocked — start learning now!</div>
          <div className="text-sm text-green-700/80 dark:text-green-400/80 font-medium">Complete CF1 → CF2 → unlock the full course track for free</div>
        </div>
        <div className="px-4 py-2 rounded-xl border-2 border-green-300 dark:border-green-700 text-sm font-bold text-green-700 dark:text-green-300 bg-white/50 dark:bg-black/20 whitespace-nowrap">Start Free</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/20 dark:border-primary/30 rounded-2xl p-5 mb-12 flex items-center gap-4 sm:gap-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50" />
        <Award className="w-12 h-12 text-primary flex-shrink-0 relative z-10 drop-shadow-sm" />
        <div className="flex-1 relative z-10">
          <div className="font-bold text-primary dark:text-primary-foreground text-base mb-1">Earn a Coursera-verified certificate on completion</div>
          <div className="text-sm font-medium text-foreground/70">Official Content Partner — Verifiable on LinkedIn</div>
        </div>
        <div className="px-4 py-2 rounded-xl border-2 border-primary/30 text-sm font-bold text-primary dark:text-primary-foreground bg-background/50 backdrop-blur-sm whitespace-nowrap relative z-10">Free + Coursera</div>
      </motion.div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-black tracking-wide uppercase shadow-sm">Core Track</div>
          <div className="font-bold text-muted-foreground">Free · CF1–CF6</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_MODULES.map((mod, i) => {
            const completed = completedModules.includes(mod.id);
            const isAlwaysFree = mod.alwaysFree;
            const prereqDone = !mod.prereq || completedModules.includes(mod.prereq);
            const locked = !isAlwaysFree && !prereqDone && !completed;
            return (
              <motion.div 
                key={mod.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                className="h-full"
              >
                <ModuleCard module={mod} completed={completed} locked={locked} />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-black tracking-wide uppercase shadow-sm">Advanced Track</div>
          <div className="font-bold text-muted-foreground">Pro · AE1–AE4</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANCED_MODULES.map((mod, i) => {
            const completed = completedModules.includes(mod.id);
            return (
              <motion.div 
                key={mod.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                className="h-full"
              >
                <ModuleCard module={mod} completed={completed} locked={true} isPro />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
