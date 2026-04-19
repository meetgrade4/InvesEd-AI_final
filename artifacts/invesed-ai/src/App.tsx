import { Switch, Route, Router as WouterRouter, useLocation } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import ChatBot from './components/ChatBot';
import GuidedDashboard from './pages/GuidedDashboard/GuidedDashboard';

import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import RiskQuiz from './pages/Onboarding/RiskQuiz';
import OnboardingResult from './pages/Onboarding/OnboardingResult';
import AcademyHome from './pages/Academy/AcademyHome';
import ModuleView from './pages/Academy/ModuleView';
import LessonView from './pages/Academy/LessonView';
import ModuleQuiz from './pages/Academy/ModuleQuiz';
import UpgradePage from './pages/Upgrade/UpgradePage';
import Portfolio from './pages/Simulator/Portfolio';
import ResearchHome from './pages/Research/ResearchHome';
import StockDetail from './pages/Research/StockDetail';
import RoundsHome from './pages/SituationRounds/RoundsHome';
import RoundPlay from './pages/SituationRounds/RoundPlay';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Profile from './pages/Profile/Profile';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <a href="/" className="text-secondary hover:underline">Go Home</a>
        </div>
      </div>
    </PageTransition>
  );
}

function AppRoutes() {
  const [location] = useLocation();
  const { theme } = useTheme();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/" component={() => <PageTransition><Landing /></PageTransition>} />
          <Route path="/login" component={() => <PageTransition><Login /></PageTransition>} />
          <Route path="/signup" component={() => <PageTransition><SignUp /></PageTransition>} />
          <Route path="/onboarding/quiz" component={() => <PageTransition><RiskQuiz /></PageTransition>} />
          <Route path="/onboarding/result" component={() => <PageTransition><OnboardingResult /></PageTransition>} />
          <Route path="/academy" component={() => <PageTransition><AcademyHome /></PageTransition>} />
          <Route path="/academy/:moduleId/quiz" component={(params) => <PageTransition><ModuleQuiz params={params} /></PageTransition>} />
          <Route path="/academy/:moduleId/lesson/:lessonId" component={(params) => <PageTransition><LessonView params={params} /></PageTransition>} />
          <Route path="/academy/:moduleId" component={(params) => <PageTransition><ModuleView params={params} /></PageTransition>} />
          <Route path="/upgrade" component={() => <PageTransition><UpgradePage /></PageTransition>} />
          <Route path="/portfolio" component={() => <PageTransition><Portfolio /></PageTransition>} />
          <Route path="/dashboard" component={() => <PageTransition><GuidedDashboard /></PageTransition>} />
          <Route path="/research/fund/:fundCode" component={() => <PageTransition><div className="max-w-2xl mx-auto px-4 py-8 text-center"><h2 className="text-xl font-bold">Fund detail coming soon</h2></div></PageTransition>} />
          <Route path="/research/:ticker" component={(params) => <PageTransition><StockDetail params={params} /></PageTransition>} />
          <Route path="/research" component={() => <PageTransition><ResearchHome /></PageTransition>} />
          <Route path="/rounds/:roundId" component={(params) => <PageTransition><RoundPlay params={params} /></PageTransition>} />
          <Route path="/rounds" component={() => <PageTransition><RoundsHome /></PageTransition>} />
          <Route path="/leaderboard" component={() => <PageTransition><Leaderboard /></PageTransition>} />
          <Route path="/profile" component={() => <PageTransition><Profile /></PageTransition>} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
      <ChatBot />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'font-sans text-sm',
          style: {
            borderRadius: '12px',
            background: theme === 'dark' ? '#1a2744' : '#1E3A5F',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRoutes />
          </WouterRouter>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
