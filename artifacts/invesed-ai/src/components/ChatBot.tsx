import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, TrendingUp, BookOpen, PieChart } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { label: 'What is SIP?', icon: '💡' },
  { label: 'How to diversify?', icon: '📊' },
  { label: 'What is P/E ratio?', icon: '🔢' },
  { label: 'Mutual fund vs stocks?', icon: '⚖️' },
];

const BOT_RESPONSES: Record<string, string> = {
  sip: "**SIP (Systematic Investment Plan)** is a method of investing a fixed amount in mutual funds at regular intervals (monthly/weekly). It helps you:\n• Build wealth gradually with small amounts\n• Benefit from Rupee Cost Averaging — you buy more units when prices are low\n• Avoid the risk of timing the market\n\nFor example, investing ₹1,000/month in a Nifty 50 Index Fund over 10 years can grow significantly thanks to compounding! 📈",
  diversify: "**Diversification** means spreading your investments across different sectors and asset types to reduce risk.\n\n**Golden Rule:** Don't put all your eggs in one basket! 🥚\n\n**How to diversify:**\n• Mix stocks from different sectors (IT, Banking, FMCG)\n• Add both large-cap and mid-cap stocks\n• Include debt instruments or index funds\n• Consider gold or REITs for further balance\n\nIn your portfolio, aim for no single stock to be >20% of your total value.",
  pe: "**P/E Ratio (Price-to-Earnings)** tells you how much investors pay per rupee of a company's earnings.\n\n`P/E = Stock Price ÷ Earnings Per Share`\n\n**What it means:**\n• **Low P/E (< 15):** May be undervalued — could be a bargain!\n• **High P/E (> 35):** Investors expect strong future growth\n• **Industry comparison is key** — compare within the same sector\n\nFor example, TCS has a P/E of ~31, which is typical for quality IT companies. Always compare with sector peers! 🔍",
  mutual: "**Mutual Funds vs Stocks:**\n\n| Feature | Stocks | Mutual Funds |\n|---|---|---|\n| Risk | Higher | Lower (diversified) |\n| Control | Full | Fund manager |\n| Min. Investment | 1 share | ₹100 via SIP |\n| Expertise needed | High | Low |\n\n**For beginners:** Start with index funds like Nifty 50 — they track the market at very low cost!\n\n**For growth:** As you learn, gradually add quality stocks to boost returns above the index. Your Academy modules cover this in detail! 📚",
  hello: "Hi! 👋 I'm your **InvesEd AI Coach**! I'm here to help you learn about investing in the Indian market.\n\nYou can ask me about:\n• **Stocks & Mutual Funds** — how to analyse them\n• **Concepts** — P/E, SIP, CAGR, diversification\n• **Your Portfolio** — tips on allocation and risk\n• **Market situations** — what to do during crashes or rallies\n\nWhat would you like to learn today? 🚀",
  risk: "**Risk in investing** is the possibility of losing some or all of your investment. Here's how to think about it:\n\n**Types of Risk:**\n• **Market Risk** — entire market falls (like COVID crash 2020)\n• **Company Risk** — a specific company performs badly\n• **Concentration Risk** — too much money in one stock\n\n**Your Risk Profile helps!** Based on your quiz answers, you got a personalised risk score. If you're risk-averse, lean towards:\n• Large-cap stocks (HDFC, TCS, RELIANCE)\n• Index funds (Nifty 50)\n• Debt mutual funds\n\nHigher risk tolerance? Small/mid-cap stocks can give higher returns over time! ⚡",
  default: "That's a great question! 🤔 As your AI investing coach, let me share what I know...\n\nFor in-depth questions about the Indian stock market, I'd recommend:\n• Exploring the **Research Lab** to analyse specific stocks\n• Taking an **Academy module** to build foundational knowledge\n• Trying **Situation Rounds** to practice real market scenarios\n\nCould you rephrase or ask something more specific? For example:\n• \"What is CAGR?\"\n• \"How do I analyse a bank stock?\"\n• \"What happened during the 2020 COVID crash?\"\n\nI'm here to help! 😊",
};

function getBotResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('sip') || q.includes('systematic')) return BOT_RESPONSES.sip;
  if (q.includes('diversif') || q.includes('spread') || q.includes('basket')) return BOT_RESPONSES.diversify;
  if (q.includes('p/e') || q.includes('pe ratio') || q.includes('price to earn') || q.includes('valuat')) return BOT_RESPONSES.pe;
  if (q.includes('mutual') || q.includes('fund') || q.includes('stock')) return BOT_RESPONSES.mutual;
  if (q.includes('risk') || q.includes('safe') || q.includes('volatile')) return BOT_RESPONSES.risk;
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('help')) return BOT_RESPONSES.hello;
  return BOT_RESPONSES.default;
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={i} className="font-bold">{line.slice(2, -2)}</div>;
        }
        if (line.startsWith('• ')) {
          return <div key={i} className="flex gap-1.5"><span className="text-accent mt-0.5">•</span><span>{line.slice(2)}</span></div>;
        }
        if (line.startsWith('|')) {
          return null;
        }
        if (line.includes('**')) {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <div key={i}>
              {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**')
                  ? <strong key={j}>{part.slice(2, -2)}</strong>
                  : <span key={j}>{part}</span>
              )}
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "Hi! 👋 I'm your **InvesEd AI Coach**! Ask me anything about investing, stocks, mutual funds, or the Indian market.\n\nTry one of the quick questions below to get started! 🚀",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: getBotResponse(text),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-24 right-4 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 120px)', height: 520 }}
          >
            <div className="brand-gradient p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">InvesEd AI Coach</div>
                  <div className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Always available
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${msg.role === 'bot' ? 'brand-gradient' : 'bg-secondary'}`}>
                    {msg.role === 'bot' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${msg.role === 'bot' ? 'bg-white border border-border text-foreground rounded-tl-sm' : 'bg-primary text-white rounded-tr-sm'}`}>
                    {msg.role === 'bot' ? <FormattedMessage text={msg.text} /> : <p className="text-sm">{msg.text}</p>}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full brand-gradient flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border bg-white flex-shrink-0">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.label)}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 transition-colors font-medium"
                  >
                    {q.icon} {q.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask anything about investing..."
                  className="flex-1 text-sm border border-border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 z-50 w-14 h-14 brand-gradient rounded-full shadow-lg flex items-center justify-center text-white"
        aria-label="Open AI Coach"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>
    </>
  );
}
