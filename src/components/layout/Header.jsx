import { Link, useNavigate } from 'react-router-dom';
import { Piano, User, Home, BookOpen, Lightbulb, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function Header() {
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    audioEngine.playClick();
    logout();
    navigate('/');
  };

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
            to="/"
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
              <Piano size={28} color="var(--color-primary)" />
            </motion.div>
            <span>Piano Learning</span>
          </Link>

          {currentUser && (
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <Home size={18} />
                <span>Domů</span>
              </Link>

              <Link to="/resources" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <Lightbulb size={18} />
                <span>Materiály</span>
              </Link>

              <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <BookOpen size={18} />
                <span>Moje lekce</span>
              </Link>

              {currentUser.isAdmin && (
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                  color: 'var(--color-danger)',
                  fontSize: '0.875rem',
                  fontWeight: 500
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
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(181, 31, 101, 0.2)',
                color: '#1e293b'
              }}>
                <User size={18} color="var(--color-primary)" />
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
                  background: 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--color-danger)',
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
