import { useNavigate } from 'react-router-dom';
import { Piano, BookOpen, Trophy, Users } from 'lucide-react';
import useUserStore from '../store/useUserStore';

function Home() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  const features = [
    {
      icon: BookOpen,
      title: 'Strukturované lekce',
      description: 'Postupujte krok za krokem od základů k pokročilým technikám'
    },
    {
      icon: Trophy,
      title: 'Sledujte pokrok',
      description: 'Zaznamenávejte svůj postup a motivujte se k dalšímu učení'
    },
    {
      icon: Users,
      title: 'Pro všechny úrovně',
      description: 'Od začátečníků po pokročilé, každý najde své lekce'
    }
  ];

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{
          width: '96px',
          height: '96px',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <Piano size={48} color="var(--color-primary)" />
        </div>

        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Naučte se hrát na klavír
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Moderní způsob výuky klavíru pro začátečníky i pokročilé. Začněte svou hudební cestu ještě dnes.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {currentUser ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Pokračovat v učení
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/registration')} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Začít zdarma
              </button>
              <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Admin přístup
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Proč si vybrat naši aplikaci
        </h2>

        <div className="grid grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Icon size={32} color="var(--color-primary)" />
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      {!currentUser && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Připraveni začít?</h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Registrace je rychlá a jednoduchá. Začněte se učit během několika vteřin.
          </p>
          <button onClick={() => navigate('/registration')} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Začít učit se
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
