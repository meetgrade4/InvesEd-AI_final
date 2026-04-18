import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Plus, Compass } from 'lucide-react';
import { formatINR, formatINRFull, formatPercent } from '../../utils/formatters';
import InvestModal from '../../components/InvestModal';
import { useUser } from '../../context/UserContext';

const PORTFOLIO_HISTORY = Array.from({ length: 45 }, (_, i) => {
  const date = new Date('2026-03-01');
  date.setDate(date.getDate() + i);
  const base = 180000;
  const noise = (Math.random() - 0.50) * 2000;
  const trend = i * 180;
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    value: Math.round(base + trend + noise),
  };
});

const PIE_COLORS = ['#1E3A5F', '#2E86AB', '#1B6B3A', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const BEHAVIOURAL_FLAGS = [
  {
    type: 'fomo',
    ticker: 'ZOMATO',
    message: "You've researched Zomato 3 times without investing. What's holding you back?",
    icon: '🔍',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
  },
];

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock', mutualfund: 'Fund', bank_fd: 'FD', nps: 'NPS', ppf: 'PPF', pms: 'PMS',
};

export default function Portfolio() {
  const [period, setPeriod] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M');
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const { portfolioState } = useUser();

  const { cash, holdings } = portfolioState;

  const holdingsWithCalc = holdings.map(h => ({
    ...h,
    investedAmount: h.quantity * h.avgBuyPrice,
    currentValue: h.quantity * h.currentPrice,
    absoluteReturn: (h.currentPrice - h.avgBuyPrice) * h.quantity,
    percentReturn: ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100,
  }));

  const totalCurrentValue = holdingsWithCalc.reduce((a, h) => a + h.currentValue, 0);
  const totalInvested = holdingsWithCalc.reduce((a, h) => a + h.investedAmount, 0);
  const portfolioValue = totalCurrentValue + cash;
  const totalReturn = totalCurrentValue - totalInvested;
  const returnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const pieData = [
    ...holdingsWithCalc.map(h => ({ name: h.ticker, value: h.currentValue })),
    { name: 'Cash', value: cash },
  ];

  const slicedHistory = period === '1W' ? PORTFOLIO_HISTORY.slice(-7)
    : period === '1M' ? PORTFOLIO_HISTORY.slice(-30)
    : period === '3M' ? PORTFOLIO_HISTORY.slice(-45)
    : PORTFOLIO_HISTORY;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <InvestModal isOpen={investModalOpen} onClose={() => setInvestModalOpen(false)} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-primary">My Portfolio</h1>
          <p className="text-sm text-muted-foreground">Virtual Simulator — ₹1,00,000 cash + ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in holdings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 border border-border bg-white text-sm font-semibold rounded-xl shadow-sm hover:bg-muted transition-colors">
              <Compass className="w-4 h-4 text-secondary" /> Guided
            </button>
          </Link>
          <button onClick={() => setInvestModalOpen(true)} className="flex items-center gap-2 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-xl shadow-sm">
            <Plus className="w-4 h-4" /> Add Investment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Portfolio', value: formatINRFull(portfolioValue), highlight: true },
          { label: 'Holdings Return', value: formatINR(totalReturn), positive: totalReturn >= 0, negative: totalReturn < 0 },
          { label: 'Return %', value: formatPercent(returnPercent), positive: returnPercent >= 0, negative: returnPercent < 0 },
          { label: 'Cash Available', value: formatINRFull(cash), neutral: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className={`text-lg font-black ${
              stat.highlight ? 'text-foreground'
              : stat.positive ? 'text-green-600'
              : stat.negative ? 'text-red-600'
              : 'text-foreground'
            }`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {BEHAVIOURAL_FLAGS.map((flag, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className={`flex items-start gap-3 p-4 rounded-xl border mb-4 ${flag.color}`}>
          <span className="text-xl">{flag.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-sm">AI Coach Insight</div>
            <div className="text-sm mt-0.5">{flag.message}</div>
          </div>
          <Link href="/research/ZOMATO">
            <button className="text-xs font-semibold underline flex-shrink-0">Analyse it</button>
          </Link>
        </motion.div>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Portfolio Performance</h2>
            <div className="flex gap-1">
              {(['1W', '1M', '3M', 'ALL'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={slicedHistory}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E86AB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E86AB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#2E86AB" fill="url(#portfolioGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-4">Allocation</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-[80px]">{item.name}</span>
                </div>
                <span className="font-medium">{totalCurrentValue + cash > 0 ? ((item.value / (totalCurrentValue + cash)) * 100).toFixed(1) : '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border mt-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">Holdings ({holdings.length})</h2>
          <button onClick={() => setInvestModalOpen(true)} className="text-xs text-secondary font-semibold hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add more
          </button>
        </div>
        {holdings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">No holdings yet. Click "Add Investment" to start!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">Asset</th>
                  <th className="text-right px-4 py-3 font-medium">Type</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Avg Price</th>
                  <th className="text-right px-4 py-3 font-medium">Current</th>
                  <th className="text-right px-4 py-3 font-medium">Invested</th>
                  <th className="text-right px-4 py-3 font-medium">Value</th>
                  <th className="text-right px-5 py-3 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdingsWithCalc.map((h) => (
                  <tr key={h.ticker} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-sm">{h.ticker}</div>
                      <div className="text-xs text-muted-foreground">{h.name}</div>
                    </td>
                    <td className="text-right px-4 py-3">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{TYPE_LABELS[h.type] || h.type}</span>
                    </td>
                    <td className="text-right px-4 py-3 text-sm">{h.quantity % 1 === 0 ? h.quantity : h.quantity.toFixed(3)}</td>
                    <td className="text-right px-4 py-3 text-sm">₹{h.avgBuyPrice.toFixed(2)}</td>
                    <td className="text-right px-4 py-3 text-sm">₹{h.currentPrice.toFixed(2)}</td>
                    <td className="text-right px-4 py-3 text-sm">₹{h.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="text-right px-4 py-3 text-sm font-medium">₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className={`text-right px-5 py-3 text-sm font-bold ${h.absoluteReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {h.absoluteReturn >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(h.percentReturn)}
                      </div>
                      <div className="text-xs font-medium">{formatINR(h.absoluteReturn)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Cash Available</span>
          <span className="font-black text-green-700">{formatINRFull(cash)}</span>
        </div>
      </div>
    </div>
  );
}
