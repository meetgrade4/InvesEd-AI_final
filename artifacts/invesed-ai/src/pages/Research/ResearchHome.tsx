import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown, Building2, Landmark, BookMarked } from 'lucide-react';
import { mockStocks, mockMutualFunds, mockPMSSchemes, mockBankSchemes } from '../../data/marketData';
import { formatINR, formatPercent } from '../../utils/formatters';
import { useUser } from '../../context/UserContext';

type Tab = 'stocks' | 'funds' | 'pms' | 'bank' | 'starred';

export default function ResearchHome() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('stocks');
  const { userProfile } = useUser();

  const watchlist = userProfile?.watchlist ?? [];

  const filteredStocks = mockStocks.filter(s =>
    s.ticker.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredFunds = mockMutualFunds.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.amcName.toLowerCase().includes(query.toLowerCase())
  );
  const filteredPMS = mockPMSSchemes.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.provider.toLowerCase().includes(query.toLowerCase())
  );
  const filteredBank = mockBankSchemes.filter(b =>
    b.schemeName.toLowerCase().includes(query.toLowerCase()) ||
    b.bankName.toLowerCase().includes(query.toLowerCase())
  );

  const starredStocks = mockStocks.filter(s => watchlist.includes(s.ticker));
  const starredFunds = mockMutualFunds.filter(f => watchlist.includes(f.code));

  const tabs: { key: Tab; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: 'stocks', label: 'NSE Stocks', count: filteredStocks.length, icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'funds', label: 'Mutual Funds', count: filteredFunds.length, icon: <Building2 className="w-3.5 h-3.5" /> },
    { key: 'pms', label: 'PMS', count: filteredPMS.length, icon: <BookMarked className="w-3.5 h-3.5" /> },
    { key: 'bank', label: 'Bank Schemes', count: filteredBank.length, icon: <Landmark className="w-3.5 h-3.5" /> },
    { key: 'starred', label: 'Starred', count: starredStocks.length + starredFunds.length, icon: <Star className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary mb-1 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Research Lab
        </h1>
        <p className="text-sm text-muted-foreground">Deep-dive into stocks, mutual funds, PMS and bank schemes with AI-powered risk analysis</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks, funds, PMS, bank schemes..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring text-sm shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
              tab === t.key
                ? t.key === 'starred'
                  ? 'bg-amber-400 text-white'
                  : 'brand-gradient text-white'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Stocks */}
        {tab === 'stocks' && (
          <motion.div key="stocks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
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
                      <div className="flex items-center gap-1.5">
                        <div className="font-bold text-sm">{stock.ticker}</div>
                        {watchlist.includes(stock.ticker) && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      </div>
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
          </motion.div>
        )}

        {/* Funds */}
        {tab === 'funds' && (
          <motion.div key="funds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
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
                      <div className="flex items-center gap-1.5">
                        <div className="font-bold text-sm line-clamp-1">{fund.name}</div>
                        {watchlist.includes(fund.code) && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                      </div>
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
          </motion.div>
        )}

        {/* PMS */}
        {tab === 'pms' && (
          <motion.div key="pms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <BookMarked className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Portfolio Management Services (PMS)</span> require a minimum investment of ₹50 lakh (SEBI mandated). These are actively managed by professional fund managers. Shown for educational purposes.
              </p>
            </div>
            <div className="space-y-2">
              {filteredPMS.map((pms, i) => (
                <motion.div
                  key={pms.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="bg-white rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xs flex-shrink-0">
                        PMS
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <div className="font-bold text-sm">{pms.name}</div>
                            <div className="text-xs text-muted-foreground">{pms.provider}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-muted-foreground">Min. Investment</div>
                            <div className="font-bold text-sm text-purple-700">{formatINR(pms.minimumInvestment)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            pms.riskRating === 'Very High' ? 'bg-red-100 text-red-700'
                            : pms.riskRating === 'High' ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                          }`}>{pms.riskRating} Risk</span>
                          <span className="text-xs text-muted-foreground">{pms.strategyLabel}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">vs {pms.benchmarkIndex}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
                          <div>
                            <div className="text-xs text-muted-foreground">1Y Return</div>
                            <div className="text-xs font-bold text-green-600">+{pms.returns.oneYear}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">3Y Return</div>
                            <div className="text-xs font-bold text-green-600">+{pms.returns.threeYear}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">5Y Return</div>
                            <div className="text-xs font-bold text-green-600">+{pms.returns.fiveYear}%</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pms.aiSummary}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bank Schemes */}
        {tab === 'bank' && (
          <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-2">
              {filteredBank.map((scheme, i) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="bg-white rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Landmark className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <div className="font-bold text-sm">{scheme.schemeName}</div>
                            <div className="text-xs text-muted-foreground">{scheme.bankName}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-3xl font-black text-blue-700 leading-none">{scheme.interestRate}%</div>
                            <div className="text-xs text-muted-foreground">p.a.</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{scheme.typeLabel}</span>
                          <span className="text-xs text-muted-foreground">{scheme.tenure}</span>
                          {scheme.seniorCitizenBenefit > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">+{scheme.seniorCitizenBenefit}% for Seniors</span>
                          )}
                          {scheme.isInsured && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">DICGC Insured</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="text-xs text-muted-foreground">Min: <span className="font-semibold text-foreground">₹{scheme.minDeposit.toLocaleString('en-IN')}</span></div>
                          <div className="text-xs text-muted-foreground">Rating: <span className={`font-semibold ${scheme.creditRating.startsWith('AAA') ? 'text-green-600' : scheme.creditRating.startsWith('AA') ? 'text-amber-600' : 'text-orange-600'}`}>{scheme.creditRating}</span></div>
                          <div className="text-xs text-muted-foreground hidden sm:inline">by {scheme.ratingAgency}</div>
                        </div>
                        {scheme.specialFeatures.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {scheme.specialFeatures.slice(0, 2).map((f, fi) => (
                              <span key={fi} className="text-xs bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Starred */}
        {tab === 'starred' && (
          <motion.div key="starred" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {watchlist.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-bold text-muted-foreground mb-1">No starred items yet</h3>
                <p className="text-sm text-muted-foreground">Open any stock or fund and tap the star icon to save it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {starredStocks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Stocks</h3>
                    <div className="space-y-2">
                      {starredStocks.map((stock, i) => (
                        <motion.div key={stock.ticker} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <Link href={`/research/${stock.ticker}`}>
                            <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-center gap-4 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                                {stock.ticker.slice(0, 3)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <div className="font-bold text-sm">{stock.ticker}</div>
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                </div>
                                <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-sm">₹{stock.currentPrice.toLocaleString('en-IN')}</div>
                                <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${stock.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {stock.dayChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {formatPercent(stock.dayChangePercent)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {starredFunds.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mutual Funds</h3>
                    <div className="space-y-2">
                      {starredFunds.map((fund, i) => (
                        <motion.div key={fund.code} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <Link href={`/research/fund/${fund.code}`}>
                            <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-center gap-4 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer">
                              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center font-bold text-secondary text-xs flex-shrink-0">
                                MF
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <div className="font-bold text-sm line-clamp-1">{fund.name}</div>
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                                </div>
                                <div className="text-xs text-muted-foreground">{fund.amcName}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-sm">₹{fund.nav.toFixed(2)}</div>
                                <div className="text-xs font-bold text-green-600">+{fund.returns.fiveYear}% 5Y</div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
