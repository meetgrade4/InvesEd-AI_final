import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { label: 'Review my portfolio', icon: '📊' },
  { label: 'What is SIP?', icon: '💡' },
  { label: 'How to diversify?', icon: '🌐' },
  { label: 'Explain P/E ratio', icon: '🔢' },
];

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          const content = line.slice(2);
          return (
            <div key={i} className="flex gap-1.5">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>{renderInlineBold(content)}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <div key={i}>{renderInlineBold(line)}</div>;
      })}
    </div>
  );
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : <span key={j}>{part}</span>
      )}
    </>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "Hi! 👋 I'm your **InvesEd AI Coach** — powered by real AI!\n\nI know your portfolio, watchlist, and learning progress. Ask me anything about investing, or use the quick buttons below. 🚀",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { userProfile, portfolioState, completedModules } = useUser();

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  const buildUserContext = useCallback(() => {
    if (!userProfile) return undefined;

    const holdings = portfolioState.holdings.map(h => {
      const currentValue = h.quantity * h.currentPrice;
      const investedValue = h.quantity * h.avgBuyPrice;
      const percentReturn = ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
      return {
        ticker: h.ticker,
        type: h.type === 'stock' ? 'stock' : 'mutualfund',
        percentReturn,
        currentValue,
        sector: h.sector,
      };
    });

    const portfolioValue = portfolioState.holdings.reduce(
      (sum, h) => sum + h.quantity * h.currentPrice, 0
    ) + portfolioState.cash;

    const totalInvested = portfolioState.holdings.reduce(
      (sum, h) => sum + h.quantity * h.avgBuyPrice, 0
    );
    const holdingsValue = portfolioState.holdings.reduce(
      (sum, h) => sum + h.quantity * h.currentPrice, 0
    );
    const totalReturn = totalInvested > 0 ? ((holdingsValue - totalInvested) / totalInvested) * 100 : 0;

    return {
      riskProfile: userProfile.riskProfile ? {
        type: userProfile.riskProfile.type,
        label: userProfile.riskProfile.label,
        score: userProfile.riskProfile.score,
      } : undefined,
      holdings,
      watchlist: userProfile.watchlist,
      completedModules,
      totalReturn,
      portfolioValue,
      xp: userProfile.xp,
      level: userProfile.level,
    };
  }, [userProfile, portfolioState, completedModules]);

  const buildChatHistory = useCallback((currentMessages: Message[]) => {
    return currentMessages
      .filter(m => m.id !== '0')
      .map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.text }));
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    if (!isOpen) {
      setIsOpen(true);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = { id: botMsgId, role: 'bot', text: '', timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildChatHistory(updatedMessages),
          userContext: buildUserContext(),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to AI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (!isOpen) setHasNewMessage(true);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              accumulated += parsed.content;
              setMessages(prev =>
                prev.map(m => m.id === botMsgId ? { ...m, text: accumulated } : m)
              );
            }
            if (parsed.done || parsed.error) break;
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      if (!accumulated) {
        setMessages(prev =>
          prev.map(m => m.id === botMsgId
            ? { ...m, text: "I couldn't connect to the AI right now. Please try again!" }
            : m
          )
        );
        if (!isOpen) setHasNewMessage(true);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === botMsgId
            ? { ...m, text: "Something went wrong. Make sure the API server is running and try again." }
            : m
          )
        );
        if (!isOpen) setHasNewMessage(true);
      }
    } finally {
      setIsStreaming(false);
    }
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
            className="fixed bottom-24 right-4 z-50 w-[340px] sm:w-[390px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 120px)', height: 540 }}
          >
            {/* Header */}
            <div className="brand-gradient p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm flex items-center gap-1.5">
                    InvesEd AI Coach
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </div>
                  <div className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block shadow-[0_0_5px_#4ade80]" />
                    AI-powered · knows your portfolio
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1 bg-white/10 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.role === 'bot' ? 'brand-gradient' : 'bg-secondary'}`}>
                    {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[82%] px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'bot' ? 'bg-card border border-border text-foreground rounded-tl-sm' : 'brand-gradient border border-primary/20 text-white rounded-tr-sm'}`}>
                    {msg.role === 'bot'
                      ? msg.text
                        ? <FormattedMessage text={msg.text} />
                        : <TypingDots />
                      : <p className="text-sm font-medium">{msg.text}</p>
                    }
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border bg-card flex-shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.label)}
                    disabled={isStreaming}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-colors disabled:opacity-40"
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
                  disabled={isStreaming}
                  className="flex-1 text-sm border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background disabled:opacity-60"
                />
                <button
                  onClick={() => isStreaming ? abortRef.current?.abort() : sendMessage(input)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all shadow-sm ${isStreaming ? 'bg-red-500 hover:bg-red-600' : 'brand-gradient hover:shadow-md disabled:opacity-40'}`}
                  disabled={!isStreaming && !input.trim()}
                >
                  {isStreaming ? <X className="w-5 h-5" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-4 z-50 flex items-center justify-center w-16 h-16">
        {/* Pulsing ring background */}
        <motion.div
          className="absolute inset-0 brand-gradient rounded-full opacity-50 blur-sm"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 brand-gradient rounded-full shadow-[0_5px_15px_rgba(30,58,95,0.4)] flex items-center justify-center text-white border-2 border-white/20"
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
          
          <AnimatePresence>
            {hasNewMessage && !isOpen && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" 
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1.5 px-1">
      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
