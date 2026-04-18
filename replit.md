# InvesEd AI — Project Documentation

## Overview
**InvesEd AI** is India's first AI-powered investment learning platform for teens (13–18). Built as a React + TypeScript + TailwindCSS + Vite single-page application with Firebase authentication.

## Architecture
- **Monorepo**: pnpm workspace at `/home/runner/workspace`
- **Web App**: `artifacts/invesed-ai/` — React + Vite, previewPath `/`
- **API Server**: `artifacts/api-server/` — Express backend

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS v4, Vite
- **Auth**: Firebase Auth (Google OAuth + email/password)
- **Animation**: Framer Motion
- **Charts**: Recharts (AreaChart, PieChart, RadarChart)
- **Toasts**: react-hot-toast
- **Routing**: wouter
- **State**: React Context (AuthContext + UserContext)

## Brand Design
- **Primary**: #1E3A5F (deep navy)
- **Accent**: #2E86AB (ocean blue)
- **Success**: #1B6B3A (forest green)
- **Font**: Inter
- **Border radius**: 0.625rem

## Key Features
1. **Landing Page** — Animated logo, hero, stats, feature grid, Coursera CTA
2. **Auth** — 3-step signup (email → profile → avatar), Google OAuth, login page
3. **Risk Quiz Onboarding** — 12-question animated quiz with risk scoring algorithm
4. **Academy** — CF1 & CF2 always unlocked free; 6 core modules + 4 advanced Pro; full lesson content for all CF1 (5 lessons) and CF2 (4 lessons) with interactive SIP & compound interest calculators; XP rewards per lesson + module auto-completion bonus
5. **Portfolio Simulator** — Shared context state: ₹1,00,000 virtual cash + 4 initial holdings (HDFCBANK, INFY, PPFAS-FLEXI, SBI-NIFTY50-IDX); buy/sell with cash validation; area chart, pie chart, holdings table with all investment types
6. **InvestModal** — 5 category tabs: Stocks, Mutual Funds, Bank FD, NPS/PPF, PMS; validates against live context cash; updates shared portfolio state on success
7. **Research Lab** — Stocks + MF list, stock detail with chart, fundamentals, analyst view
8. **Situation Rounds** — 8 crisis scenarios with decision trees
9. **Leaderboard** — XP and portfolio return rankings
10. **Profile** — XP bar, level, badges, risk profile
11. **Guided Dashboard** — Reads live portfolio & lesson progress from context; AI insights; next steps

## Shared Portfolio State (UserContext)
- `portfolioState.cash` — starts at ₹1,00,000
- `portfolioState.holdings` — starts with 4 positions (HDFCBANK, INFY, PPFAS-FLEXI, SBI-NIFTY50-IDX)
- `buyInvestment(ticker, name, qty, price, type, sector)` — validates cash, returns boolean success
- `sellInvestment(ticker, qty, price)` — validates holdings, returns boolean success
- `completedLessons` + `markLessonComplete(lessonId, moduleId, lessonXp)` — tracks progress; auto-completes module + awards bonus XP when all lessons done
- `MODULE_LESSON_MAP` — exported constant mapping module IDs to lesson arrays + XP values

## Investment Types Supported
- `stock` — NSE equities (10 stocks)
- `mutualfund` — Equity/Index/ELSS mutual funds
- `bank_fd` — Bank FDs at ₹1,000/unit (SBI, HDFC, ICICI, Post Office, Bajaj Finance)
- `nps` — NPS Tier 1 schemes at ₹500/unit (Equity, Corporate, Government)
- `ppf` — Public Provident Fund at ₹500/unit
- `pms` — Portfolio Management Schemes at ₹50,000/unit (Motilal, Kotak, SBI, ASK)

## Academy Lesson Content (complete)
- **CF1**: L1 Why Your Pocket Money Matters, L2 The Magic of Saving Early (SIP calc), L3 Compound Interest — The 8th Wonder (compound calc), L4 Time Value of Money, L5 Building Your First Budget
- **CF2**: L1 Inflation — The Silent Thief, L2 Why FD Alone Is Not Enough, L3 Asset Classes Overview, L4 Risk & Time — The Trade-off
- **CF4-L4**: SIP — Rupee Cost Averaging (SIP calc)
- All other lessons show "Content Coming Soon" with XP placeholder

## Data
All data is **mock** (no backend required):
- **10 NSE Stocks**: RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, WIPRO, ZOMATO, TATAMOTORS, BAJFINANCE, HINDUNILVR
- **5+ Mutual Funds**: SBI Nifty 50 Index, Parag Parikh Flexi Cap, Mirae Emerging Bluechip, Axis Small Cap, HDFC ELSS

## XP / Leveling System
Levels: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000] XP thresholds
- Lesson complete: +25–45 XP (per lesson, varies by complexity)
- Module complete (auto, when all lessons done): +200–300 XP
- Situation Round: +75–300 XP

## File Structure
```
artifacts/invesed-ai/src/
├── App.tsx
├── context/
│   ├── AuthContext.tsx
│   └── UserContext.tsx          — Portfolio state + lesson tracking (SOURCE OF TRUTH)
├── data/marketData.ts
├── utils/formatters.ts
├── components/
│   ├── InvestModal.tsx          — 5-tab investment modal (uses UserContext)
│   ├── ChatBot.tsx              — Floating AI coach
│   └── gamification/
│       ├── XPBar.tsx
│       └── XPToast.tsx
└── pages/
    ├── Academy/AcademyHome.tsx  — CF1+CF2 always free/unlocked
    ├── Academy/ModuleView.tsx   — Lesson list with checkmarks
    ├── Academy/LessonView.tsx   — Full CF1/CF2 content + calculators
    ├── Simulator/Portfolio.tsx  — Reads from UserContext
    ├── GuidedDashboard/         — Reads from UserContext
    └── ...
```

## Firebase Config
Credentials via VITE_FIREBASE_* env vars. Falls back to demo values for local dev.

## Deployment
Ready to deploy. Run `suggest_deploy` when ready.
