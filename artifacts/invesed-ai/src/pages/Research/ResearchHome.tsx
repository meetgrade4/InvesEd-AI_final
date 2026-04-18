import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { mockStocks, mockMutualFunds } from '../../data/marketData';
import { formatINR, formatPercent } from '../../utils/formatters';

export default function ResearchHome() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'stocks' | 'funds'>('stocks');

  const filteredStocks = mockStocks.filter(s =>
    s.ticker.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredFunds = mockMutualFunds.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.amcName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary mb-1 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Research Lab
        </h1>
        <p className="text-sm text-muted-foreground">Deep-dive into stocks and mutual funds with AI-powered risk analysis</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks, mutual funds..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring text-sm shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('stocks')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'stocks' ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'}`}
        >
          NSE Stocks ({filteredStocks.length})
        </button>
        <button
          onClick={() => setTab('funds')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'funds' ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'}`}
        >
          Mutual Funds ({filteredFunds.length})
        </button>
      </div>

      {/* Stocks */}
      {tab === 'stocks' && (
        <div className="space-y-2">
          {filteredStocks.map((stock, i) => (
            <motion.div
              key={stock.ticker}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/research/${stock.ticker}`}>
                <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                    {stock.ticker.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm">₹{stock.currentPrice.toLocaleString('en-IN')}</div>
                    <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${stock.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.dayChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(stock.dayChangePercent)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-xs text-muted-foreground">Risk</div>
                    <div className={`text-xs font-bold ${
                      stock.riskProfile.compositeScore <= 4 ? 'text-green-600'
                      : stock.riskProfile.compositeScore <= 6 ? 'text-amber-600'
                      : 'text-red-600'
                    }`}>
                      {stock.riskProfile.compositeScore}/10
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden md:block">
                    <div className="text-xs text-muted-foreground">Sector</div>
                    <div className="text-xs font-medium">{stock.sector}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Funds */}
      {tab === 'funds' && (
        <div className="space-y-2">
          {filteredFunds.map((fund, i) => (
            <motion.div
              key={fund.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/research/fund/${fund.code}`}>
                <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center font-bold text-secondary text-xs flex-shrink-0">
                    MF
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm line-clamp-1">{fund.name}</div>
                    <div className="text-xs text-muted-foreground">{fund.amcName} · {fund.subCategory}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm">₹{fund.nav.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">NAV</div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-xs text-muted-foreground">5Y Returns</div>
                    <div className="text-xs font-bold text-green-600">+{fund.returns.fiveYear}%</div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden md:block">
                    <div className="text-xs text-muted-foreground">Risk</div>
                    <div className={`text-xs font-semibold ${
                      fund.riskRating === 'Low' || fund.riskRating === 'Moderate' ? 'text-green-600'
                      : fund.riskRating === 'Moderately High' ? 'text-amber-600'
                      : 'text-red-600'
                    }`}>
                      {fund.riskRating}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
