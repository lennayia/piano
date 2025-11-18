import { Link } from 'react-router-dom';
import { Piano, User, Home, BookOpen } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

function Header() {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <header style={{
      backgroundColor: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 0',
      marginBottom: '2rem'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--color-text)',
            fontWeight: 600,
            fontSize: '1.25rem'
          }}>
            <Piano size={28} />
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
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius)'
              }}>
                <User size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </div>
            ) : (
              <Link to="/registration" className="btn btn-primary">
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
