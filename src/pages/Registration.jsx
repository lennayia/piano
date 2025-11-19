import LoginForm from '../components/auth/LoginForm';
import { Piano } from 'lucide-react';
import { motion } from 'framer-motion';

function Registration() {
  // Placeholder pro fotku klavíristky
  // INSTRUKCE: Nahraďte tuto URL vlastní fotkou klavíristky
  // Umístěte fotku do public/images/pianist.jpg a změňte URL na "/images/pianist.jpg"
  const pianistPhoto = "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1920&h=1080&fit=crop";

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Fotka klavíristky jako pozadí */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${pianistPhoto})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }}>
        {/* Tmavý gradient overlay pro lepší čitelnost */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(45, 91, 120, 0.6) 50%, rgba(181, 31, 101, 0.4) 100%)'
        }} />

        {/* Glassmorphism overlay s blur efektem */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }} />

        {/* Kouřový efekt - animovaný */}
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
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)'
          }}
        />

        {/* Další kouřová vrstva */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 60%, rgba(181, 31, 101, 0.2) 0%, transparent 50%)',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)'
          }}
        />
      </div>

      {/* Přihlašovací formulář - hlavní obsah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '500px'
        }}
      >
        <LoginForm />
      </motion.div>

      {/* Dekorativní glassmorphism card dole (pouze na větších obrazovkách) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="bottom-card"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'white',
          fontSize: '0.875rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Piano size={20} />
        <span>Naučte se hrát na klavír - zábavně a efektivně</span>
      </motion.div>

      {/* CSS pro responzivitu */}
      <style>{`
        @media (max-width: 768px) {
          /* Na mobilech skrýt spodní card */
          .bottom-card {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          /* Na velmi malých obrazovkách zmenšit padding */
          body > div {
            padding: 1rem !important;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}

export default Registration;
