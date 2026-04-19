import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { RiskProfile } from '../types';

export interface PortfolioHolding {
  ticker: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  type: 'stock' | 'mutualfund' | 'bank_fd' | 'nps' | 'ppf' | 'pms';
  sector?: string;
}

const INITIAL_HOLDINGS: PortfolioHolding[] = [
  { ticker: 'HDFCBANK', name: 'HDFC Bank', quantity: 12, avgBuyPrice: 1580, currentPrice: 1648.75, type: 'stock', sector: 'Banking' },
  { ticker: 'INFY', name: 'Infosys', quantity: 8, avgBuyPrice: 1610, currentPrice: 1567.85, type: 'stock', sector: 'IT' },
  { ticker: 'PPFAS-FLEXI', name: 'Parag Parikh Flexi Cap', quantity: 250, avgBuyPrice: 72.50, currentPrice: 78.32, type: 'mutualfund', sector: 'Equity' },
  { ticker: 'SBI-NIFTY50-IDX', name: 'SBI Nifty 50 Index Fund', quantity: 180, avgBuyPrice: 168, currentPrice: 182.45, type: 'mutualfund', sector: 'Index' },
];

export const MODULE_LESSON_MAP: Record<string, { lessons: string[]; xp: number }> = {
  CF1: { lessons: ['CF1-L1', 'CF1-L2', 'CF1-L3', 'CF1-L4', 'CF1-L5'], xp: 200 },
  CF2: { lessons: ['CF2-L1', 'CF2-L2', 'CF2-L3', 'CF2-L4'], xp: 250 },
  CF3: { lessons: ['CF3-L1', 'CF3-L2', 'CF3-L3', 'CF3-L4', 'CF3-L5'], xp: 300 },
  CF4: { lessons: ['CF4-L1', 'CF4-L2', 'CF4-L3', 'CF4-L4', 'CF4-L5'], xp: 300 },
  CF5: { lessons: ['CF5-L1', 'CF5-L2', 'CF5-L3', 'CF5-L4'], xp: 250 },
  CF6: { lessons: ['CF6-L1', 'CF6-L2', 'CF6-L3', 'CF6-L4'], xp: 300 },
};

const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000];

function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1;
  }
  return 1;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatarId: string;
  dob: string;
  tier: 'free' | 'pro';
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  badges: string[];
  riskProfile: RiskProfile | null;
  watchlist: string[];
}

export interface ResearchView {
  ticker: string;
  name: string;
  type: 'stock' | 'fund';
  viewCount: number;
  lastViewedAt: number;
}

export interface ActivityEntry {
  icon: string;
  text: string;
  time: number;
  category: 'research' | 'trade' | 'academy' | 'system';
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'student',
  displayName: 'Student',
  avatarId: '🎯',
  dob: '',
  tier: 'free',
  xp: 0,
  level: 1,
  streak: 1,
  longestStreak: 1,
  badges: [],
  riskProfile: null,
  watchlist: [],
};

interface PortfolioState {
  cash: number;
  holdings: PortfolioHolding[];
}

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  addXP: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  completedModules: string[];
  markModuleComplete: (moduleId: string) => void;
  completedLessons: string[];
  markLessonComplete: (lessonId: string, moduleId: string, lessonXp: number) => void;
  markRoundComplete: () => void;
  portfolioState: PortfolioState;
  buyInvestment: (
    ticker: string,
    name: string,
    quantity: number,
    price: number,
    type: PortfolioHolding['type'],
    sector?: string
  ) => boolean;
  sellInvestment: (ticker: string, quantity: number, price: number) => boolean;
  researchHistory: ResearchView[];
  logResearchView: (ticker: string, name: string, type: 'stock' | 'fund') => void;
  activityLog: ActivityEntry[];
}

const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

const now = Date.now();
const INITIAL_RESEARCH_HISTORY: ResearchView[] = [
  { ticker: 'HDFCBANK', name: 'HDFC Bank', type: 'stock', viewCount: 3, lastViewedAt: now - 1 * 24 * 60 * 60 * 1000 },
  { ticker: 'INFY', name: 'Infosys', type: 'stock', viewCount: 2, lastViewedAt: now - 2 * 24 * 60 * 60 * 1000 },
  { ticker: 'TCS', name: 'TCS', type: 'stock', viewCount: 2, lastViewedAt: now - 2 * 60 * 60 * 1000 },
  { ticker: 'ZOMATO', name: 'Zomato', type: 'stock', viewCount: 3, lastViewedAt: now - 3 * 24 * 60 * 60 * 1000 },
];

const INITIAL_ACTIVITY: ActivityEntry[] = [
  { icon: '🔍', text: 'Researched TCS — P/E and analyst ratings', time: now - 2 * 60 * 60 * 1000, category: 'research' },
  { icon: '💰', text: 'Bought HDFCBANK × 12 shares (starting portfolio)', time: now - 1 * 24 * 60 * 60 * 1000, category: 'trade' },
  { icon: '🔍', text: 'Viewed ZOMATO research page 3 times', time: now - 3 * 24 * 60 * 60 * 1000, category: 'research' },
  { icon: '💰', text: 'Bought PPFAS Flexi Cap × 250 units (starting portfolio)', time: now - 4 * 24 * 60 * 60 * 1000, category: 'trade' },
  { icon: '💰', text: 'Bought SBI Nifty 50 Index Fund × 180 units (starting portfolio)', time: now - 4 * 24 * 60 * 60 * 1000, category: 'trade' },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    cash: 100000,
    holdings: INITIAL_HOLDINGS,
  });
  const [researchHistory, setResearchHistory] = useState<ResearchView[]>(INITIAL_RESEARCH_HISTORY);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);

  const firstBuyDone = useRef(false);
  const firstRoundDone = useRef(false);

  const awardBadge = useCallback((badgeId: string) => {
    setUserProfileState(prev => {
      if (!prev || prev.badges.includes(badgeId)) return prev;
      setTimeout(() => {
        toast(`🏅 Badge Unlocked: ${badgeId.replace(/_/g, ' ')}!`, {
          icon: '🏅',
          duration: 3500,
          style: { background: '#1E3A5F', color: '#fff' },
        });
      }, 300);
      return { ...prev, badges: [...prev.badges, badgeId] };
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      if (newLevel > prev.level) {
        setTimeout(() => {
          toast(`⬆️ Level Up! You're now Level ${newLevel}!`, {
            duration: 3500,
            style: { background: '#2E86AB', color: '#fff', fontWeight: 'bold' },
          });
        }, 500);
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfileState(prev => {
      if (!profile) return null;
      const prevXP = prev?.xp ?? 0;
      const prevBadges = prev?.badges ?? [];
      const mergedXP = Math.max(profile.xp ?? 0, prevXP);
      const mergedBadges = [...new Set([...(profile.badges ?? []), ...prevBadges])];
      return {
        ...profile,
        xp: mergedXP,
        level: calculateLevel(mergedXP),
        badges: mergedBadges,
      };
    });
  }, []);

  const setRiskProfile = useCallback((profile: RiskProfile) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      return { ...prev, riskProfile: profile };
    });
    awardBadge('risk_profiled');
  }, [awardBadge]);

  const addToWatchlist = useCallback((ticker: string) => {
    setUserProfileState(prev => {
      if (!prev || prev.watchlist.includes(ticker)) return prev;
      return { ...prev, watchlist: [...prev.watchlist, ticker] };
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      return { ...prev, watchlist: prev.watchlist.filter(t => t !== ticker) };
    });
  }, []);

  const markModuleComplete = useCallback((moduleId: string) => {
    setCompletedModules(prev => {
      if (prev.includes(moduleId)) return prev;
      if (prev.length === 0) {
        setTimeout(() => awardBadge('module_master'), 200);
      }
      return [...prev, moduleId];
    });
  }, [awardBadge]);

  const markLessonComplete = useCallback((lessonId: string, moduleId: string, lessonXp: number) => {
    addXP(lessonXp);
    setActivityLog(prev => [
      { icon: '📚', text: `Completed lesson ${lessonId} (+${lessonXp} XP)`, time: Date.now(), category: 'academy' as const },
      ...prev,
    ].slice(0, 30));
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      if (prev.length === 0) {
        setTimeout(() => awardBadge('first_lesson'), 200);
      }
      const updated = [...prev, lessonId];
      const moduleLessons = MODULE_LESSON_MAP[moduleId]?.lessons ?? [];
      const allDone = moduleLessons.length > 0 && moduleLessons.every(l => updated.includes(l));
      if (allDone) {
        setCompletedModules(cm => {
          if (cm.includes(moduleId)) return cm;
          const moduleXp = MODULE_LESSON_MAP[moduleId]?.xp ?? 0;
          addXP(moduleXp);
          if (cm.length === 0) {
            setTimeout(() => awardBadge('module_master'), 200);
          }
          return [...cm, moduleId];
        });
      }
      return updated;
    });
  }, [addXP, awardBadge]);

  const markRoundComplete = useCallback(() => {
    if (!firstRoundDone.current) {
      firstRoundDone.current = true;
      awardBadge('situation_survivor');
    }
    setActivityLog(prev => [
      { icon: '⚡', text: 'Completed a Situation Round', time: Date.now(), category: 'academy' },
      ...prev,
    ].slice(0, 30));
  }, [awardBadge]);

  const logResearchView = useCallback((ticker: string, name: string, type: 'stock' | 'fund') => {
    setResearchHistory(prev => {
      const existing = prev.find(r => r.ticker === ticker);
      if (existing) {
        return prev.map(r => r.ticker === ticker
          ? { ...r, viewCount: r.viewCount + 1, lastViewedAt: Date.now() }
          : r
        );
      }
      return [{ ticker, name, type, viewCount: 1, lastViewedAt: Date.now() }, ...prev].slice(0, 50);
    });
    setActivityLog(prev => {
      const recentResearch = prev.find(a => a.category === 'research' && a.text.includes(ticker) && Date.now() - a.time < 5 * 60 * 1000);
      if (recentResearch) return prev;
      return [
        { icon: '🔍', text: `Researched ${name} (${ticker})`, time: Date.now(), category: 'research' as const },
        ...prev,
      ].slice(0, 30);
    });
  }, []);

  const buyInvestment = useCallback((
    ticker: string,
    name: string,
    quantity: number,
    price: number,
    type: PortfolioHolding['type'],
    sector?: string
  ): boolean => {
    const totalCost = quantity * price;
    let didSucceed = false;
    setPortfolioState(prev => {
      if (prev.cash < totalCost) return prev;
      didSucceed = true;
      const existingIdx = prev.holdings.findIndex(h => h.ticker === ticker);
      let newHoldings: PortfolioHolding[];
      if (existingIdx >= 0) {
        const ex = prev.holdings[existingIdx];
        const totalQty = ex.quantity + quantity;
        const newAvg = (ex.quantity * ex.avgBuyPrice + quantity * price) / totalQty;
        newHoldings = prev.holdings.map((h, i) =>
          i === existingIdx ? { ...h, quantity: totalQty, avgBuyPrice: newAvg, currentPrice: price } : h
        );
      } else {
        newHoldings = [
          ...prev.holdings,
          { ticker, name, quantity, avgBuyPrice: price, currentPrice: price, type, sector },
        ];
      }
      return { cash: prev.cash - totalCost, holdings: newHoldings };
    });
    if (didSucceed) {
      setActivityLog(prev => [
        { icon: '💰', text: `Bought ${name} (${ticker}) × ${quantity} @ ₹${price.toLocaleString('en-IN')}`, time: Date.now(), category: 'trade' as const },
        ...prev,
      ].slice(0, 30));
      if (!firstBuyDone.current) {
        firstBuyDone.current = true;
        setTimeout(() => awardBadge('portfolio_builder'), 600);
      }
    }
    return didSucceed;
  }, [awardBadge]);

  const sellInvestment = useCallback((ticker: string, quantity: number, price: number): boolean => {
    let didSucceed = false;
    let soldName = ticker;
    setPortfolioState(prev => {
      const idx = prev.holdings.findIndex(h => h.ticker === ticker);
      if (idx < 0 || prev.holdings[idx].quantity < quantity) return prev;
      didSucceed = true;
      soldName = prev.holdings[idx].name;
      const proceeds = quantity * price;
      const newHoldings = prev.holdings[idx].quantity === quantity
        ? prev.holdings.filter((_, i) => i !== idx)
        : prev.holdings.map((h, i) => i === idx ? { ...h, quantity: h.quantity - quantity } : h);
      return { cash: prev.cash + proceeds, holdings: newHoldings };
    });
    if (didSucceed) {
      setActivityLog(prev => [
        { icon: '💸', text: `Sold ${soldName} (${ticker}) × ${quantity} @ ₹${price.toLocaleString('en-IN')}`, time: Date.now(), category: 'trade' as const },
        ...prev,
      ].slice(0, 30));
    }
    return didSucceed;
  }, []);

  return (
    <UserContext.Provider value={{
      userProfile,
      setUserProfile,
      addXP,
      awardBadge,
      setRiskProfile,
      addToWatchlist,
      removeFromWatchlist,
      completedModules,
      markModuleComplete,
      completedLessons,
      markLessonComplete,
      markRoundComplete,
      portfolioState,
      buyInvestment,
      sellInvestment,
      researchHistory,
      logResearchView,
      activityLog,
    }}>
      {children}
    </UserContext.Provider>
  );
}
