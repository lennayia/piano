import { useNavigate } from 'react-router-dom';
import { Piano, BookOpen, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../store/useUserStore';
import audioEngine from '../utils/audio';

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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', padding: '4rem 0' }}
      >
        <motion.div
          className="float"
          whileHover={{ scale: 1.1, rotate: 5 }}
          style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(214, 51, 132, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 8px 32px rgba(181, 31, 101, 0.3)'
          }}
        >
          <Piano size={48} color="var(--color-primary)" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ffffff' }}
        >
          Naučte se hrát na klavír
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '1.25rem',
            color: '#ffffff',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Moderní způsob výuky klavíru pro začátečníky i pokročilé. Začněte svou hudební cestu ještě dnes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
        >
          {currentUser ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                audioEngine.playClick();
                navigate('/dashboard');
              }}
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
            >
              Pokračovat v učení
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  audioEngine.playClick();
                  navigate('/registration');
                }}
                className="btn btn-primary"
                style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
              >
                Začít zdarma
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  audioEngine.playClick();
                  navigate('/admin');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
              >
                Admin přístup
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div style={{ padding: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: '#ffffff' }}>
          Proč si vybrat naši aplikaci
        </h2>

        <div className="grid grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.03 }}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(214, 51, 132, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 4px 20px rgba(181, 31, 101, 0.2)'
                  }}
                >
                  <Icon size={32} color="var(--color-primary)" />
                </motion.div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#1e293b' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      {!currentUser && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'rgba(181, 31, 101, 0.05)', border: '1px solid rgba(181, 31, 101, 0.1)' }}>
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
