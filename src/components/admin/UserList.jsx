import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Mail, Calendar, Shield, ShieldOff, LogIn, Hash, Eye, X, CheckCircle, Trophy, ArrowUpDown, ArrowUp, ArrowDown, Piano, Star, Target, GraduationCap, BookOpen, Flame, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import * as LucideIcons from 'lucide-react';

// Dynamické renderování ikony odměny podle dat z databáze
const getAchievementIcon = (achievement, size = 20) => {
  // Pokud máme icon_type z databáze, použijeme ho
  if (achievement.icon_type) {
    const IconComponent = LucideIcons[achievement.icon_type];
    const color = achievement.icon_color || 'primary';

    if (IconComponent) {
      return <IconComponent size={size} color={`var(--color-${color})`} />;
    }
  }

  // Fallback: pokud nemáme icon_type, použijeme staré emoji mapování (zpětná kompatibilita)
  const iconMap = {
    '🎹': <Piano size={size} color="var(--color-primary)" />,
    '📚': <BookOpen size={size} color="var(--color-secondary)" />,
    '🎓': <GraduationCap size={size} color="var(--color-primary)" />,
    '🔥': <Flame size={size} color="var(--color-secondary)" />,
    '⭐': <Star size={size} color="var(--color-primary)" />,
    '💯': <Target size={size} color="var(--color-secondary)" />,
    '🏆': <Trophy size={size} color="var(--color-primary)" />
  };

  return iconMap[achievement.icon] || <Award size={size} color="var(--color-primary)" />;
};

function UserList() {
  const users = useUserStore((state) => state.users);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const toggleAdminRole = useUserStore((state) => state.toggleAdminRole);
  const [selectedUser, setSelectedUser] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Poslouchej změny velikosti okna
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Funkce pro třídění
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Setříděné uživatelé
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;

    switch (sortConfig.key) {
      case 'name':
        aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        break;
      case 'email':
        aValue = (a.email || '').toLowerCase();
        bValue = (b.email || '').toLowerCase();
        break;
      case 'role':
        aValue = a.is_admin ? 1 : 0;
        bValue = b.is_admin ? 1 : 0;
        break;
      case 'created_at':
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
        break;
      case 'login_count':
        aValue = a.login_count || 0;
        bValue = b.login_count || 0;
        break;
      case 'last_login':
        aValue = new Date(a.last_login || 0).getTime();
        bValue = new Date(b.last_login || 0).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Ikona pro třídění
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} color="var(--color-primary)" />
      : <ArrowDown size={14} color="var(--color-primary)" />;
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Opravdu chcete smazat uživatele ${userName}?`)) {
      deleteUser(userId);
    }
  };

  const handleToggleAdmin = (userId, userName, isCurrentlyAdmin) => {
    const action = isCurrentlyAdmin ? 'odebrat admin práva' : 'přidat admin práva';
    if (window.confirm(`Opravdu chcete ${action} pro ${userName}?`)) {
      toggleAdminRole(userId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (users.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '3rem' }}>
        <p className="text-secondary">Zatím se neregistroval žádný uživatel.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>
          Registrovaní uživatelé ({users.length})
        </h2>

        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table className="table" style={{
            width: '100%',
            fontSize: isMobile ? '0.8125rem' : 'inherit'
          }}>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 31, 101, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    fontSize: isMobile ? '0.75rem' : 'inherit',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Jméno</span>
                    <SortIcon columnKey="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 31, 101, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    fontSize: isMobile ? '0.75rem' : 'inherit',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Email</span>
                    <SortIcon columnKey="email" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 31, 101, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    display: isMobile ? 'none' : 'table-cell',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Role</span>
                    <SortIcon columnKey="role" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 31, 101, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    display: isMobile ? 'none' : 'table-cell',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Registrace</span>
                    <SortIcon columnKey="created_at" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('login_count')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 31, 101, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    display: isMobile ? 'none' : 'table-cell',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Počet přihlášení</span>
                    <SortIcon columnKey="login_count" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('last_login')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181, 31, 101, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    display: isMobile ? 'none' : 'table-cell',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Poslední přihlášení</span>
                    <SortIcon columnKey="last_login" />
                  </div>
                </th>
                <th style={{ display: isMobile ? 'none' : 'table-cell' }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(45, 91, 120, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    fontWeight: 500,
                    fontSize: isMobile ? '0.8125rem' : 'inherit'
                  }}>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : (user.email || '—')}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.25rem' : '0.5rem'
                    }}>
                      <Mail size={isMobile ? 14 : 16} color="var(--color-text-secondary)" />
                      <a href={`mailto:${user.email}`} style={{
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontSize: isMobile ? '0.8125rem' : 'inherit'
                      }}>
                        {user.email}
                      </a>
                    </div>
                  </td>
                  <td style={{ display: isMobile ? 'none' : 'table-cell' }}>
                    {user.is_admin ? (
                      <span className="badge" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        width: 'fit-content'
                      }}>
                        <Shield size={14} />
                        Admin
                      </span>
                    ) : (
                      <span className="badge badge-secondary">Uživatel</span>
                    )}
                  </td>
                  <td style={{ display: isMobile ? 'none' : 'table-cell' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Calendar size={16} color="var(--color-text-secondary)" />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td style={{ display: isMobile ? 'none' : 'table-cell' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Hash size={16} color="var(--color-secondary)" />
                      <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                        {user.login_count || 0}×
                      </span>
                    </div>
                  </td>
                  <td style={{ display: isMobile ? 'none' : 'table-cell' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <LogIn size={16} color="var(--color-text-secondary)" />
                      {formatDate(user.last_login)}
                    </div>
                  </td>
                  <td style={{ display: isMobile ? 'none' : 'table-cell' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="btn btn-primary"
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        minWidth: 'auto'
                      }}
                      title="Zobrazit detail"
                    >
                      <Eye size={14} />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogové okno s detailem uživatele - renderované mimo DOM pomocí portalu */}
      {createPortal(
        <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop s glassmorphism efekty + wrapper pro centrování */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflowY: 'auto',
                padding: isMobile ? '2vh 0' : '3vh 0'
              }}
            >
              {/* Kouřový efekt */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 30% 50%, rgba(181, 31, 101, 0.2) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Modal obsah */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  width: isMobile ? '95%' : windowWidth < 1024 ? '85%' : windowWidth < 1440 ? '75%' : windowWidth < 1920 ? '65%' : '55%',
                  maxWidth: '900px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  padding: isMobile ? '1.5rem' : windowWidth < 1024 ? '1.75rem' : '2rem',
                  margin: '0 auto'
                }}
              >
              {/* Zavírací tlačítko */}
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={20} color="var(--color-danger)" />
              </button>

              {/* Hlavička */}
              <div style={{ marginBottom: isMobile ? '1rem' : '1.25rem' }}>
                <h2 style={{
                  marginBottom: '0.5rem',
                  color: '#1e293b',
                  fontSize: isMobile ? '1.125rem' : '1.25rem'
                }}>
                  Detail uživatele
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.5rem' : '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <div style={{
                    width: isMobile ? '40px' : '50px',
                    height: isMobile ? '40px' : '50px',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(45, 91, 120, 0.2) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    fontWeight: 600,
                    color: 'var(--color-primary)'
                  }}>
                    {selectedUser.first_name && selectedUser.last_name
                      ? `${selectedUser.first_name[0]}${selectedUser.last_name[0]}`
                      : (selectedUser.email?.[0]?.toUpperCase() || '?')}
                  </div>
                  <div>
                    <h3 style={{
                      marginBottom: '0.25rem',
                      color: '#1e293b',
                      fontSize: isMobile ? '0.9375rem' : '1rem'
                    }}>
                      {selectedUser.first_name && selectedUser.last_name
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.email}
                    </h3>
                    <p style={{
                      fontSize: isMobile ? '0.75rem' : '0.8125rem',
                      color: '#64748b'
                    }}>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <div style={{ marginTop: '0.75rem' }}>
                  {selectedUser.is_admin ? (
                    <span className="badge" style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--color-danger)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8125rem'
                    }}>
                      <Shield size={14} />
                      Administrátor
                    </span>
                  ) : (
                    <span className="badge badge-secondary" style={{
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8125rem'
                    }}>
                      Běžný uživatel
                    </span>
                  )}
                </div>
              </div>

              {/* Admin akce */}
              <div style={{
                marginBottom: isMobile ? '1rem' : '1.25rem',
                padding: isMobile ? '0.75rem' : '0.875rem',
                background: 'rgba(45, 91, 120, 0.05)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(45, 91, 120, 0.2)'
              }}>
                <h3 style={{
                  marginBottom: '0.75rem',
                  color: '#1e293b',
                  fontSize: isMobile ? '0.8125rem' : '0.875rem',
                  fontWeight: 600
                }}>
                  Akce správce
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <button
                    onClick={() => {
                      handleToggleAdmin(
                        selectedUser.id,
                        selectedUser.first_name && selectedUser.last_name
                          ? `${selectedUser.first_name} ${selectedUser.last_name}`
                          : selectedUser.email,
                        selectedUser.is_admin
                      );
                      setSelectedUser(null);
                    }}
                    className={selectedUser.is_admin ? 'btn btn-secondary' : 'btn btn-warning'}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {selectedUser.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                    {selectedUser.is_admin ? 'Odebrat admin práva' : 'Přidat admin práva'}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(
                        selectedUser.id,
                        selectedUser.first_name && selectedUser.last_name
                          ? `${selectedUser.first_name} ${selectedUser.last_name}`
                          : selectedUser.email
                      );
                      setSelectedUser(null);
                    }}
                    className="btn btn-danger"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Smazat uživatele
                  </button>
                </div>
              </div>

              {/* Základní informace */}
              <div style={{
                marginBottom: isMobile ? '1rem' : '1.25rem',
                padding: isMobile ? '0.75rem' : '0.875rem',
                background: 'rgba(181, 31, 101, 0.05)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(181, 31, 101, 0.2)'
              }}>
                <h3 style={{
                  marginBottom: '0.75rem',
                  color: '#1e293b',
                  fontSize: isMobile ? '0.8125rem' : '0.875rem',
                  fontWeight: 600
                }}>
                  Základní informace
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Registrace</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                      {formatDate(selectedUser.created_at)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Poslední přihlášení</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                      {formatDate(selectedUser.last_login)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiky */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: isMobile ? '1rem' : '1.25rem'
              }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(45, 91, 120, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(45, 91, 120, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <Hash size={14} color="var(--color-secondary)" />
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Přihlášení</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {selectedUser.login_count || 0}×
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(181, 31, 101, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(181, 31, 101, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <CheckCircle size={14} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Dokončeno</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {selectedUser.stats?.lessons_completed || 0} lekcí
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <Trophy size={14} color="var(--color-success)" />
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Body (XP)</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-success)' }}>
                    {selectedUser.stats?.total_xp || 0}
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(251, 146, 60, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(251, 146, 60, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <Calendar size={14} color="#fb923c" />
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Série dnů</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fb923c' }}>
                    {selectedUser.stats?.current_streak || 0}
                  </div>
                </div>
              </div>

              {/* Odměny (Achievements) */}
              {selectedUser.achievements && selectedUser.achievements.length > 0 && (
                <div style={{ marginBottom: isMobile ? '1rem' : '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.75rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    <Trophy size={16} color="var(--color-primary)" />
                    Získané odměny
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {selectedUser.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(181, 31, 101, 0.05)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid rgba(181, 31, 101, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          border: '2px solid rgba(181, 31, 101, 0.2)',
                          flexShrink: 0
                        }}>
                          {getAchievementIcon(achievement, 20)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8125rem' }}>
                            {achievement.title}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                            +{achievement.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aktivita */}
              <div>
                <h3 style={{ marginBottom: '0.75rem', color: '#1e293b', fontSize: '0.875rem', fontWeight: 600 }}>
                  Poslední aktivita
                </h3>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(45, 91, 120, 0.05)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(45, 91, 120, 0.2)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Celková cvičební doba</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
                        {Math.floor((selectedUser.stats?.total_practice_time || 0) / 60)} min
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Aktuální level</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
                        Level {selectedUser.stats?.level || 1}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Nejlepší série</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
                        {selectedUser.stats?.best_streak || 0} dní
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Poslední aktivita</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
                        {selectedUser.stats?.last_activity_date
                          ? new Date(selectedUser.stats.last_activity_date).toLocaleDateString('cs-CZ')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default UserList;
