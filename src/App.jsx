import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import UserDashboard from './pages/UserDashboard';
import Admin from './pages/Admin';
import Lesson from './pages/Lesson';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/lesson/:id" element={<Lesson />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
