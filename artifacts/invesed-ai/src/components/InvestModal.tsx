import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Search, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import { mockStocks } from '../data/marketData';
import { formatINRFull } from '../utils/formatters';
import { useUser } from '../context/UserContext';
import type { PortfolioHolding } from '../context/UserContext';
import toast from 'react-hot-toast';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTicker?: string;
}

type Step = 'select' | 'configure' | 'confirm' | 'success';
type Category = 'stocks' | 'mutual_funds' | 'bank_fd' | 'nps_ppf' | 'pms';

interface Instrument {
  ticker: string;
  name: string;
  currentPrice: number;
  dayChangePercent: number;
  type: PortfolioHolding['type'];
  sector?: string;
  category: Category;
  returnRate?: number;
  minQty?: number;
  unitLabel?: string;
  badge?: string;
  badgeColor?: string;
}

const STOCK_INSTRUMENTS: Instrument[] = mockStocks.map(s => ({
  ticker: s.ticker, name: s.name, currentPrice: s.currentPrice,
  dayChangePercent: s.dayChangePercent, type: 'stock', sector: s.sector, category: 'stocks',
}));

const MF_INSTRUMENTS: Instrument[] = [
  { ticker: 'SBI-NIFTY50-IDX', name: 'SBI Nifty 50 Index Fund', currentPrice: 182.45, dayChangePercent: 0.42, type: 'mutualfund', sector: 'Index', category: 'mutual_funds', badge: 'Index', badgeColor: 'bg-blue-100 text-blue-700' },
  { ticker: 'PPFAS-FLEXI', name: 'Parag Parikh Flexi Cap Fund', currentPrice: 78.32, dayChangePercent: 0.88, type: 'mutualfund', sector: 'Equity', category: 'mutual_funds', badge: 'Flexi Cap', badgeColor: 'bg-purple-100 text-purple-700' },
  { ticker: 'MIRAE-EMRG', name: 'Mirae Emerging Bluechip Fund', currentPrice: 105.60, dayChangePercent: -0.31, type: 'mutualfund', sector: 'Mid Cap', category: 'mutual_funds', badge: 'Mid Cap', badgeColor: 'bg-orange-100 text-orange-700' },
  { ticker: 'AXIS-SMALL', name: 'Axis Small Cap Fund', currentPrice: 93.20, dayChangePercent: 1.15, type: 'mutualfund', sector: 'Small Cap', category: 'mutual_funds', badge: 'Small Cap', badgeColor: 'bg-red-100 text-red-700' },
  { ticker: 'HDFC-ELSS', name: 'HDFC ELSS Tax Saver', currentPrice: 122.75, dayChangePercent: 0.53, type: 'mutualfund', sector: 'ELSS', category: 'mutual_funds', badge: 'Tax Saving', badgeColor: 'bg-green-100 text-green-700' },
];

const BANK_FD_INSTRUMENTS: Instrument[] = [
  { ticker: 'SBI-FD-1Y', name: 'SBI Fixed Deposit (1 Year)', currentPrice: 1000, dayChangePercent: 0, type: 'bank_fd', category: 'bank_fd', returnRate: 6.8, minQty: 1, unitLabel: '₹1,000 unit', badge: '6.8% p.a.', badgeColor: 'bg-blue-100 text-blue-700' },
  { ticker: 'HDFC-FD-2Y', name: 'HDFC Bank FD (2 Years)', currentPrice: 1000, dayChangePercent: 0, type: 'bank_fd', category: 'bank_fd', returnRate: 7.2, minQty: 1, unitLabel: '₹1,000 unit', badge: '7.2% p.a.', badgeColor: 'bg-blue-100 text-blue-700' },
  { ticker: 'ICICI-FD-3Y', name: 'ICICI Bank FD (3 Years)', currentPrice: 1000, dayChangePercent: 0, type: 'bank_fd', category: 'bank_fd', returnRate: 7.1, minQty: 1, unitLabel: '₹1,000 unit', badge: '7.1% p.a.', badgeColor: 'bg-blue-100 text-blue-700' },
  { ticker: 'POST-FD-5Y', name: 'Post Office Time Deposit (5Y)', currentPrice: 1000, dayChangePercent: 0, type: 'bank_fd', category: 'bank_fd', returnRate: 7.5, minQty: 1, unitLabel: '₹1,000 unit', badge: '7.5% p.a.', badgeColor: 'bg-blue-100 text-blue-700' },
  { ticker: 'BAJAJ-FD-1Y', name: 'Bajaj Finance FD (1 Year)', currentPrice: 1000, dayChangePercent: 0, type: 'bank_fd', category: 'bank_fd', returnRate: 8.1, minQty: 1, unitLabel: '₹1,000 unit', badge: '8.1% p.a.', badgeColor: 'bg-green-100 text-green-700' },
];

const NPS_PPF_INSTRUMENTS: Instrument[] = [
  { ticker: 'PPF', name: 'Public Provident Fund (PPF)', currentPrice: 500, dayChangePercent: 0, type: 'ppf', category: 'nps_ppf', returnRate: 7.1, minQty: 1, unitLabel: '₹500 unit', badge: '7.1% tax-free', badgeColor: 'bg-green-100 text-green-700' },
  { ticker: 'NPS-EQUITY', name: 'NPS Tier 1 — Equity (E) Scheme', currentPrice: 500, dayChangePercent: 0.32, type: 'nps', category: 'nps_ppf', returnRate: 12.5, minQty: 1, unitLabel: '₹500 unit', badge: '~12.5% hist.', badgeColor: 'bg-amber-100 text-amber-700' },
  { ticker: 'NPS-CORP', name: 'NPS Tier 1 — Corporate Bonds (C)', currentPrice: 500, dayChangePercent: 0.12, type: 'nps', category: 'nps_ppf', returnRate: 8.4, minQty: 1, unitLabel: '₹500 unit', badge: '8.4% hist.', badgeColor: 'bg-blue-100 text-blue-700' },
  { ticker: 'NPS-GOVT', name: 'NPS Tier 1 — Government Bonds (G)', currentPrice: 500, dayChangePercent: 0.08, type: 'nps', category: 'nps_ppf', returnRate: 7.8, minQty: 1, unitLabel: '₹500 unit', badge: '7.8% hist.', badgeColor: 'bg-blue-100 text-blue-700' },
];

const PMS_INSTRUMENTS: Instrument[] = [
  { ticker: 'MOTILAL-PMS', name: 'Motilal Oswal PMS — Value Strategy', currentPrice: 50000, dayChangePercent: 1.25, type: 'pms', category: 'pms', returnRate: 18.3, minQty: 1, unitLabel: '₹50,000 unit', badge: '18.3% 5Y CAGR', badgeColor: 'bg-purple-100 text-purple-700' },
  { ticker: 'KOTAK-PMS', name: 'Kotak PMS — Special Situations', currentPrice: 50000, dayChangePercent: 0.87, type: 'pms', category: 'pms', returnRate: 16.1, minQty: 1, unitLabel: '₹50,000 unit', badge: '16.1% 5Y CAGR', badgeColor: 'bg-purple-100 text-purple-700' },
  { ticker: 'SBI-PMS', name: 'SBI PMS — Multicap Strategy', currentPrice: 50000, dayChangePercent: 0.54, type: 'pms', category: 'pms', returnRate: 14.8, minQty: 1, unitLabel: '₹50,000 unit', badge: '14.8% 5Y CAGR', badgeColor: 'bg-purple-100 text-purple-700' },
  { ticker: 'ASK-PMS', name: 'ASK Investment PMS — Growth', currentPrice: 50000, dayChangePercent: 1.10, type: 'pms', category: 'pms', returnRate: 19.2, minQty: 1, unitLabel: '₹50,000 unit', badge: '19.2% 5Y CAGR', badgeColor: 'bg-green-100 text-green-700' },
];

const ALL_INSTRUMENTS: Instrument[] = [
  ...STOCK_INSTRUMENTS, ...MF_INSTRUMENTS, ...BANK_FD_INSTRUMENTS, ...NPS_PPF_INSTRUMENTS, ...PMS_INSTRUMENTS,
];

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'stocks', label: 'Stocks', emoji: '📈' },
  { key: 'mutual_funds', label: 'Mutual Funds', emoji: '🏦' },
  { key: 'bank_fd', label: 'Bank FD', emoji: '🏛️' },
  { key: 'nps_ppf', label: 'NPS / PPF', emoji: '🛡️' },
  { key: 'pms', label: 'PMS', emoji: '💼' },
];

export default function InvestModal({ isOpen, onClose, defaultTicker }: InvestModalProps) {
  const { portfolioState, buyInvestment, sellInvestment } = useUser();
  const [step, setStep] = useState<Step>(defaultTicker ? 'configure' : 'select');
  const [category, setCategory] = useState<Category>('stocks');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Instrument | null>(
    defaultTicker ? ALL_INSTRUMENTS.find(i => i.ticker === defaultTicker) || null : null
  );
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderFailed, setOrderFailed] = useState(false);

  const cash = portfolioState.cash;
  const qty = parseFloat(quantity);
  const validQty = qty > 0 && !isNaN(qty);
  const totalCost = selected && validQty ? qty * selected.currentPrice : 0;
  const canAfford = orderType === 'buy' ? totalCost <= cash : true;

  const currentHolding = selected ? portfolioState.holdings.find(h => h.ticker === selected.ticker) : null;
  const canSell = orderType === 'sell' && validQty && currentHolding ? currentHolding.quantity >= qty : false;

  const filteredInstruments = ALL_INSTRUMENTS.filter(i => {
    const matchCategory = i.category === category;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.ticker.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  function handleSelect(instrument: Instrument) {
    setSelected(instrument);
    setQuantity('');
    setStep('configure');
  }

  function handleConfirm() { setStep('confirm'); }

  function handleExecute() {
    if (!selected || !validQty) return;
    setIsProcessing(true);
    setTimeout(() => {
      let success: boolean;
      if (orderType === 'buy') {
        success = buyInvestment(selected.ticker, selected.name, qty, selected.currentPrice, selected.type, selected.sector);
      } else {
        success = sellInvestment(selected.ticker, qty, selected.currentPrice);
      }
      setIsProcessing(false);
      if (success) {
        setStep('success');
        setOrderFailed(false);
      } else {
        setOrderFailed(true);
        setStep('configure');
        toast.error(orderType === 'buy' ? 'Not enough cash!' : 'Not enough holdings to sell!');
      }
    }, 1200);
  }

  function handleClose() {
    setStep(defaultTicker ? 'configure' : 'select');
    setSelected(defaultTicker ? ALL_INSTRUMENTS.find(i => i.ticker === defaultTicker) || null : null);
    setQuantity('');
    setSearch('');
    setOrderType('buy');
    setOrderFailed(false);
    onClose();
  }

  const typeColor = (type: PortfolioHolding['type']) => {
    const m: Record<string, string> = { stock: 'bg-primary', mutualfund: 'bg-secondary', bank_fd: 'bg-blue-600', nps: 'bg-amber-600', ppf: 'bg-green-600', pms: 'bg-purple-600' };
    return m[type] || 'bg-gray-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={handleClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden" style={{ maxHeight: '90vh' }}>
              <div className="brand-gradient px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold">
                    {step === 'select' ? 'Choose Investment' :
                     step === 'configure' ? `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selected?.ticker}` :
                     step === 'confirm' ? 'Confirm Order' : 'Order Placed! 🎉'}
                  </h2>
                  <p className="text-white/70 text-xs mt-0.5">
                    {step === 'select' ? 'Stocks, MFs, FDs, NPS, PPF, PMS' :
                     step === 'configure' ? `Cash available: ${formatINRFull(cash)}` :
                     step === 'confirm' ? 'Review your virtual order' :
                     'Your portfolio has been updated'}
                  </p>
                </div>
                <button onClick={handleClose} className="text-white/80 hover:text-white p-1"><X className="w-5 h-5" /></button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 72px)' }}>
                {step === 'select' && (
                  <div className="p-4">
                    <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                      {CATEGORIES.map(cat => (
                        <button key={cat.key} onClick={() => setCategory(cat.key)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === cat.key ? 'brand-gradient text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                          <span>{cat.emoji}</span>{cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    {(category === 'bank_fd' || category === 'nps_ppf' || category === 'pms') && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-3 text-xs text-blue-700">
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          {category === 'pms' ? 'PMS requires ₹50 lakh minimum in real life. Here each "unit" = ₹50,000 for learning.' :
                           category === 'bank_fd' ? 'Each unit = ₹1,000. Buy 10 units to invest ₹10,000 in this FD.' :
                           'Each unit = ₹500. PPF & NPS are long-term government schemes.'}
                        </span>
                      </div>
                    )}
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {filteredInstruments.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No instruments found</div>}
                      {filteredInstruments.map(inst => (
                        <button key={inst.ticker} onClick={() => handleSelect(inst)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors text-left border border-transparent hover:border-border">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${typeColor(inst.type)}`}>
                              {inst.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{inst.ticker}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[160px]">{inst.name}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold">₹{inst.currentPrice.toLocaleString('en-IN')}</div>
                            {inst.returnRate ? (
                              <div className="text-xs font-semibold text-green-600">{inst.returnRate}% p.a.</div>
                            ) : (
                              <div className={`text-xs font-medium flex items-center gap-0.5 justify-end ${inst.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {inst.dayChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {inst.dayChangePercent >= 0 ? '+' : ''}{inst.dayChangePercent.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 'configure' && selected && (
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${typeColor(selected.type)}`}>
                        {selected.ticker.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{selected.ticker}</div>
                        <div className="text-xs text-muted-foreground truncate">{selected.name}</div>
                        {selected.badge && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${selected.badgeColor}`}>{selected.badge}</span>}
                      </div>
                      <button onClick={() => setStep('select')} className="text-xs text-secondary underline flex-shrink-0">Change</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/30 rounded-xl text-center">
                        <div className="text-xs text-muted-foreground">Price / Unit</div>
                        <div className="font-black text-lg">₹{selected.currentPrice.toLocaleString('en-IN')}</div>
                        {selected.unitLabel && <div className="text-xs text-muted-foreground">{selected.unitLabel}</div>}
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl text-center">
                        <div className="text-xs text-muted-foreground">Your Cash</div>
                        <div className="font-black text-lg text-green-700">{formatINRFull(cash)}</div>
                      </div>
                    </div>

                    {currentHolding && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 flex-shrink-0" />
                        You hold {currentHolding.quantity} {selected.type === 'mutualfund' ? 'units' : 'shares'} at avg ₹{currentHolding.avgBuyPrice.toFixed(2)}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold mb-2">Order Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['buy', 'sell'] as const).map(t => (
                          <button key={t} onClick={() => setOrderType(t)} className={`py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${orderType === t ? (t === 'buy' ? 'bg-green-600 text-white shadow-md' : 'bg-red-500 text-white shadow-md') : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                            {t === 'buy' ? '▲ Buy' : '▼ Sell'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Quantity {selected.unitLabel ? `(${selected.unitLabel}s)` : selected.type === 'mutualfund' ? '(units)' : '(shares)'}
                      </label>
                      <input type="number" min="1" step={selected.type === 'mutualfund' ? '0.001' : '1'}
                        value={quantity} onChange={e => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>

                    {validQty && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-xl border ${(canAfford && orderType === 'buy') || (canSell && orderType === 'sell') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total {orderType === 'buy' ? 'Cost' : 'Value'}</span>
                          <span className="font-black text-lg">{formatINRFull(totalCost)}</span>
                        </div>
                        {orderType === 'buy' && (
                          <div className="flex items-center justify-between text-xs mt-1.5">
                            <span className="text-muted-foreground">Cash after trade</span>
                            <span className={`font-semibold ${canAfford ? 'text-green-700' : 'text-red-600'}`}>
                              {canAfford ? formatINRFull(cash - totalCost) : 'Insufficient cash!'}
                            </span>
                          </div>
                        )}
                        {orderType === 'sell' && (
                          <div className="flex items-center justify-between text-xs mt-1.5">
                            <span className="text-muted-foreground">Available to sell</span>
                            <span className={`font-semibold ${canSell ? 'text-green-700' : 'text-red-600'}`}>
                              {currentHolding ? `${currentHolding.quantity} available` : 'Not in portfolio'}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {orderFailed && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {orderType === 'buy' ? 'Not enough cash for this trade.' : 'Not enough shares/units to sell.'}
                      </div>
                    )}

                    <button onClick={handleConfirm}
                      disabled={!validQty || (orderType === 'buy' && !canAfford) || (orderType === 'sell' && !canSell)}
                      className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                      Review Order →
                    </button>
                  </div>
                )}

                {step === 'confirm' && selected && (
                  <div className="p-5 space-y-4">
                    <div className={`p-4 rounded-xl border-2 ${orderType === 'buy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${orderType === 'buy' ? 'text-green-700' : 'text-red-600'}`}>
                        {orderType === 'buy' ? '▲ Buy Order' : '▼ Sell Order'}
                      </div>
                      {[
                        ['Instrument', `${selected.ticker}`],
                        ['Name', selected.name],
                        ['Quantity', `${quantity}`],
                        ['Price per unit', `₹${selected.currentPrice.toLocaleString('en-IN')}`],
                        ['Total Amount', formatINRFull(totalCost)],
                        ['Cash after trade', orderType === 'buy' ? formatINRFull(cash - totalCost) : formatINRFull(cash + totalCost)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-start justify-between text-sm gap-4 mb-2 last:mb-0">
                          <span className="text-muted-foreground flex-shrink-0">{label}</span>
                          <span className="font-semibold text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                      📌 This is a <strong>virtual paper trade</strong>. No real money is involved. Learn investing risk-free!
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setStep('configure')} className="py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">← Edit</button>
                      <button onClick={handleExecute} disabled={isProcessing}
                        className={`py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all ${orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'} disabled:opacity-60`}>
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isProcessing ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'success' && selected && (
                  <div className="p-8 text-center">
                    <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h3 className="text-xl font-black text-foreground mb-1">Order Executed!</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      Successfully {orderType === 'buy' ? 'bought' : 'sold'} <strong>{quantity}</strong> of <strong>{selected.ticker}</strong>
                    </p>
                    <div className="bg-muted/40 rounded-xl p-3 mb-2 inline-block">
                      <span className="text-2xl font-black text-primary">{formatINRFull(totalCost)}</span>
                      <div className="text-xs text-muted-foreground">{orderType === 'buy' ? 'invested' : 'received'} (virtual)</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-6">
                      Cash remaining: <strong className="text-foreground">{formatINRFull(portfolioState.cash)}</strong>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Done</button>
                      <button onClick={() => { setStep('select'); setSelected(null); setQuantity(''); setSearch(''); setOrderFailed(false); }}
                        className="flex-1 py-2.5 brand-gradient text-white rounded-xl text-sm font-bold">Trade Again</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
