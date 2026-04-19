import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Award, Zap, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { XPToast } from '../../components/gamification/XPToast';

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

const MODULE_QUIZZES: Record<string, { title: string; icon: string; xp: number; questions: Question[] }> = {
  CF1: {
    title: 'Money & You', icon: '💰', xp: 100,
    questions: [
      {
        q: 'According to the 50-30-20 rule, what percentage of income should go to savings & investments?',
        options: ['10%', '20%', '30%', '50%'],
        correct: 1,
        explanation: 'The 50-30-20 rule: 50% for needs, 30% for wants, and 20% for savings & investments — even ₹100/month invested early builds significant wealth.',
      },
      {
        q: 'Aditi invests ₹1,000/month from age 16 to 26, then stops. Rohan invests the same from 26 to 60. Who has more at 60 (at 12% returns)?',
        options: ['Rohan, because he invested longer', 'They have the same amount', 'Aditi, because she started earlier', 'Depends on the stock market'],
        correct: 2,
        explanation: 'Aditi ends up with more wealth despite investing less total money — because she gave compound interest more time to work. Starting early beats investing more, later.',
      },
      {
        q: 'What is compound interest?',
        options: ['Interest on the original principal only', 'Interest earned on both principal AND previously accumulated interest', 'A bank\'s service charge', 'A type of fixed deposit'],
        correct: 1,
        explanation: 'Compound interest earns you returns on your returns — making money grow exponentially. ₹10,000 at 12% compounded for 10 years becomes ₹31,058, not just ₹22,000.',
      },
      {
        q: 'Which formula correctly represents compound interest?',
        options: ['A = P × r × n', 'A = P + (P × r × n)', 'A = P × (1 + r)^n', 'A = P / (1 + r)^n'],
        correct: 2,
        explanation: 'A = P × (1 + r)^n — where P is principal, r is annual rate, n is years. The exponent is what makes compound growth exponential, not linear.',
      },
      {
        q: 'Why is ₹1,000 today worth more than ₹1,000 one year from now?',
        options: ['It is not — they are equal', 'Because inflation erodes future purchasing power', 'Because banks add fees next year', 'Because today\'s money is heavier'],
        correct: 1,
        explanation: 'The Time Value of Money: inflation reduces purchasing power, and money today can be invested and grow. ₹1,000 today can become ₹1,120 in a year at 12% returns.',
      },
    ],
  },
  CF2: {
    title: 'What is Investing?', icon: '📈', xp: 125,
    questions: [
      {
        q: 'India\'s Consumer Price Index (CPI) inflation has historically averaged:',
        options: ['1–2% per year', '3–4% per year', '5–6% per year', '10–12% per year'],
        correct: 2,
        explanation: 'India\'s CPI inflation has averaged 5–6% annually. This means prices roughly double every 12–14 years — so money idle in cash loses real value.',
      },
      {
        q: 'An FD gives 7%, inflation is 6%, and you pay 2% tax on interest. What is your real return?',
        options: ['+7%', '+1%', '0%', '–1%'],
        correct: 3,
        explanation: 'Real Return = 7% – 6% (inflation) – 2% (tax) = –1%. In real terms you\'re losing purchasing power in an FD if you\'re in a higher tax bracket!',
      },
      {
        q: 'For a goal that is 15 years away, which asset class is historically most suitable?',
        options: ['Bank FD', 'Cash savings account', 'Equity (stocks/mutual funds)', 'Short-term government bonds'],
        correct: 2,
        explanation: 'Over any 15-year period in Nifty 50 history, there has been essentially zero probability of loss. Long time horizons make equity dramatically safer and more rewarding.',
      },
      {
        q: 'Over any random 10-year period in Nifty 50, what is the historical probability of a loss?',
        options: ['30%', '15%', '~2%', '50%'],
        correct: 2,
        explanation: 'Historically, the probability of a negative return over any 10-year period in Nifty 50 is ~2%. Time in the market drastically reduces risk.',
      },
      {
        q: 'When is a Fixed Deposit most appropriate?',
        options: ['For building wealth over 20 years', 'For an emergency fund or goals under 2 years', 'For beating market returns', 'For tax-free long-term investing'],
        correct: 1,
        explanation: 'FDs are best for short-term needs and emergency funds (3–6 months of expenses). For long-term wealth, equity consistently beats FD returns after inflation and tax.',
      },
    ],
  },
  CF3: {
    title: 'Stocks Explained', icon: '📊', xp: 150,
    questions: [
      {
        q: 'When you buy a share of a company, you become:',
        options: ['A creditor who lent money to the company', 'A part-owner of that company', 'An employee with profit rights', 'A government bondholder'],
        correct: 1,
        explanation: 'A share represents fractional ownership. Buy 100 shares of Reliance out of 6.75 billion total and you own a tiny but real slice of the company.',
      },
      {
        q: 'Which regulatory body oversees stock markets in India?',
        options: ['RBI (Reserve Bank of India)', 'IRDAI', 'SEBI (Securities and Exchange Board of India)', 'AMFI'],
        correct: 2,
        explanation: 'SEBI (Securities and Exchange Board of India) regulates and protects investors in the securities market. NSE and BSE operate under SEBI\'s oversight.',
      },
      {
        q: 'When more investors want to buy a stock than sell it, the stock price:',
        options: ['Falls', 'Stays the same', 'Rises', 'Is set by SEBI'],
        correct: 2,
        explanation: 'Stock prices are driven by supply and demand. More buyers than sellers → price rises. More sellers than buyers → price falls. Earnings and sentiment drive who wants to buy or sell.',
      },
      {
        q: 'What characterises a "bull market"?',
        options: ['Prices are falling broadly', 'Market trading is paused', 'Prices are rising broadly', 'Only large companies can trade'],
        correct: 2,
        explanation: 'A bull market is a period of broadly rising prices — typically 20%+ gains from a recent low. The Nifty 50 was in a bull run from 2020 to 2024.',
      },
      {
        q: 'Large-cap stocks are best described as:',
        options: ['Small companies with the highest potential growth', 'Medium-sized fast-growing companies', 'The largest, most established companies in the market', 'Companies that only sell consumer goods'],
        correct: 2,
        explanation: 'Large-caps are India\'s biggest companies (e.g. TCS, HDFC Bank, Reliance). They offer more stability than mid/small-caps, though typically with lower upside.',
      },
    ],
  },
  CF4: {
    title: 'Mutual Funds & SIPs', icon: '🏦', xp: 150,
    questions: [
      {
        q: 'What does NAV (Net Asset Value) represent in a mutual fund?',
        options: ['The fund manager\'s salary', 'The total assets under management', 'The price of one unit of the mutual fund', 'The number of investors in the fund'],
        correct: 2,
        explanation: 'NAV is the price per unit of a mutual fund = (Total Assets – Liabilities) / Number of Units. If NAV is ₹150 and you invest ₹1,500, you get 10 units.',
      },
      {
        q: 'How does SIP benefit from Rupee Cost Averaging?',
        options: ['You always buy at the highest price', 'You buy more units when prices are low, reducing average cost', 'You skip investing during downturns', 'You always get the same number of units'],
        correct: 1,
        explanation: 'When markets fall, your fixed SIP amount buys MORE units at lower prices. This automatically lowers your average cost — so market dips actually benefit disciplined SIP investors.',
      },
      {
        q: 'An expense ratio of 0.5% on a ₹1 lakh investment means:',
        options: ['You pay ₹500 per trade as a commission', 'The fund charges ₹500 per year to manage your money', 'The fund gained 0.5% last year', '0.5% of returns is locked for 3 years'],
        correct: 1,
        explanation: 'The expense ratio is the annual fee charged as a % of assets. 0.5% on ₹1 lakh = ₹500/year. Index funds have the lowest ratios (0.1–0.2%) vs. active funds (1–2.5%).',
      },
      {
        q: 'A Flexi-cap mutual fund is one that:',
        options: ['Only invests in large companies', 'Gives tax benefits under Section 80C', 'Can invest across large, mid, and small-cap companies in any proportion', 'Only invests in debt instruments'],
        correct: 2,
        explanation: 'Flexi-cap funds can allocate across any market cap — giving the fund manager full flexibility. Parag Parikh Flexi Cap Fund is a popular example.',
      },
      {
        q: 'SEBI\'s role in mutual funds is to:',
        options: ['Set bank interest rates', 'Manage the government\'s portfolio', 'Regulate all mutual funds to protect investor interests', 'Only regulate foreign funds in India'],
        correct: 2,
        explanation: 'SEBI (Securities and Exchange Board of India) mandates disclosure norms, expense ratio caps, and investor protections for all mutual funds in India.',
      },
    ],
  },
  CF5: {
    title: 'Risk & Returns', icon: '⚡', xp: 125,
    questions: [
      {
        q: 'Beta measures:',
        options: ['A fund\'s annual return', 'How much a stock moves relative to the broader market', 'Annual fund expenses', 'The P/E ratio of a company'],
        correct: 1,
        explanation: 'Beta > 1 means the stock moves more than the market (higher risk/reward). Beta < 1 means it moves less. HDFC Bank has a beta of ~0.9; a small-cap may have 1.4.',
      },
      {
        q: 'Diversification reduces risk by:',
        options: ['Guaranteeing you never lose money', 'Eliminating market risk entirely', 'Spreading exposure so one bad investment doesn\'t destroy your portfolio', 'Maximising returns on every stock'],
        correct: 2,
        explanation: 'Diversification doesn\'t eliminate risk — it reduces concentration risk. If one holding crashes, the others buffer the fall. A well-diversified portfolio is less volatile.',
      },
      {
        q: 'Credit risk specifically refers to:',
        options: ['The risk of stock prices falling', 'The risk that a borrower defaults on repayment', 'The risk of not being able to sell your investment', 'Currency exchange risk'],
        correct: 1,
        explanation: 'Credit risk = the risk that the issuer (company or government) cannot repay its debt. This matters in bonds and debt mutual funds more than in equity investing.',
      },
      {
        q: 'A higher Sharpe Ratio indicates:',
        options: ['More risk per unit of return', 'Higher return earned per unit of risk taken', 'Greater volatility in the portfolio', 'Lower NAV per unit'],
        correct: 1,
        explanation: 'Sharpe Ratio = (Return – Risk-free Rate) / Standard Deviation. A higher ratio means you\'re being better compensated for each unit of risk. Compare funds with similar goals using this.',
      },
      {
        q: 'Liquidity risk means:',
        options: ['High current stock price', 'Difficulty converting an investment into cash quickly', 'Rising inflation rate', 'Fluctuating currency exchange rates'],
        correct: 1,
        explanation: 'Liquid assets (like Nifty large-cap stocks) can be sold in seconds. Illiquid assets (unlisted shares, real estate, some small-cap stocks) may take days or months to sell without a price penalty.',
      },
    ],
  },
  CF6: {
    title: 'How to Research', icon: '🔍', xp: 150,
    questions: [
      {
        q: 'Which three financial documents should you always read for a company?',
        options: ['Annual Report, Prospectus, Tax Return', 'P&L Statement, Balance Sheet, Cash Flow Statement', 'P/E Ratio, P/B Ratio, ROE Report', 'Revenue, Profit, Market Cap sheet'],
        correct: 1,
        explanation: 'P&L (income and expenses), Balance Sheet (assets and liabilities), and Cash Flow (actual cash movement) together paint the complete picture of a company\'s financial health.',
      },
      {
        q: 'The Price-to-Earnings (P/E) ratio tells you:',
        options: ['The company\'s annual profit', 'How much investors pay per ₹1 of the company\'s earnings', 'The stock\'s book value', 'The number of shares outstanding'],
        correct: 1,
        explanation: 'P/E = Stock Price / Earnings Per Share. If P/E is 20, you\'re paying ₹20 for every ₹1 of annual earnings. High P/E means investors expect high growth; low P/E may mean undervalued.',
      },
      {
        q: 'A company with growing revenue but shrinking profit margins likely has:',
        options: ['Exceptional growth — strong buy', 'Increasing costs eating into its margins', 'A declining business', 'Very high taxes being paid'],
        correct: 1,
        explanation: 'Revenue can grow while profits shrink if costs are rising faster — wages, raw materials, interest. This is a red flag: growth must translate to profit for shareholders to benefit.',
      },
      {
        q: 'Return on Equity (ROE) measures:',
        options: ['Revenue growth over the previous year', 'How efficiently a company uses shareholder money to generate profit', 'The exchange rate between two currencies', 'Total assets minus total liabilities'],
        correct: 1,
        explanation: 'ROE = Net Profit / Shareholders\' Equity. A 20%+ ROE consistently is a hallmark of quality companies like Asian Paints, HDFC Bank, and TCS.',
      },
      {
        q: 'In a mutual fund fact sheet, the expense ratio represents:',
        options: ['The fund\'s return last year', 'The annual cost of managing the fund, charged as % of assets', 'Total assets the fund manages', 'The fund\'s minimum investment requirement'],
        correct: 1,
        explanation: 'Expense ratio is the annual fee expressed as a % of AUM. A 1.5% ratio on ₹1 lakh = ₹1,500/year. Over 20 years, a 1% difference in expense ratio can cost lakhs in foregone returns.',
      },
    ],
  },
};

type Phase = 'intro' | 'question' | 'result';

export default function ModuleQuiz() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [, navigate] = useLocation();
  const { markQuizComplete, completedModules } = useUser();

  const quiz = moduleId ? MODULE_QUIZZES[moduleId] : null;
  const alreadyDone = completedModules.includes(moduleId ?? '');

  const [phase, setPhase] = useState<Phase>(alreadyDone ? 'result' : 'intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ chosen: number; correct: number }[]>([]);

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
        <Link href="/academy"><button className="text-secondary hover:underline">Back to Academy</button></Link>
      </div>
    );
  }

  const question = quiz.questions[current];
  const score = answers.filter(a => a.chosen === a.correct).length;

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, { chosen: selected, correct: question.correct }];
    setAnswers(newAnswers);

    if (current + 1 < quiz.questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const finalScore = newAnswers.filter(a => a.chosen === a.correct).length;
      if (!alreadyDone && moduleId) {
        markQuizComplete(moduleId, quiz.xp);
        toast.custom(<XPToast amount={quiz.xp} message={`${quiz.title} Complete!`} />);
      }
      setPhase('result');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/academy/${moduleId}`}>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {moduleId}
        </button>
      </Link>

      {phase === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border p-8 text-center">
          <div className="text-5xl mb-4">{quiz.icon}</div>
          <h1 className="text-2xl font-black mb-2">{quiz.title} — Module Quiz</h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {quiz.questions.length} questions to test what you've learned. Answer all of them — you need to complete the quiz (regardless of score) to unlock the module completion badge and {quiz.xp} XP.
          </p>
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{quiz.questions.length}</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">+{quiz.xp}</div>
              <div className="text-xs text-muted-foreground">XP on completion</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-secondary">∞</div>
              <div className="text-xs text-muted-foreground">Retries allowed</div>
            </div>
          </div>
          <button onClick={() => setPhase('question')} className="w-full py-4 brand-gradient text-white font-bold text-lg rounded-2xl shadow-lg">
            Start Quiz →
          </button>
        </motion.div>
      )}

      {phase === 'question' && (
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">Question {current + 1} of {quiz.questions.length}</span>
              <div className="flex gap-1">
                {quiz.questions.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i < current ? 'w-6 bg-green-400' : i === current ? 'w-8 bg-primary' : 'w-6 bg-muted'}`} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 mb-4">
              <p className="text-lg font-bold text-foreground leading-relaxed">{question.q}</p>
            </div>

            <div className="space-y-3 mb-6">
              {question.options.map((opt, i) => {
                let cls = 'bg-white border-border text-foreground';
                if (revealed) {
                  if (i === question.correct) cls = 'bg-green-50 border-green-400 text-green-800';
                  else if (i === selected && i !== question.correct) cls = 'bg-red-50 border-red-400 text-red-800';
                  else cls = 'bg-white border-border text-muted-foreground opacity-60';
                } else if (selected === i) {
                  cls = 'bg-primary/10 border-primary text-primary';
                }
                return (
                  <motion.button
                    key={i} whileHover={!revealed ? { scale: 1.01 } : {}} whileTap={!revealed ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3 ${cls}`}
                  >
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${revealed && i === question.correct ? 'border-green-400 bg-green-100' : revealed && i === selected && i !== question.correct ? 'border-red-400 bg-red-100' : 'border-current'}`}>
                      {revealed && i === question.correct ? <CheckCircle className="w-4 h-4 text-green-600" /> : revealed && i === selected && i !== question.correct ? <XCircle className="w-4 h-4 text-red-500" /> : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {revealed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 mb-4 border ${selected === question.correct ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`text-sm font-bold mb-1 ${selected === question.correct ? 'text-green-700' : 'text-amber-700'}`}>
                  {selected === question.correct ? '✅ Correct!' : '💡 Not quite — here\'s the explanation:'}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{question.explanation}</p>
              </motion.div>
            )}

            {revealed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext}
                className="w-full py-4 brand-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2">
                {current + 1 < quiz.questions.length ? <>Next Question <ChevronRight className="w-5 h-5" /></> : <>Finish Quiz <Award className="w-5 h-5" /></>}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {phase === 'result' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-white rounded-2xl border border-border p-8 mb-6">
            <div className="text-6xl mb-4">
              {alreadyDone && answers.length === 0 ? '🏆' : score >= Math.ceil(quiz.questions.length * 0.8) ? '🎉' : score >= Math.ceil(quiz.questions.length * 0.5) ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-black mb-2">
              {alreadyDone && answers.length === 0 ? 'Already Completed!' : 'Quiz Complete!'}
            </h2>
            {answers.length > 0 && (
              <>
                <div className="text-4xl font-black text-primary mb-1">{score}/{quiz.questions.length}</div>
                <div className="text-muted-foreground text-sm mb-4">
                  {score === quiz.questions.length ? 'Perfect score! You really know your stuff.' : score >= Math.ceil(quiz.questions.length * 0.8) ? 'Great job! Strong understanding of the material.' : score >= Math.ceil(quiz.questions.length * 0.5) ? 'Good effort! Review the explanations to strengthen your knowledge.' : 'Keep going — you\'ve completed the module. Review the lessons to deepen your understanding.'}
                </div>
                <div className="flex items-center justify-center gap-2 py-3 px-6 bg-amber-50 border border-amber-200 rounded-xl inline-flex mx-auto">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-amber-700">+{quiz.xp} XP earned!</span>
                </div>
              </>
            )}
            {alreadyDone && answers.length === 0 && (
              <p className="text-muted-foreground text-sm mt-2">You've already completed this module quiz and earned your XP.</p>
            )}
          </div>

          <div className="flex gap-3">
            <Link href={`/academy/${moduleId}`} className="flex-1">
              <button className="w-full py-3 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-colors">
                Back to Module
              </button>
            </Link>
            <Link href="/academy" className="flex-1">
              <button className="w-full py-3 brand-gradient text-white rounded-xl font-semibold text-sm">
                Next Module →
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
