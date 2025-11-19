import RegistrationForm from '../components/auth/RegistrationForm';
import { Piano } from 'lucide-react';
import { motion } from 'framer-motion';

function Registration() {
  // Placeholder pro fotku klavíristky
  // INSTRUKCE: Nahraďte tuto URL vlastní fotkou klavíristky
  // Umístěte fotku do public/images/pianist.jpg a změňte URL na "/images/pianist.jpg"
  const pianistPhoto = "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=1000&fit=crop";

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0,
      overflow: 'hidden'
    }}>
      {/* Levá strana - Fotka klavíristky s glassmorphism efekty */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'relative',
          backgroundImage: `url(${pianistPhoto})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Glassmorphism overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.3) 0%, rgba(45, 91, 120, 0.5) 100%)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }} />

        {/* Kouřový efekt - floating particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          opacity: 0.6,
          animation: 'float 8s ease-in-out infinite'
        }} />

        {/* Glassmorphism card s textem */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            right: '10%',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Piano size={40} color="#ffffff" />
            <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.75rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Naučte se hrát na klavír
            </h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: '1.125rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Moderní způsob výuky klavíru s harmonizací a doprovodem
          </p>
        </motion.div>
      </motion.div>

      {/* Pravá strana - Formulář */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--gradient-bg)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <RegistrationForm />
        </div>
      </motion.div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            33% {
              transform: translateY(-20px) translateX(10px);
            }
            66% {
              transform: translateY(10px) translateX(-10px);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Registration;
