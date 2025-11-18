import { Link } from 'react-router-dom';
import { Piano, User, Home, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function Header() {
  const currentUser = useUserStore((state) => state.currentUser);

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

            {currentUser && (
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
            )}

            {currentUser ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(37, 99, 235, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                color: '#1e293b'
              }}>
                <User size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </div>
            ) : (
              <Link
                to="/registration"
                className="btn btn-primary"
                onClick={() => audioEngine.playClick()}
              >
                Začít učit
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
