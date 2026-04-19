import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Crown, Zap, Brain, TrendingUp, Star, Gift, Shield, ChevronRight,
  BookOpen, BarChart3, Target, Trophy, Sparkles, ArrowLeft
} from 'lucide-react';

const PRO_FEATURES = [
  {
    icon: TrendingUp,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Extended Virtual Portfolio',
    desc: 'Start with ₹10,00,000 virtual capital (vs ₹1,00,000 on Free). Invest in 200+ additional stocks including mid-caps, small-caps, international ETFs, REITs, and sovereign gold bonds.',
    tag: '10× Capital',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    icon: Brain,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Elite AI Coach',
    desc: 'Upgraded GPT model with deeper financial reasoning. Analyses your full portfolio, research history, and quiz performance to give hyper-personalised advice. Supports multi-turn strategy conversations and scenario simulations.',
    tag: 'Smarter AI',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Advanced AI Insights',
    desc: 'Daily market briefings tailored to your holdings. Sector rotation alerts, earnings season prep, risk-adjusted portfolio scoring, and "what if" scenario analysis for any stock or fund you\'re considering.',
    tag: 'Predictive',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Advanced Academy Modules',
    desc: 'Unlock AE1–AE4: Derivatives & Options Basics, Technical Analysis for Indian Markets, Tax & ELSS Planning, and Portfolio Construction Masterclass — designed for students ready to go beyond fundamentals.',
    tag: '4 Extra Modules',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Full Research Lab Access',
    desc: 'Screener tools for NSE/BSE with 50+ filters (P/E, revenue growth, debt-to-equity, promoter holding). Analyst consensus targets, institutional holding data, and F&O activity overview for 500+ stocks.',
    tag: '500+ Stocks',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    icon: Target,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    title: 'Exclusive Situation Rounds',
    desc: '12 additional scenario rounds including the 2013 Taper Tantrum, 2016 Demonetisation, 2021 Crypto Crash effect on Indian markets, and real-time live market simulation during major announcements.',
    tag: '+12 Scenarios',
    tagColor: 'bg-red-100 text-red-700',
  },
];

const ACHIEVEMENT_REWARDS = [
  { icon: '🎓', achievement: 'Complete all 10 Academy modules', reward: 'Scholar Badge + exclusive Pro avatar frame', level: 'Gold' },
  { icon: '📈', achievement: 'Grow virtual portfolio by 30% in 90 days', reward: 'Market Wizard Badge + AI portfolio review', level: 'Platinum' },
  { icon: '🔍', achievement: 'Research 50+ stocks (view detail page)', reward: 'Analyst Badge + custom Research Lab dashboard', level: 'Silver' },
  { icon: '⚡', achievement: 'Complete 10 Situation Rounds', reward: 'Crisis Survivor Badge + exclusive round replay mode', level: 'Gold' },
  { icon: '🏆', achievement: 'Reach #1 on leaderboard for 7 days', reward: 'Champion Badge + featured on national student rankings', level: 'Platinum' },
  { icon: '💡', achievement: 'Score 100% on 5 module quizzes', reward: 'Genius Badge + personalised career path report', level: 'Silver' },
];

const LEVEL_COLORS: Record<string, string> = {
  Silver: 'bg-gray-100 text-gray-700 border-gray-300',
  Gold: 'bg-amber-100 text-amber-700 border-amber-300',
  Platinum: 'bg-purple-100 text-purple-700 border-purple-300',
};

export default function UpgradePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/profile">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 mb-10 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-9xl">👑</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-6 h-6" />
            <span className="text-sm font-bold tracking-widest uppercase opacity-90">InvesEd Pro</span>
          </div>
          <h1 className="text-4xl font-black mb-3 leading-tight">Invest smarter.<br />Learn faster. Earn more.</h1>
          <p className="text-white/85 text-base mb-6 max-w-xl">
            Pro gives Indian students the tools of a professional investor — bigger portfolio, smarter AI, advanced courses, and real achievement rewards that look great on college applications.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {['₹10L Virtual Capital', 'Elite AI Coach', 'Advanced Modules', '12+ Scenarios', '500+ Research Stocks'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">{tag}</span>
            ))}
          </div>
          <button className="px-8 py-4 bg-white text-amber-600 font-black text-lg rounded-2xl shadow-lg hover:bg-amber-50 transition-colors flex items-center gap-2">
            <Zap className="w-5 h-5 fill-amber-400 text-amber-400" /> Upgrade to Pro
          </button>
        </div>
      </motion.div>

      {/* Features grid */}
      <div className="mb-10">
        <h2 className="text-2xl font-black mb-2">Everything in Pro</h2>
        <p className="text-muted-foreground text-sm mb-6">Every feature designed specifically for serious student investors in India.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRO_FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="bg-white border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 ${f.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{f.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.tagColor}`}>{f.tag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievement Rewards */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-2xl font-black">Achievement Rewards</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Pro members unlock exclusive rewards as they reach milestones — badges, special features, and recognition that goes beyond the leaderboard.
        </p>
        <div className="space-y-3">
          {ACHIEVEMENT_REWARDS.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
              className="bg-white border border-border rounded-2xl p-4 flex items-center gap-4">
              <span className="text-2xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground mb-0.5">{r.achievement}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  {r.reward}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border flex-shrink-0 ${LEVEL_COLORS[r.level]}`}>{r.level}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Free vs Pro comparison */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden mb-10">
        <div className="grid grid-cols-3 text-center text-sm font-bold border-b border-border">
          <div className="p-4 text-muted-foreground">Feature</div>
          <div className="p-4 border-x border-border text-foreground">Free</div>
          <div className="p-4 bg-amber-50 text-amber-700 flex items-center justify-center gap-1"><Crown className="w-3.5 h-3.5" /> Pro</div>
        </div>
        {[
          ['Virtual Capital', '₹1,00,000', '₹10,00,000'],
          ['Academy Modules', '6 core modules', '10 modules (6 + 4 advanced)'],
          ['Research Lab Stocks', '~30 stocks', '500+ with screener'],
          ['Situation Rounds', '3 scenarios', '15+ scenarios'],
          ['AI Coach Model', 'Standard', 'Elite (faster, deeper)'],
          ['AI Insights', 'Basic (4 per session)', 'Advanced (daily, predictive)'],
          ['Achievement Rewards', 'Standard badges', 'Exclusive badges + features'],
          ['Leaderboard', 'School level', 'National rankings'],
          ['Portfolio Analytics', 'Basic P&L', 'Full risk analytics + Sharpe'],
        ].map(([feat, free, pro], i) => (
          <div key={i} className={`grid grid-cols-3 text-center text-sm border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
            <div className="p-3.5 text-left text-foreground font-medium pl-4">{feat}</div>
            <div className="p-3.5 border-x border-border text-muted-foreground">{free}</div>
            <div className="p-3.5 bg-amber-50/50 text-amber-700 font-semibold">{pro}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-8 text-center">
        <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
        <h3 className="text-2xl font-black mb-2">Built for Indian student investors</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          All investments are simulated — no real money ever. Pro simply gives you more capital, tools, and guidance to practice like a professional.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-8 py-4 brand-gradient text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Crown className="w-5 h-5" /> Upgrade to Pro
          </button>
          <Link href="/dashboard">
            <button className="px-6 py-4 border border-border rounded-2xl font-semibold text-sm hover:bg-muted transition-colors w-full sm:w-auto">
              Continue with Free
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
