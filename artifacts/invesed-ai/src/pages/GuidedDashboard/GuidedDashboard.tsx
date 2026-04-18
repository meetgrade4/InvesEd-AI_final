import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Compass, TrendingUp, TrendingDown, BookOpen, Target, Zap,
  ChevronRight, CheckCircle, Clock, Plus
} from 'lucide-react';
import { formatINRFull } from '../../utils/formatters';
import InvestModal from '../../components/InvestModal';
import { useUser, MODULE_LESSON_MAP } from '../../context/UserContext';

const CORE_MODULE_INFO: { id: string; title: string; lessons: number; xp: number }[] = [
  { id: 'CF1', title: 'Money & You', lessons: 5, xp: 200 },
  { id: 'CF2', title: 'What is Investing?', lessons: 4, xp: 250 },
  { id: 'CF3', title: 'Stocks Explained', lessons: 5, xp: 300 },
  { id: 'CF4', title: 'Mutual Funds & SIPs', lessons: 5, xp: 300 },
];

const INSIGHTS = [
  {
    icon: '⚠️',
    title: 'High Concentration Risk',
    body: 'Banking sector may make up a large portion of your portfolio. Consider diversifying into IT or FMCG sectors for better balance.',
    action: { label: 'View Diversification Tips', href: '/academy/CF5' },
    color: 'border-amber-200 bg-amber-50',
    labelColor: 'text-amber-700',
  },
  {
    icon: '🔍',
    title: "You've been watching Zomato",
    body: "Viewed ZOMATO's research page multiple times. Still on the fence? Your risk profile suggests you can handle some consumer growth stocks.",
    action: { label: 'Analyse ZOMATO Now', href: '/research/ZOMATO' },
    color: 'border-blue-200 bg-blue-50',
    labelColor: 'text-blue-700',
  },
  {
    icon: '💡',
    title: 'Market Opportunity Spotted',
    body: 'Infosys (INFY) in your portfolio is an IT sector leader. Learning to read its quarterly results will help you make better hold/sell decisions.',
    action: { label: 'Review INFY', href: '/research/INFY' },
    color: 'border-purple-200 bg-purple-50',
    labelColor: 'text-purple-700',
  },
];

const ACTIVITY_FEED = [
  { icon: '📈', text: 'Researched TCS — P/E analysis', time: '2 hours ago' },
  { icon: '💰', text: 'Virtual Buy: HDFCBANK × 12 shares (starting portfolio)', time: '1 day ago' },
  { icon: '🔍', text: 'Viewed ZOMATO research page', time: '3 days ago' },
  { icon: '💰', text: 'Virtual Buy: PPFAS Flexi Cap × 250 units (starting portfolio)', time: '4 days ago' },
];

export default function GuidedDashboard() {
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [investTicker, setInvestTicker] = useState<string | undefined>();
  const { portfolioState, completedModules, completedLessons, userProfile } = useUser();

  const { cash, holdings } = portfolioState;
  const totalCurrentValue = holdings.reduce((a, h) => a + h.quantity * h.currentPrice, 0);
  const totalInvested = holdings.reduce((a, h) => a + h.quantity * h.avgBuyPrice, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const stockHoldings = holdings.filter(h => h.type === 'stock');

  function openInvest(ticker?: string) {
    setInvestTicker(ticker);
    setInvestModalOpen(true);
  }

  const nextSteps = [
    ...(completedModules.includes('CF1') && !completedModules.includes('CF2') ? [{
      title: 'Continue with CF2',
      description: 'Learn about inflation, FDs, and asset classes — builds on your CF1 knowledge',
      href: '/academy/CF2', icon: BookOpen, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: '250 XP', badgeColor: 'bg-blue-100 text-blue-700',
    }] : []),
    ...(!completedModules.includes('CF1') ? [{
      title: 'Start CF1: Money & You',
      description: 'Learn saving habits and compound interest — the foundation of all investing',
      href: '/academy/CF1', icon: BookOpen, iconBg: 'bg-green-100', iconColor: 'text-green-600', badge: '200 XP', badgeColor: 'bg-green-100 text-green-700',
    }] : []),
    {
      title: 'Try a Situation Round',
      description: 'Practice what happens during a market crash — directly relevant to your holdings',
      href: '/rounds', icon: Zap, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'Scenario', badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Diversify into FMCG',
      description: 'Hindustan Unilever or Dabur can balance a banking/IT-heavy portfolio',
      href: '/research/HINDUNILVR', icon: Target, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', badge: 'Suggestion', badgeColor: 'bg-purple-100 text-purple-700',
    },
  ].slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <InvestModal isOpen={investModalOpen} onClose={() => setInvestModalOpen(false)} defaultTicker={investTicker} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-secondary" />
            <h1 className="text-2xl font-black text-primary">My Learning Journey</h1>
          </div>
          <p className="text-sm text-muted-foreground">Personalised guidance based on your research & investments</p>
        </div>
        <button onClick={() => openInvest()} className="flex items-center gap-2 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-xl shadow-sm">
          <Plus className="w-4 h-4" /> Add Investment
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Holdings Value', value: formatINRFull(totalCurrentValue), sub: `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}% return`, positive: returnPct >= 0 },
          { label: 'Cash Available', value: formatINRFull(cash), sub: 'ready to invest', positive: true },
          { label: 'Total Portfolio', value: formatINRFull(totalCurrentValue + cash), sub: `${holdings.length} holdings`, positive: true },
          { label: 'Academy Progress', value: `${completedModules.length}/${CORE_MODULE_INFO.length}`, sub: 'core modules done', positive: true },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-xl font-black text-foreground">{stat.value}</div>
            <div className={`text-xs mt-0.5 font-medium ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
              AI Insights for You
            </h2>
            <div className="space-y-3">
              {INSIGHTS.map((insight, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${insight.color}`}>
                  <span className="text-xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm mb-0.5 ${insight.labelColor}`}>{insight.title}</div>
                    <div className="text-sm text-gray-700 leading-relaxed">{insight.body}</div>
                    <Link href={insight.action.href}>
                      <button className={`mt-2 text-xs font-semibold underline ${insight.labelColor}`}>{insight.action.label} →</button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-secondary rounded-full inline-block" />
              Recommended Next Steps
            </h2>
            <div className="space-y-3">
              {nextSteps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                  className="bg-white border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${step.badgeColor}`}>{step.badge}</span>
                    <Link href={step.href}>
                      <button className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/70 transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Your Holdings
            </h3>
            {holdings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">No holdings yet</div>
            ) : (
              <div className="space-y-2">
                {holdings.slice(0, 5).map(h => {
                  const pct = ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
                  return (
                    <div key={h.ticker} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-primary">
                          {h.ticker.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate max-w-[90px]">{h.ticker}</div>
                          <div className="text-xs text-muted-foreground">{h.quantity} {h.type === 'mutualfund' ? 'units' : 'shares'}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold">₹{(h.quantity * h.currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        <div className={`text-xs flex items-center gap-0.5 justify-end ${pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="pt-3 mt-3 border-t border-border text-sm flex justify-between">
              <span className="text-muted-foreground">Cash</span>
              <span className="font-bold text-green-700">{formatINRFull(cash)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => openInvest()} className="py-2 brand-gradient text-white text-xs font-bold rounded-lg">+ Invest</button>
              <Link href="/research">
                <button className="py-2 border border-border text-xs font-semibold rounded-lg hover:bg-muted w-full transition-colors">Research</button>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              Academy Progress
            </h3>
            <div className="space-y-2.5">
              {CORE_MODULE_INFO.map(mod => {
                const moduleDone = completedModules.includes(mod.id);
                const lessonsInModule = MODULE_LESSON_MAP[mod.id]?.lessons ?? [];
                const doneLessons = lessonsInModule.filter(l => completedLessons.includes(l)).length;
                const partial = !moduleDone && doneLessons > 0;
                return (
                  <div key={mod.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${moduleDone ? 'bg-green-100' : partial ? 'bg-amber-100' : 'bg-muted'}`}>
                      {moduleDone ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className={`w-3.5 h-3.5 ${partial ? 'text-amber-600' : 'text-muted-foreground'}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${moduleDone ? 'text-foreground' : 'text-muted-foreground'}`}>{mod.id}: {mod.title}</div>
                      {partial && <div className="text-xs text-amber-600">{doneLessons}/{mod.lessons} lessons done</div>}
                    </div>
                    {moduleDone
                      ? <span className="text-xs text-green-600 font-bold flex-shrink-0">+{mod.xp} XP</span>
                      : <Link href={`/academy/${mod.id}`}><button className="text-xs text-secondary font-semibold flex-shrink-0">
                          {partial ? 'Continue' : 'Start'} →
                        </button></Link>
                    }
                  </div>
                );
              })}
            </div>
            <Link href="/academy">
              <button className="w-full mt-3 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors">View All Modules</button>
            </Link>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                ...completedLessons.slice(-3).reverse().map(l => ({
                  icon: '📚', text: `Completed lesson ${l}`, time: 'Just now',
                })),
                ...ACTIVITY_FEED,
              ].slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground leading-relaxed">{item.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
