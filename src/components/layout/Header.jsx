import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Piano, User, BookOpen, Lightbulb, Shield, LogOut, Menu, X, ChevronDown, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function Header() {
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Zavřít dropdown při kliknutí mimo něj
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    audioEngine.playClick();
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleNavClick = () => {
    audioEngine.playClick();
    setMobileMenuOpen(false);
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
              <Piano size={28} color="var(--color-primary)" />
            </motion.div>
            <span>Piano learning</span>
          </Link>

          {currentUser && (
            <>
              {/* Desktop Navigation */}
              <nav className="desktop-nav" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <Link to="/dashboard" onClick={handleNavClick} style={{
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

                <Link to="/resources" onClick={handleNavClick} style={{
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

                {currentUser.is_admin && (
                  <Link to="/admin" onClick={handleNavClick} style={{
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

                {/* User Dropdown Menu */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      audioEngine.playClick();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: 'rgba(181, 31, 101, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 'calc(var(--radius) * 2)',
                      border: '1px solid rgba(181, 31, 101, 0.2)',
                      color: '#1e293b',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <User size={18} color="var(--color-primary)" />
                    <span>{currentUser.first_name} {currentUser.last_name}</span>
                    <motion.div
                      animate={{ rotate: userMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} color="var(--color-primary)" />
                    </motion.div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 0.5rem)',
                          right: 0,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid rgba(181, 31, 101, 0.2)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                          padding: '0.5rem',
                          minWidth: '200px',
                          zIndex: 1000
                        }}
                      >
                        <Link
                          to="/history"
                          onClick={() => {
                            audioEngine.playClick();
                            setUserMenuOpen(false);
                          }}
                          style={{
                            textDecoration: 'none'
                          }}
                        >
                          <motion.div
                            whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.1)' }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius)',
                              color: '#1e293b',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <History size={18} color="var(--color-primary)" />
                            <span>Historie</span>
                          </motion.div>
                        </Link>

                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.1)' }}
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            color: 'var(--color-primary)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <LogOut size={18} />
                          <span>Odhlásit se</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Mobile Hamburger Button */}
              <motion.button
                className="mobile-menu-button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  audioEngine.playClick();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                style={{
                  display: 'none',
                  padding: '0.5rem',
                  background: 'rgba(181, 31, 101, 0.1)',
                  border: '1px solid rgba(181, 31, 101, 0.2)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  color: 'var(--color-primary)'
                }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>

              {/* Mobile Menu */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.nav
                    className="mobile-nav"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderBottom: '1px solid var(--glass-border)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      display: 'none',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '1rem',
                      overflow: 'hidden'
                    }}
                  >
                    <Link to="/dashboard" onClick={handleNavClick} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      color: location.pathname === '/dashboard' || location.pathname.startsWith('/lesson')
                        ? 'var(--color-primary)'
                        : 'var(--color-text-secondary)',
                      fontSize: '1rem',
                      fontWeight: location.pathname === '/dashboard' || location.pathname.startsWith('/lesson') ? 600 : 500,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      background: location.pathname === '/dashboard' || location.pathname.startsWith('/lesson')
                        ? 'rgba(181, 31, 101, 0.1)'
                        : 'transparent'
                    }}>
                      <BookOpen size={20} />
                      <span>Moje lekce</span>
                    </Link>

                    <Link to="/resources" onClick={handleNavClick} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      color: location.pathname === '/resources'
                        ? 'var(--color-primary)'
                        : 'var(--color-text-secondary)',
                      fontSize: '1rem',
                      fontWeight: location.pathname === '/resources' ? 600 : 500,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      background: location.pathname === '/resources'
                        ? 'rgba(181, 31, 101, 0.1)'
                        : 'transparent'
                    }}>
                      <Lightbulb size={20} />
                      <span>Materiály</span>
                    </Link>

                    {currentUser.is_admin && (
                      <Link to="/admin" onClick={handleNavClick} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        color: location.pathname === '/admin'
                          ? 'var(--color-primary)'
                          : 'var(--color-text-secondary)',
                        fontSize: '1rem',
                        fontWeight: location.pathname === '/admin' ? 600 : 500,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        background: location.pathname === '/admin'
                          ? 'rgba(181, 31, 101, 0.1)'
                          : 'transparent'
                      }}>
                        <Shield size={20} />
                        <span>Admin</span>
                      </Link>
                    )}

                    <Link to="/history" onClick={handleNavClick} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      color: location.pathname === '/history'
                        ? 'var(--color-primary)'
                        : 'var(--color-text-secondary)',
                      fontSize: '1rem',
                      fontWeight: location.pathname === '/history' ? 600 : 500,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      background: location.pathname === '/history'
                        ? 'rgba(181, 31, 101, 0.1)'
                        : 'transparent'
                    }}>
                      <History size={20} />
                      <span>Historie</span>
                    </Link>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: 'rgba(181, 31, 101, 0.1)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid rgba(181, 31, 101, 0.2)',
                      color: '#1e293b',
                      marginTop: '0.5rem'
                    }}>
                      <User size={20} color="var(--color-primary)" />
                      <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                        {currentUser.first_name} {currentUser.last_name}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        background: 'rgba(181, 31, 101, 0.1)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid rgba(181, 31, 101, 0.2)',
                        color: 'var(--color-primary)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      <LogOut size={20} />
                      <span>Odhlásit se</span>
                    </motion.button>
                  </motion.nav>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
