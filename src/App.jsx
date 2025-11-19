import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import UserDashboard from './pages/UserDashboard';
import Admin from './pages/Admin';
import Lesson from './pages/Lesson';
import Resources from './pages/Resources';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Veřejné routes */}
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />

          {/* Chráněné routes - vyžadují přihlášení */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/lesson/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
