import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Piano, User, BookOpen, Lightbulb, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function Header() {
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    audioEngine.playClick();
    logout();
    navigate('/');
  };

  // Skrýt header na veřejné landing page a registraci
  if (location.pathname === '/' || location.pathname === '/registration') {
    return null;
  }

  return (
    <header style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '1rem 0',
      marginBottom: '2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link
            to="/dashboard"
            onClick={() => audioEngine.playClick()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: '1.25rem',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <motion.div whileHover={{ rotate: 10 }}>
              <Piano size={28} color="#64748b" />
            </motion.div>
            <span>Piano Learning</span>
          </Link>

          {currentUser && (
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: location.pathname === '/dashboard' || location.pathname.startsWith('/lesson')
                  ? 'var(--color-primary)'
                  : 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: location.pathname === '/dashboard' || location.pathname.startsWith('/lesson') ? 600 : 500,
                transition: 'all 0.3s ease'
              }}>
                <BookOpen size={18} />
                <span>Moje lekce</span>
              </Link>

              <Link to="/resources" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: location.pathname === '/resources'
                  ? 'var(--color-primary)'
                  : 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: location.pathname === '/resources' ? 600 : 500,
                transition: 'all 0.3s ease'
              }}>
                <Lightbulb size={18} />
                <span>Materiály</span>
              </Link>

              {currentUser.isAdmin && (
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                  color: location.pathname === '/admin'
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === '/admin' ? 600 : 500,
                  transition: 'all 0.3s ease'
                }}>
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(181, 31, 101, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'calc(var(--radius) * 2)',
                border: '1px solid rgba(181, 31, 101, 0.2)',
                color: '#1e293b'
              }}>
                <User size={18} color="#64748b" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(181, 31, 101, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 'calc(var(--radius) * 2)',
                  border: '1px solid rgba(181, 31, 101, 0.2)',
                  color: 'var(--color-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <LogOut size={18} />
                <span>Odhlásit se</span>
              </motion.button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
