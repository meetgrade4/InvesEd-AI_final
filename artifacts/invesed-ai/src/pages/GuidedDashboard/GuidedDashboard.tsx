import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Compass, TrendingUp, TrendingDown, BookOpen, Target, Zap,
  ChevronRight, CheckCircle, Clock, Plus, AlertTriangle, Lightbulb, Eye, Star
} from 'lucide-react';
import { formatINRFull } from '../../utils/formatters';
import InvestModal from '../../components/InvestModal';
import { useUser, MODULE_LESSON_MAP, type PortfolioHolding } from '../../context/UserContext';

const CORE_MODULE_INFO: { id: string; title: string; lessons: number; xp: number }[] = [
  { id: 'CF1', title: 'Money & You', lessons: 5, xp: 200 },
  { id: 'CF2', title: 'What is Investing?', lessons: 4, xp: 250 },
  { id: 'CF3', title: 'Stocks Explained', lessons: 5, xp: 300 },
  { id: 'CF4', title: 'Mutual Funds & SIPs', lessons: 5, xp: 300 },
];

interface Insight {
  icon: string;
  title: string;
  body: string;
  action: { label: string; href: string };
  color: string;
  labelColor: string;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function computeInsights(
  holdings: PortfolioHolding[],
  watchlist: string[],
  researchHistory: { ticker: string; name: string; type: 'stock' | 'fund'; viewCount: number; lastViewedAt: number }[],
  riskProfile: { type: string } | null,
  completedModules: string[],
): Insight[] {
  const insights: Insight[] = [];
  const holdingTickers = new Set(holdings.map(h => h.ticker));

  // 1. Sector concentration check
  const totalValue = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    if (h.sector && h.type === 'stock') {
      const val = h.quantity * h.currentPrice;
      sectorMap[h.sector] = (sectorMap[h.sector] ?? 0) + val;
    }
  });
  const topSector = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0];
  if (topSector && totalValue > 0 && (topSector[1] / totalValue) > 0.35) {
    const pct = Math.round((topSector[1] / totalValue) * 100);
    const sector = topSector[0];
    const diversifyInto = sector === 'Banking' ? 'IT or FMCG' : sector === 'IT' ? 'Banking or FMCG' : 'Banking or IT';
    insights.push({
      icon: '⚠️',
      title: `High ${sector} Concentration (${pct}%)`,
      body: `${pct}% of your stock holdings are in ${sector}. Diversifying into ${diversifyInto} sectors can reduce your risk if ${sector} faces a downturn.`,
      action: { label: 'Learn About Diversification', href: '/academy/CF5' },
      color: 'border-amber-200 bg-amber-50',
      labelColor: 'text-amber-700',
    });
  }

  // 2. Watchlist items not yet invested in
  const watchedNotInvested = watchlist.filter(t => !holdingTickers.has(t));
  if (watchedNotInvested.length > 0) {
    const ticker = watchedNotInvested[0];
    const researchEntry = researchHistory.find(r => r.ticker === ticker);
    const name = researchEntry?.name ?? ticker;
    insights.push({
      icon: '⭐',
      title: `You starred ${name} — still on the fence?`,
      body: `${name} is on your watchlist but you haven't invested yet. Use the Research Lab to check its risk profile and analyst ratings before deciding.`,
      action: { label: `Analyse ${ticker}`, href: `/research/${ticker}` },
      color: 'border-blue-200 bg-blue-50',
      labelColor: 'text-blue-700',
    });
  }

  // 3. Frequently researched but not invested
  const researchedNotOwned = researchHistory
    .filter(r => !holdingTickers.has(r.ticker) && r.viewCount >= 2)
    .sort((a, b) => b.viewCount - a.viewCount);
  if (researchedNotOwned.length > 0 && watchedNotInvested[0] !== researchedNotOwned[0]?.ticker) {
    const top = researchedNotOwned[0];
    insights.push({
      icon: '🔍',
      title: `You've researched ${top.name} ${top.viewCount}×`,
      body: `You've visited ${top.name}'s research page ${top.viewCount} times. ${riskProfile?.type === 'conservative' ? 'Based on your conservative profile, check its risk score before investing.' : 'Your risk profile suggests you can consider adding it to your portfolio.'}`,
      action: { label: `Open ${top.ticker} Research`, href: `/research/${top.ticker}` },
      color: 'border-purple-200 bg-purple-50',
      labelColor: 'text-purple-700',
    });
  }

  // 4. Underperforming holding — highlight and suggest learning
  const underperformers = holdings
    .filter(h => h.type === 'stock')
    .map(h => ({ ...h, pct: ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 }))
    .filter(h => h.pct < -3)
    .sort((a, b) => a.pct - b.pct);
  if (underperformers.length > 0) {
    const worst = underperformers[0];
    insights.push({
      icon: '📉',
      title: `${worst.ticker} is down ${Math.abs(worst.pct).toFixed(1)}%`,
      body: `${worst.name} has lost ${Math.abs(worst.pct).toFixed(1)}% since your average buy price. Before selling in panic, check the fundamentals — short-term dips are common for quality stocks.`,
      action: { label: `Review ${worst.ticker} Fundamentals`, href: `/research/${worst.ticker}` },
      color: 'border-red-200 bg-red-50',
      labelColor: 'text-red-700',
    });
  }

  // 5. Well-performing holding — suggest learning to read it better
  const topPerformers = holdings
    .filter(h => h.type === 'stock')
    .map(h => ({ ...h, pct: ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 }))
    .filter(h => h.pct > 5)
    .sort((a, b) => b.pct - a.pct);
  if (topPerformers.length > 0 && insights.length < 3) {
    const best = topPerformers[0];
    insights.push({
      icon: '💡',
      title: `${best.ticker} is up ${best.pct.toFixed(1)}% — understand why`,
      body: `${best.name} is performing well in your portfolio. Reading its quarterly results will help you decide whether to hold, add more, or book profits.`,
      action: { label: `Deep-dive into ${best.ticker}`, href: `/research/${best.ticker}` },
      color: 'border-green-200 bg-green-50',
      labelColor: 'text-green-700',
    });
  }

  // 6. If no modules done, suggest starting
  if (completedModules.length === 0 && insights.length < 3) {
    insights.push({
      icon: '🎓',
      title: 'Start your investing education',
      body: 'You have an active portfolio but haven\'t completed any Academy modules yet. Start with CF1: Money & You to understand the principles behind your investments.',
      action: { label: 'Start CF1: Money & You', href: '/academy/CF1' },
      color: 'border-indigo-200 bg-indigo-50',
      labelColor: 'text-indigo-700',
    });
  }

  // 7. Risk-profile vs holdings check (no profile set)
  if (!riskProfile && insights.length < 4) {
    insights.push({
      icon: '📋',
      title: 'Complete your risk assessment',
      body: 'You have investments but no risk profile. Take the quiz to get personalised insights, suitable investment suggestions, and a risk-adjusted portfolio view.',
      action: { label: 'Take Risk Quiz', href: '/onboarding' },
      color: 'border-orange-200 bg-orange-50',
      labelColor: 'text-orange-700',
    });
  }

  return insights.slice(0, 4);
}

export default function GuidedDashboard() {
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [investTicker, setInvestTicker] = useState<string | undefined>();
  const {
    portfolioState, completedModules, completedLessons, userProfile,
    researchHistory, activityLog,
  } = useUser();

  const { cash, holdings } = portfolioState;
  const totalCurrentValue = holdings.reduce((a, h) => a + h.quantity * h.currentPrice, 0);
  const totalInvested = holdings.reduce((a, h) => a + h.quantity * h.avgBuyPrice, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  function openInvest(ticker?: string) {
    setInvestTicker(ticker);
    setInvestModalOpen(true);
  }

  const insights = useMemo(() => computeInsights(
    holdings,
    userProfile?.watchlist ?? [],
    researchHistory,
    userProfile?.riskProfile ?? null,
    completedModules,
  ), [holdings, userProfile?.watchlist, researchHistory, userProfile?.riskProfile, completedModules]);

  const nextSteps = useMemo(() => {
    const steps = [];

    if (!completedModules.includes('CF1')) {
      steps.push({
        title: 'Start CF1: Money & You',
        description: 'Learn saving habits and compound interest — the foundation of all investing',
        href: '/academy/CF1', icon: BookOpen, iconBg: 'bg-green-100', iconColor: 'text-green-600', badge: '200 XP', badgeColor: 'bg-green-100 text-green-700',
      });
    } else if (!completedModules.includes('CF2')) {
      steps.push({
        title: 'Continue CF2: What is Investing?',
        description: 'Learn about inflation, FDs, and asset classes — builds on your CF1 knowledge',
        href: '/academy/CF2', icon: BookOpen, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: '250 XP', badgeColor: 'bg-blue-100 text-blue-700',
      });
    }

    const watchedNotInvested = (userProfile?.watchlist ?? []).filter(t => !holdings.find(h => h.ticker === t));
    if (watchedNotInvested.length > 0) {
      const ticker = watchedNotInvested[0];
      const name = researchHistory.find(r => r.ticker === ticker)?.name ?? ticker;
      steps.push({
        title: `Research & decide on ${name}`,
        description: `You starred ${ticker} — check analyst targets and risk score before investing`,
        href: `/research/${ticker}`, icon: Star, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'Watchlist', badgeColor: 'bg-amber-100 text-amber-700',
      });
    }

    steps.push({
      title: 'Try a Situation Round',
      description: 'Practice what happens during a market crash — directly relevant to your holdings',
      href: '/rounds', icon: Zap, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'Scenario', badgeColor: 'bg-amber-100 text-amber-700',
    });

    const sectorMap: Record<string, number> = {};
    holdings.filter(h => h.type === 'stock').forEach(h => {
      const val = h.quantity * h.currentPrice;
      sectorMap[h.sector ?? 'Other'] = (sectorMap[h.sector ?? 'Other'] ?? 0) + val;
    });
    const totalVal = Object.values(sectorMap).reduce((a, b) => a + b, 0);
    const topSector = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topSector && totalVal > 0) {
      const pct = Math.round(((sectorMap[topSector] ?? 0) / totalVal) * 100);
      if (pct > 35) {
        const diversifyTicker = topSector === 'Banking' ? 'HINDUNILVR' : topSector === 'IT' ? 'HDFCBANK' : 'INFY';
        steps.push({
          title: `Diversify beyond ${topSector}`,
          description: `${topSector} is ${pct}% of your stocks — add exposure to balance your risk`,
          href: `/research/${diversifyTicker}`, icon: Target, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', badge: 'Suggestion', badgeColor: 'bg-purple-100 text-purple-700',
        });
      }
    }

    return steps.slice(0, 3);
  }, [completedModules, userProfile?.watchlist, holdings, researchHistory]);

  const recentActivity = useMemo(() => {
    return [...activityLog]
      .sort((a, b) => b.time - a.time)
      .slice(0, 6);
  }, [activityLog]);

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

      {/* Stats */}
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

          {/* Dynamic AI Insights */}
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
              AI Insights for You
              <span className="text-xs font-normal text-muted-foreground ml-1">— based on your activity</span>
            </h2>
            {insights.length === 0 ? (
              <div className="bg-muted/40 rounded-xl p-6 text-center text-sm text-muted-foreground">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Start researching stocks and making investments — insights will appear here as you use the app.
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => (
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
            )}
          </div>

          {/* Recommended Next Steps */}
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

          {/* Research Activity */}
          {researchHistory.length > 0 && (
            <div>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-400 rounded-full inline-block" />
                What You've Been Researching
              </h2>
              <div className="bg-white border border-border rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  {[...researchHistory]
                    .sort((a, b) => b.lastViewedAt - a.lastViewedAt)
                    .slice(0, 8)
                    .map(r => {
                      const isOwned = holdings.find(h => h.ticker === r.ticker);
                      const isWatched = (userProfile?.watchlist ?? []).includes(r.ticker);
                      return (
                        <Link key={r.ticker} href={`/research/${r.ticker}`}>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors cursor-pointer">
                            <span className="text-xs font-bold text-foreground">{r.ticker}</span>
                            {r.viewCount > 1 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Eye className="w-3 h-3" />{r.viewCount}
                              </span>
                            )}
                            {isOwned && <span className="text-xs text-green-600 font-medium">✓ owned</span>}
                            {!isOwned && isWatched && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Holdings */}
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

          {/* Academy Progress */}
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

          {/* Live Activity Feed */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-3">No activity yet</div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground leading-relaxed">{item.text}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(item.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
