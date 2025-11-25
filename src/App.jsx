import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import PianoLogin from './pages/PianoLogin';
import UserDashboard from './pages/UserDashboard';
import Lekce from './pages/Lekce';
import Admin from './pages/Admin';
import Lesson from './pages/Lesson';
import History from './pages/History';
import Cviceni from './pages/Cviceni';
import TheoryQuizzes from './pages/TheoryQuizzes';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useUserStore from './store/useUserStore';
import './styles/index.css';

function App() {
  const initAuth = useUserStore((state) => state.initAuth);

  useEffect(() => {
    // Initialize authentication state on app load
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Layout>
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
      </Layout>
    </Router>
  );
}

export default App;
