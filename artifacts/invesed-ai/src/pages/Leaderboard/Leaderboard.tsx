import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Award, Flame, Crown } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const MOCK_LEADERS = [
  { rank: 1, username: 'arjun_investor', displayName: 'Arjun M.', avatar: '🦁', level: 8, xp: 3820, portfolioReturn: 18.4, streak: 24, badge: '🏆' },
  { rank: 2, username: 'priya_stocks', displayName: 'Priya K.', avatar: '🦋', level: 7, xp: 3210, portfolioReturn: 15.2, streak: 18, badge: '🥈' },
  { rank: 3, username: 'dev_trades', displayName: 'Dev S.', avatar: '🚀', level: 7, xp: 2980, portfolioReturn: 14.8, streak: 15, badge: '🥉' },
  { rank: 4, username: 'nisha_sip', displayName: 'Nisha R.', avatar: '⚡', level: 6, xp: 2650, portfolioReturn: 12.3, streak: 10, badge: null },
  { rank: 5, username: 'rohan_nifty', displayName: 'Rohan P.', avatar: '🔥', level: 6, xp: 2480, portfolioReturn: 11.7, streak: 8, badge: null },
  { rank: 6, username: 'ananya_bull', displayName: 'Ananya T.', avatar: '🌟', level: 5, xp: 2100, portfolioReturn: 9.8, streak: 12, badge: null },
  { rank: 7, username: 'varun_markets', displayName: 'Varun G.', avatar: '💎', level: 5, xp: 1950, portfolioReturn: 8.4, streak: 6, badge: null },
  { rank: 8, username: 'sneha_invest', displayName: 'Sneha M.', avatar: '🦅', level: 4, xp: 1640, portfolioReturn: 7.2, streak: 9, badge: null },
  { rank: 9, username: 'kabir_finance', displayName: 'Kabir L.', avatar: '🐯', level: 4, xp: 1420, portfolioReturn: 6.1, streak: 4, badge: null },
  { rank: 10, username: 'ishaan_sip', displayName: 'Ishaan N.', avatar: '🌊', level: 3, xp: 1180, portfolioReturn: 5.3, streak: 7, badge: null },
];

const TABS = ['Global', 'This Week', 'Portfolio Returns', 'XP'];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Global');
  const { userProfile } = useUser();

  const userRank = userProfile ? 12 : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary mb-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Top investors by portfolio performance, XP, and learning streak</p>
      </div>

      {/* Top 3 podium */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-end justify-center gap-3">
          {/* Rank 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center"
          >
            <div className="text-3xl mb-2">{MOCK_LEADERS[1].avatar}</div>
            <div className="font-bold text-sm mb-1">{MOCK_LEADERS[1].displayName}</div>
            <div className="text-xs text-muted-foreground mb-2">{MOCK_LEADERS[1].xp.toLocaleString('en-IN')} XP</div>
            <div className="h-16 bg-secondary/20 rounded-t-xl flex items-center justify-center text-2xl font-black text-secondary">2</div>
          </motion.div>
          {/* Rank 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-center"
          >
            <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <div className="text-4xl mb-2">{MOCK_LEADERS[0].avatar}</div>
            <div className="font-bold mb-1">{MOCK_LEADERS[0].displayName}</div>
            <div className="text-xs text-muted-foreground mb-2">{MOCK_LEADERS[0].xp.toLocaleString('en-IN')} XP</div>
            <div className="h-24 brand-gradient rounded-t-xl flex items-center justify-center text-2xl font-black text-white">1</div>
          </motion.div>
          {/* Rank 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center"
          >
            <div className="text-3xl mb-2">{MOCK_LEADERS[2].avatar}</div>
            <div className="font-bold text-sm mb-1">{MOCK_LEADERS[2].displayName}</div>
            <div className="text-xs text-muted-foreground mb-2">{MOCK_LEADERS[2].xp.toLocaleString('en-IN')} XP</div>
            <div className="h-12 bg-amber-100 rounded-t-xl flex items-center justify-center text-2xl font-black text-amber-600">3</div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-border rounded-xl p-1 mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {MOCK_LEADERS.map((leader, i) => (
          <motion.div
            key={leader.username}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-xl border border-border p-4 flex items-center gap-3"
          >
            {/* Rank */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
              leader.rank === 1 ? 'brand-gradient text-white'
              : leader.rank === 2 ? 'bg-secondary/20 text-secondary'
              : leader.rank === 3 ? 'bg-amber-100 text-amber-600'
              : 'bg-muted text-muted-foreground'
            }`}>
              {leader.rank}
            </div>

            {/* Avatar */}
            <div className="text-2xl flex-shrink-0">{leader.avatar}</div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{leader.displayName}</div>
              <div className="text-xs text-muted-foreground">@{leader.username} · Level {leader.level}</div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-muted-foreground">Return</div>
                <div className="text-xs font-bold text-green-600">+{leader.portfolioReturn}%</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {leader.xp.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-0.5 text-xs text-orange-500">
                  <Flame className="w-3 h-3" />
                  {leader.streak}d
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Current user */}
        {userProfile && (
          <div className="border-t border-border pt-2">
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-black text-muted-foreground flex-shrink-0">
                {userRank}
              </div>
              <div className="text-xl flex-shrink-0">{userProfile.avatarId || '🎯'}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{userProfile.displayName} <span className="text-xs text-primary font-medium">(you)</span></div>
                <div className="text-xs text-muted-foreground">@{userProfile.username} · Level {userProfile.level}</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                {userProfile.xp.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
