import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Star, Plus } from 'lucide-react';
import { getStockByTicker } from '../../data/marketData';
import { formatINR, formatPercent } from '../../utils/formatters';
import InvestModal from '../../components/InvestModal';
import { useUser } from '../../context/UserContext';

const TABS = ['Overview', 'Fundamentals', 'Risk Profile', 'Analyst View', 'News'];

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const [activeTab, setActiveTab] = useState('Overview');
  const [chartPeriod, setChartPeriod] = useState('6M');
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const { userProfile, addToWatchlist, removeFromWatchlist, logResearchView } = useUser();

  const stock = ticker ? getStockByTicker(ticker) : null;
  const isStarred = ticker ? (userProfile?.watchlist ?? []).includes(ticker) : false;

  useEffect(() => {
    if (stock && ticker) {
      logResearchView(ticker, stock.name, 'stock');
    }
  }, [ticker, stock?.name]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!stock) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Stock Not Found</h2>
        <Link href="/research"><button className="text-secondary hover:underline">Back to Research</button></Link>
      </div>
    );
  }

  const isPositive = stock.dayChangePercent >= 0;

  const periodData = {
    '1W': stock.priceHistory.slice(-7),
    '1M': stock.priceHistory.slice(-30),
    '6M': stock.priceHistory.slice(-180),
    '1Y': stock.priceHistory.slice(-365),
  }[chartPeriod] || stock.priceHistory.slice(-90);

  const riskRadarData = [
    { subject: 'Volatility', value: stock.riskProfile.volatilityRisk * 10 },
    { subject: 'Business', value: stock.riskProfile.businessRisk * 10 },
    { subject: 'Financial', value: stock.riskProfile.financialRisk * 10 },
    { subject: 'Regulatory', value: stock.riskProfile.regulatoryRisk * 10 },
    { subject: 'Sentiment', value: Math.max(0, (50 - stock.riskProfile.sentimentScore / 2)) },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <InvestModal
        isOpen={investModalOpen}
        onClose={() => setInvestModalOpen(false)}
        defaultTicker={ticker}
      />
      <Link href="/research">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Research
        </button>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black">{stock.ticker}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{stock.exchange}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">{stock.name}</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black">₹{stock.currentPrice.toLocaleString('en-IN')}</div>
              <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>₹{Math.abs(stock.dayChange).toFixed(2)}</span>
                <span>({formatPercent(stock.dayChangePercent)})</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => ticker && (isStarred ? removeFromWatchlist(ticker) : addToWatchlist(ticker))}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${
                isStarred
                  ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                  : 'border-border hover:bg-muted'
              }`}
              title={isStarred ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star className={`w-4 h-4 transition-colors ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
            </button>
            <button
              onClick={() => setInvestModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Invest
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
          <div><div className="text-xs text-muted-foreground">52W High</div><div className="font-bold text-sm">₹{stock.week52High.toLocaleString('en-IN')}</div></div>
          <div><div className="text-xs text-muted-foreground">52W Low</div><div className="font-bold text-sm">₹{stock.week52Low.toLocaleString('en-IN')}</div></div>
          <div><div className="text-xs text-muted-foreground">Market Cap</div><div className="font-bold text-sm">{formatINR(stock.marketCap)}</div></div>
          <div className="hidden sm:block"><div className="text-xs text-muted-foreground">Sector</div><div className="font-bold text-sm">{stock.sector}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 bg-white rounded-xl border border-border p-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex gap-2 mb-4">
            {['1W', '1M', '6M', '1Y'].map(p => (
              <button key={p} onClick={() => setChartPeriod(p)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${chartPeriod === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{p}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={periodData}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#1B6B3A' : '#dc2626'} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isPositive ? '#1B6B3A' : '#dc2626'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toFixed(0)}`} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => [`₹${v.toFixed(2)}`, 'Price']} />
              <Area type="monotone" dataKey="price" stroke={isPositive ? '#1B6B3A' : '#dc2626'} fill="url(#stockGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'Fundamentals' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'P/E Ratio', value: stock.fundamentals.pe.toFixed(1), benchmark: `Industry: ${stock.riskProfile.industryPeMedian}` },
              { label: 'P/B Ratio', value: stock.fundamentals.pb.toFixed(1) },
              { label: 'EPS', value: `₹${stock.fundamentals.eps.toFixed(1)}` },
              { label: 'Revenue Growth (3Y)', value: `${stock.fundamentals.revenueGrowth3Y}%`, positive: stock.fundamentals.revenueGrowth3Y > 10 },
              { label: 'Net Profit Growth (3Y)', value: `${stock.fundamentals.netProfitGrowth3Y}%`, positive: stock.fundamentals.netProfitGrowth3Y > 10 },
              { label: 'Debt/Equity', value: stock.fundamentals.debtToEquity.toFixed(2) },
              { label: 'Dividend Yield', value: `${stock.fundamentals.dividendYield}%` },
              { label: 'ROE', value: `${stock.fundamentals.roe}%`, positive: stock.fundamentals.roe > 15 },
              { label: 'ROCE', value: `${stock.fundamentals.roce}%`, positive: stock.fundamentals.roce > 15 },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className={`font-bold text-sm ${m.positive === true ? 'text-green-600' : m.positive === false ? 'text-red-600' : 'text-foreground'}`}>
                  {m.value}
                </div>
                {m.benchmark && <div className="text-xs text-muted-foreground mt-0.5">{m.benchmark}</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center text-sm">
            <div><div className="text-xs text-muted-foreground">Promoter</div><div className="font-bold">{stock.promoterHolding}%</div></div>
            <div><div className="text-xs text-muted-foreground">FII</div><div className="font-bold">{stock.fiiHolding}%</div></div>
            <div><div className="text-xs text-muted-foreground">DII</div><div className="font-bold">{stock.diiHolding}%</div></div>
          </div>
        </div>
      )}

      {activeTab === 'Risk Profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-4">Composite Risk Score</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-5xl font-black ${
                stock.riskProfile.compositeScore <= 4 ? 'text-green-600'
                : stock.riskProfile.compositeScore <= 6 ? 'text-amber-600'
                : 'text-red-600'
              }`}>
                {stock.riskProfile.compositeScore}
                <span className="text-xl font-medium text-muted-foreground">/10</span>
              </div>
              <div>
                <div className={`font-semibold ${
                  stock.riskProfile.compositeScore <= 4 ? 'text-green-600'
                  : stock.riskProfile.compositeScore <= 6 ? 'text-amber-600'
                  : 'text-red-600'
                }`}>
                  {stock.riskProfile.compositeScore <= 4 ? 'Low Risk' : stock.riskProfile.compositeScore <= 6 ? 'Moderate Risk' : 'High Risk'}
                </div>
                <div className="text-xs text-muted-foreground">Beta: {stock.riskProfile.beta} · Sentiment: {stock.riskProfile.sentimentScore > 0 ? '+' : ''}{stock.riskProfile.sentimentScore}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={riskRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="Risk" dataKey="value" stroke="#2E86AB" fill="#2E86AB" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'Analyst View' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">Analyst Consensus</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-2">
              {[
                { label: 'Buy', count: stock.analystRatings.buy, color: 'bg-green-500' },
                { label: 'Hold', count: stock.analystRatings.hold, color: 'bg-amber-500' },
                { label: 'Sell', count: stock.analystRatings.sell, color: 'bg-red-500' },
              ].map((r) => (
                <div key={r.label} className="text-center">
                  <div className={`w-12 h-12 rounded-xl ${r.color} text-white font-black text-xl flex items-center justify-center mb-1`}>{r.count}</div>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-sm"><span className="text-muted-foreground">Target Low: </span><span className="font-bold">₹{stock.analystRatings.targetLow.toLocaleString('en-IN')}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Target Median: </span><span className="font-bold text-primary">₹{stock.analystRatings.targetMedian.toLocaleString('en-IN')}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Target High: </span><span className="font-bold">₹{stock.analystRatings.targetHigh.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-xs font-semibold text-muted-foreground mb-1">AI UPSIDE POTENTIAL</div>
            <div className="text-lg font-black text-primary">
              +{(((stock.analystRatings.targetMedian - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Based on median analyst target vs current price</div>
          </div>
        </div>
      )}

      {activeTab === 'News' && (
        <div className="space-y-3">
          {stock.news.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${item.sentiment === 'positive' ? 'bg-green-500' : item.sentiment === 'negative' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground mb-1">{item.source} · {item.publishedAt}</div>
                  <div className="text-xs text-foreground/80">{item.summary}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
