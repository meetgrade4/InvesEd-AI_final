import { Switch, Route, Router as WouterRouter } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
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

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <a href="/" className="text-secondary hover:underline">Go Home</a>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/onboarding/quiz" component={RiskQuiz} />
        <Route path="/onboarding/result" component={OnboardingResult} />
        <Route path="/academy" component={AcademyHome} />
        <Route path="/academy/:moduleId/quiz" component={ModuleQuiz} />
        <Route path="/academy/:moduleId/lesson/:lessonId" component={LessonView} />
        <Route path="/academy/:moduleId" component={ModuleView} />
        <Route path="/upgrade" component={UpgradePage} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/dashboard" component={GuidedDashboard} />
        <Route path="/research/fund/:fundCode" component={() => <div className="max-w-2xl mx-auto px-4 py-8 text-center"><h2 className="text-xl font-bold">Fund detail coming soon</h2></div>} />
        <Route path="/research/:ticker" component={StockDetail} />
        <Route path="/research" component={ResearchHome} />
        <Route path="/rounds/:roundId" component={RoundPlay} />
        <Route path="/rounds" component={RoundsHome} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
      <ChatBot />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppRoutes />
        </WouterRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'font-sans text-sm',
            style: {
              borderRadius: '12px',
              background: '#1E3A5F',
              color: '#fff',
            },
          }}
        />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
