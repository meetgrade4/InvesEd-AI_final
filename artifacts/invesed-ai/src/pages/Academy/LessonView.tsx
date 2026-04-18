import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap, BookOpen, CheckCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { XPToast } from '../../components/gamification/XPToast';

const SIPCalculator = () => {
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const totalInvested = monthly * years * 12;
  const months = years * 12;
  const r = rate / 100 / 12;
  const futureValue = r > 0 ? monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r) : monthly * months;
  const gains = futureValue - totalInvested;
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-6">
      <h4 className="font-bold text-primary mb-4 flex items-center gap-2"><span>📊</span> SIP Calculator</h4>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">Monthly SIP</span><span className="font-bold text-primary">₹{monthly.toLocaleString('en-IN')}</span></div>
          <input type="range" min={100} max={50000} step={100} value={monthly} onChange={e => setMonthly(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">Duration</span><span className="font-bold text-primary">{years} years</span></div>
          <input type="range" min={1} max={30} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">Expected Return</span><span className="font-bold text-primary">{rate}% p.a.</span></div>
          <input type="range" min={4} max={24} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white rounded-xl border border-border"><div className="text-xs text-muted-foreground mb-1">Invested</div><div className="font-bold text-sm">₹{(totalInvested / 100000).toFixed(1)}L</div></div>
        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200"><div className="text-xs text-green-600 mb-1">Gains</div><div className="font-bold text-sm text-green-700">₹{(gains / 100000).toFixed(1)}L</div></div>
        <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/20"><div className="text-xs text-primary mb-1">Corpus</div><div className="font-bold text-sm text-primary">₹{(futureValue / 100000).toFixed(1)}L</div></div>
      </div>
    </div>
  );
};

const CompoundCalc = () => {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const result = principal * Math.pow(1 + rate / 100, years);
  const gains = result - principal;
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-6">
      <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2"><span>🔢</span> Compound Interest Calculator</h4>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">Principal Amount</span><span className="font-bold text-green-700">₹{principal.toLocaleString('en-IN')}</span></div>
          <input type="range" min={1000} max={500000} step={1000} value={principal} onChange={e => setPrincipal(+e.target.value)} className="w-full accent-green-600" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">Annual Interest Rate</span><span className="font-bold text-green-700">{rate}%</span></div>
          <input type="range" min={2} max={25} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-green-600" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">Duration</span><span className="font-bold text-green-700">{years} years</span></div>
          <input type="range" min={1} max={30} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-green-600" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-xl border border-border"><div className="text-xs text-muted-foreground mb-1">Invested</div><div className="font-bold">₹{principal.toLocaleString('en-IN')}</div></div>
        <div className="text-center p-3 bg-green-100 rounded-xl border border-green-300"><div className="text-xs text-green-700 mb-1">Final Value</div><div className="font-bold text-green-700">₹{Math.round(result).toLocaleString('en-IN')}</div><div className="text-xs text-green-600">+₹{Math.round(gains).toLocaleString('en-IN')}</div></div>
      </div>
    </div>
  );
};

interface LessonMeta {
  title: string; duration: number; content: string; keyTakeaway: string; xp: number;
  showSIPCalc?: boolean; showCompoundCalc?: boolean;
}

const LESSON_CONTENT: Record<string, LessonMeta> = {
  'CF1-L1': {
    title: 'Why Your Pocket Money Matters', duration: 5, xp: 30,
    keyTakeaway: 'Money is a tool — how you treat ₹100 today shapes how you handle ₹1,00,000 tomorrow.',
    content: `Money is more than just paper. Every rupee you receive is a decision waiting to be made.

Most teens see pocket money as "spending money." But every rupee you don't spend is a rupee working for you. The habits you build with ₹500 per month will determine how you handle your first salary.

Think about it this way: if you get ₹2,000 per month and save just 25% (₹500), that's ₹6,000 per year. Over 5 years, that's ₹30,000 before even counting returns. Now imagine that ₹30,000 invested at 12% per year for another 10 years — it becomes over ₹93,000.

Warren Buffett started saving at age 6. Rakesh Jhunjhunwala made his first investment at 20 with just ₹5,000. Your journey starts now — with whatever you have.

The point isn't the amount. The point is the habit.`,
  },
  'CF1-L2': {
    title: 'The Magic of Saving Early', duration: 6, xp: 35, showSIPCalc: true,
    keyTakeaway: 'Starting 10 years early can give you 2× the wealth at retirement — this is the power of compounding time.',
    content: `Time is the most powerful financial force available to you. And right now, at this age, you have more of it than almost anyone else.

Let's compare two friends:
Aditi starts investing ₹1,000/month at age 16 and stops at 26 (invests for 10 years only).
Rohan starts investing ₹1,000/month at age 26 and continues until 60 (invests for 34 years).

Assuming 12% annual returns:
Aditi's total investment: ₹1,20,000. Aditi's corpus at 60: ₹1.27 Crore.
Rohan's total investment: ₹4,08,000. Rohan's corpus at 60: ₹60 Lakh.

Aditi invested 3.4× less money but ended up with more than twice as much — just by starting 10 years earlier.

This isn't a trick. It's mathematics. Try the SIP calculator below to run your own numbers.`,
  },
  'CF1-L3': {
    title: 'Compound Interest — The 8th Wonder', duration: 8, xp: 40, showCompoundCalc: true,
    keyTakeaway: 'Compound interest earns returns on your returns — making your money grow exponentially, not linearly.',
    content: `Albert Einstein allegedly called compound interest "the eighth wonder of the world." Whether or not he said it, the math proves it.

Simple Interest: ₹10,000 at 10% = ₹1,000 per year, every year. After 10 years: ₹20,000.

Compound Interest: ₹10,000 at 10% compounded annually.
Year 1: ₹11,000. Year 2: ₹12,100 (not ₹12,000). Year 5: ₹16,105. Year 10: ₹25,937.

The extra ₹5,937 comes from earning interest on interest — that's compounding.

The formula: A = P × (1 + r)^n
P = Principal, r = Annual interest rate, n = Years, A = Final amount.

In Indian investing, mutual funds and stocks compound over time. The Nifty 50 has delivered roughly 12-14% CAGR over the past 20 years. ₹10,000 invested in a Nifty 50 index fund in 2004 would be worth over ₹1.1 lakh today — from just ₹10,000.

Try the calculator below to see compounding in action.`,
  },
  'CF1-L4': {
    title: 'Time Value of Money', duration: 5, xp: 30,
    keyTakeaway: '₹1,000 today is always worth more than ₹1,000 in the future — inflation and opportunity cost explain why.',
    content: `Here's a simple question: Would you prefer ₹1,000 today or ₹1,000 one year from now?

If you chose today — you already understand the Time Value of Money (TVM).

Why is money today more valuable?
1. Inflation: ₹1,000 today can buy more than ₹1,000 next year because prices rise every year.
2. Opportunity Cost: Money today can be invested and grow.
3. Risk: The future is uncertain — ₹1,000 promised is not the same as ₹1,000 in hand.

Real example: India's inflation runs at roughly 5-6% per year. So ₹1,000 today = ₹1,060 worth of buying power next year. If someone promises you ₹1,000 next year with no interest, they're giving you less in real terms.

This is why Fixed Deposits offer interest — they're compensating you for the time value of your money.

In investing, we use Discounted Cash Flow (DCF) to figure out what future money is worth today. But the key insight is simple: invest early, invest often, let time do the heavy lifting.`,
  },
  'CF1-L5': {
    title: 'Building Your First Budget', duration: 4, xp: 25,
    keyTakeaway: 'The 50-30-20 rule: 50% needs, 30% wants, 20% savings & investments. Start with even ₹100/month.',
    content: `A budget isn't about restriction — it's about intention. Knowing where your money goes is the first step to making it grow.

The 50-30-20 Rule (adapted for Indian teens):
50% for Needs: School essentials, food, transport.
30% for Wants: Entertainment, eating out, gadgets, outings.
20% for Saving/Investing: The most important category — your future.

If you get ₹3,000/month pocket money:
₹1,500 → Needs. ₹900 → Wants. ₹600 → Savings/Investments.

₹600/month invested at 12% over 5 years = ₹49,000 from just ₹36,000 invested.

Practical steps to start your budget:
1. Track every expense for one week (use your phone's Notes app).
2. Categorise each expense: need or want?
3. Find one "want" you can reduce by just 20%.
4. Put that freed-up money into a bank Recurring Deposit or SIP.

The goal isn't perfection. The goal is starting — and then being consistent.`,
  },
  'CF2-L1': {
    title: 'Inflation — The Silent Thief', duration: 5, xp: 30,
    keyTakeaway: 'Inflation silently erodes your purchasing power — money sitting idle loses real value every single year.',
    content: `Imagine your dad bought a Maruti 800 for ₹2.5 lakh in 2000. A similar entry-level car today costs ₹6-7 lakh. That's inflation — the general rise in prices over time.

In India, the Consumer Price Index (CPI) inflation has averaged 5-6% annually over the past decade. This means prices roughly double every 12-14 years.

What this means for your ₹1,00,000 sitting in cash:
Year 0: Worth ₹1,00,000 in buying power.
Year 5: Still ₹1,00,000 in your account, but only buys ₹78,000 worth of today's goods.
Year 10: Still ₹1,00,000 but buys only ₹61,000 worth of today's goods.
Year 20: Still ₹1,00,000 but buys only ₹38,000 worth of today's goods.

Your money didn't decrease. But its purchasing power did — by 62% in 20 years.

This is why the Reserve Bank of India (RBI) targets 4% inflation and adjusts interest rates accordingly. When inflation rises, the RBI raises rates to slow it.

The fundamental reason to invest beyond a savings account: your returns must beat inflation to build real wealth.`,
  },
  'CF2-L2': {
    title: 'Why FD Alone Is Not Enough', duration: 6, xp: 35,
    keyTakeaway: 'Bank FD at 7% with 6% inflation and 2% tax = only 1% real return. Barely enough to protect wealth, let alone grow it.',
    content: `Fixed Deposits (FDs) are India's most popular savings instrument. Every Indian household has one. But here's the truth most people don't talk about.

Current SBI FD rates (2026): 6.5–7.0% per annum.
India's current inflation: ~5.5–6%.
Tax on FD interest (30% tax bracket): ~2%.

Real Return on FD = FD Rate − Inflation − Tax
= 7% − 6% − 2% = −1%

In real terms, if you're in a higher tax bracket, you are LOSING money in a bank FD.

Compare this to the Nifty 50 (India's benchmark stock index):
5-year return: ~16% p.a. 10-year return: ~13% p.a. 20-year return: ~14% p.a.

After inflation (~6%) and long-term capital gains tax (10%), the real return from Nifty 50 is still ~7% per year — 7x better than an FD in real terms.

This doesn't mean FDs are bad. They serve a specific purpose:
✅ Emergency fund: 3–6 months of expenses in an FD.
✅ Short-term goals: Under 2 years away.
❌ Long-term wealth creation: Over 5 years — equity beats FD consistently.

The right portfolio for a teenager: 80–90% equity (stocks/MFs) + 10–20% in FDs/PPF for safety. Gradually shift toward more debt as you age.`,
  },
  'CF2-L3': {
    title: 'Asset Classes Overview', duration: 7, xp: 40,
    keyTakeaway: 'Equity for long-term growth, debt for safety, gold for inflation hedge — different goals need different asset classes.',
    content: `Not all investments are the same. They fall into distinct "asset classes," each with different risk-return characteristics.

EQUITY (Stocks & Equity Mutual Funds):
What: Ownership in companies. Risk: High (prices fluctuate daily).
Expected Return: 12–15% p.a. over 10+ years. Best for: Long-term goals (5+ years).
Examples: RELIANCE, TCS, Nifty 50 Index Fund, Parag Parikh Flexi Cap.

DEBT (FDs, Bonds, Debt Mutual Funds):
What: Lending money to companies or the government. Risk: Low.
Expected Return: 6–8% p.a. Best for: Short-term goals, emergency fund, stability.
Examples: SBI FD, PPF, liquid mutual funds, RBI Bonds.

GOLD:
What: Physical or digital gold. Risk: Medium.
Expected Return: 8–10% p.a. historically. Best for: Inflation hedge, 5–10% portfolio allocation.
Examples: Sovereign Gold Bonds (SGBs), Gold ETFs, Digital Gold.

REAL ESTATE:
What: Property investments. Risk: Medium (illiquid).
Expected Return: 8–12% p.a. in growing cities.
Note: REITs (Real Estate Investment Trusts) let you invest with small amounts on stock exchanges.

INTERNATIONAL EQUITY:
What: Shares in global companies (Apple, Google, Amazon).
Risk: Medium-High. Expected Return: 10–14% p.a. Best for: Diversification beyond India.

For a teenager: Start with equity mutual funds (Nifty 50 index fund). Add a small Sovereign Gold Bond allocation (5–10%). Keep 2–3 months expenses in savings/FD. Explore international funds after building the basics.`,
  },
  'CF2-L4': {
    title: 'Risk & Time — The Trade-off', duration: 6, xp: 35,
    keyTakeaway: 'Time in the market beats timing the market. A longer horizon makes equity investing dramatically safer.',
    content: `Here's a myth: "Stocks are risky because prices fall." Here's the truth: Stocks are only risky in the short term. Over time, equity markets have always recovered and grown.

Nifty 50 historical data (probability of negative returns):
Any random 1-year period: ~30% chance of loss.
Any random 3-year period: ~15% chance of loss.
Any random 5-year period: ~7% chance of loss.
Any random 10-year period: ~2% chance of loss.
Any random 15+ year period: ~0% chance of loss (historically zero).

This is why your investment horizon matters more than which stock you pick.

The Risk-Time Trade-off in practice:
Short horizon (under 2 years) → Low risk: FD, liquid funds, RD.
Medium horizon (2–5 years) → Mixed: hybrid mutual funds, large-cap stocks.
Long horizon (5+ years) → Higher risk for higher return: equity, mid-caps.

As a teenager, you have the most powerful investing tool: TIME. A 16-year-old investing until 60 has 44 years. Even if the market crashes 50% (like COVID in March 2020), a patient investor who held on recovered fully within 18 months and went on to earn strong returns.

The real risk isn't market volatility — it's selling in panic during a crash. That's when paper losses become real losses.`,
  },
  'CF4-L4': {
    title: 'SIP — Rupee Cost Averaging', duration: 8, xp: 45, showSIPCalc: true,
    keyTakeaway: 'SIP automatically buys more units when prices fall — making market dips work in your favour through Rupee Cost Averaging.',
    content: `A Systematic Investment Plan (SIP) is simply investing a fixed amount at fixed intervals in a mutual fund — like ₹500 every month.

The magic is called Rupee Cost Averaging (RCA).

When the market is high → your ₹500 buys fewer units.
When the market is low (which scares most investors) → your ₹500 buys MORE units.

Example: ₹1,000/month SIP over 3 months:
Month 1: NAV = ₹100, units bought = 10.
Month 2: Market falls, NAV = ₹80, units bought = 12.5.
Month 3: Market recovers, NAV = ₹110, units bought = 9.09.
Total invested: ₹3,000. Total units: 31.59. Your average cost: ₹94.96.
Average NAV across 3 months: ₹96.67.

You automatically beat the average market price — just by being consistent.

This is why market dips are actually a gift for SIP investors. While everyone else panics, your SIP keeps buying more units at lower prices.

Use the calculator below to see what consistent SIPs can grow to over time.`,
  },
};

export default function LessonView() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const { markLessonComplete, completedLessons } = useUser();
  const [justCompleted, setJustCompleted] = useState(false);

  const lesson = lessonId ? LESSON_CONTENT[lessonId] : null;
  const isAlreadyDone = lessonId ? completedLessons.includes(lessonId) : false;
  const isDone = justCompleted || isAlreadyDone;

  const handleComplete = () => {
    if (isDone || !lesson || !lessonId || !moduleId) return;
    markLessonComplete(lessonId, moduleId, lesson.xp);
    toast.custom(<XPToast amount={lesson.xp} message="Lesson Complete!" />);
    setJustCompleted(true);
  };

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href={`/academy/${moduleId}`}>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Module
          </button>
        </Link>
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Content Coming Soon</h2>
          <p className="text-muted-foreground text-sm mb-4">This lesson is being prepared. Check back soon!</p>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-secondary">
            <Zap className="w-4 h-4 text-amber-500" /> +30 XP available when live
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/academy/${moduleId}`}>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {moduleId}
        </button>
      </Link>

      <div className="mb-6">
        <div className="text-xs font-bold text-muted-foreground mb-1">{moduleId} · {lessonId}</div>
        <h1 className="text-2xl font-black text-foreground mb-2">{lesson.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{lesson.duration} min read</span>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 font-medium">+{lesson.xp} XP</span>
          </div>
          {isDone && (
            <><span>·</span>
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3.5 h-3.5" /><span className="font-medium">Completed</span>
            </div></>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="space-y-4">
          {lesson.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-foreground/90 leading-relaxed">{para}</p>
          ))}
        </div>
        {lesson.showSIPCalc && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SIPCalculator />
          </motion.div>
        )}
        {lesson.showCompoundCalc && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <CompoundCalc />
          </motion.div>
        )}
      </div>

      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-6">
        <div className="text-xs font-bold text-secondary mb-1">KEY TAKEAWAY</div>
        <p className="text-sm font-medium text-foreground">{lesson.keyTakeaway}</p>
      </div>

      <motion.button
        whileHover={!isDone ? { scale: 1.01 } : {}}
        whileTap={!isDone ? { scale: 0.99 } : {}}
        onClick={handleComplete}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          isDone ? 'bg-green-500 text-white cursor-default' : 'brand-gradient text-white shadow-lg cursor-pointer'
        }`}
      >
        {isDone
          ? <><CheckCircle className="w-5 h-5" /> Completed! +{lesson.xp} XP earned</>
          : <>Mark Complete & Claim {lesson.xp} XP <Zap className="w-5 h-5 text-amber-300 fill-amber-300" /></>
        }
      </motion.button>

      {isDone && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
          <Link href={`/academy/${moduleId}`}>
            <button className="flex items-center gap-1.5 text-secondary font-semibold text-sm mx-auto hover:underline">
              Back to Module <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
