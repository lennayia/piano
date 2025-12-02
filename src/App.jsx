import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useUserStore from './store/useUserStore';
import useAchievementsStore from './store/useAchievementsStore';
import './styles/index.css';

// Lazy load page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Registration = lazy(() => import('./pages/Registration'));
const PianoLogin = lazy(() => import('./pages/PianoLogin'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const Lekce = lazy(() => import('./pages/Lekce'));
const Admin = lazy(() => import('./pages/Admin'));
const Lesson = lazy(() => import('./pages/Lesson'));
const History = lazy(() => import('./pages/History'));
const Cviceni = lazy(() => import('./pages/Cviceni'));
const TheoryQuizzes = lazy(() => import('./pages/TheoryQuizzes'));

function App() {
  const initAuth = useUserStore((state) => state.initAuth);
  const loadAchievements = useAchievementsStore((state) => state.loadAchievements);

  useEffect(() => {
    // Initialize authentication state on app load
    initAuth();

    // Preload achievements for performance (OPTIMALIZACE!)
    loadAchievements();
  }, [initAuth, loadAchievements]);

  return (
    <Router>
      <Layout>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Načítání...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Veřejné routes */}
            <Route path="/" element={<Home />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/piano-login" element={<PianoLogin />} />

            {/* Chráněné routes - vyžadují přihlášení */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/lekce" element={<ProtectedRoute><Lekce /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/lesson/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            <Route path="/cviceni" element={<ProtectedRoute><Cviceni /></ProtectedRoute>} />
            <Route path="/theory-quizzes" element={<ProtectedRoute><TheoryQuizzes /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
