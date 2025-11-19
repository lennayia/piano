import { useNavigate } from 'react-router-dom';
import { Piano, BookOpen, Trophy, Users, Music2, Heart, GraduationCap, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import audioEngine from '../utils/audio';

function Home() {
  const navigate = useNavigate();

  const scrollToLogin = () => {
    audioEngine.playClick();
    const loginSection = document.getElementById('login-cta');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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

  const targetAudience = [
    {
      icon: Music2,
      title: 'Umím zahrát melodii',
      description: 'ale chci ji oživit a harmonizovat',
      color: 'rgba(45, 91, 120, 0.1)'
    },
    {
      icon: Heart,
      title: 'Hraju ve sboru',
      description: 'a potřebuji doprovázet písně',
      color: 'rgba(181, 31, 101, 0.1)'
    },
    {
      icon: GraduationCap,
      title: 'Učím děti',
      description: 'a chci být samostatnější v doprovodu',
      color: 'rgba(45, 91, 120, 0.1)'
    }
  ];

  const courseModules = [
    {
      title: 'Základní harmonické funkce',
      description: 'Naučte se rozpoznávat a používat hlavní harmonické funkce',
      completed: true
    },
    {
      title: 'Kadence a postupy akordů',
      description: 'Pochopte, jak fungují kadence a jak je aplikovat',
      completed: true
    },
    {
      title: 'Praktická harmonizace',
      description: 'Harmonizujte 5 lidových písní od základu',
      completed: false
    },
    {
      title: 'Doprovod ve sboru',
      description: 'Naučte se doprovázet sborové písně s jistotou',
      completed: false
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
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToLogin}
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
          >
            Přihlásit se
          </motion.button>
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

      {/* Pro koho je to Section */}
      <div style={{ padding: '4rem 0', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius)', margin: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#ffffff' }}>
          Pro koho je tento kurz určený
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '3rem', fontSize: '1.125rem' }}>
          Pokud se v některé z těchto situací poznáváte, tento kurz je přesně pro vás
        </p>

        <div className="grid grid-cols-3">
          {targetAudience.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <motion.div
                key={index}
                className="card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                whileHover={{ y: -8, scale: 1.03 }}
                style={{
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '72px',
                    height: '72px',
                    background: audience.color,
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 4px 20px rgba(45, 91, 120, 0.2)'
                  }}
                >
                  <Icon size={36} color="var(--color-secondary)" />
                </motion.div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: '#1e293b', fontWeight: 600 }}>
                  {audience.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                  {audience.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Co se naučíš Section */}
      <div style={{ padding: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#ffffff' }}>
          Co konkrétně se naučíte
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '3rem', fontSize: '1.125rem' }}>
          Kurz je rozdělen do modulů, které vás provedou od základů k praktické aplikaci
        </p>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {courseModules.map((module, index) => (
            <motion.div
              key={index}
              className="card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              style={{
                marginBottom: '1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'start',
                gap: '1rem'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                style={{
                  width: '48px',
                  height: '48px',
                  background: module.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(45, 91, 120, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {module.completed ? (
                  <CheckCircle2 size={24} color="var(--color-success)" />
                ) : (
                  <Sparkles size={24} color="var(--color-secondary)" />
                )}
              </motion.div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#1e293b', fontWeight: 600 }}>
                  {module.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                  {module.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* O Evě Section */}
      <div style={{ padding: '4rem 0', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius)', margin: '2rem 0' }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: '2rem' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(45, 91, 120, 0.2) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 32px rgba(181, 31, 101, 0.3)'
              }}
            >
              <Star size={60} color="var(--color-primary)" />
            </motion.div>
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>O lektorce Evě Lorenc</h2>
              <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.8, marginBottom: '1rem' }}>
                Eva Lorenc je zkušená klavíristka a pedagožka s více než 15 lety praxe. Specializuje se na harmonizaci a doprovod sborových písní.
              </p>
              <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.8, marginBottom: '1rem' }}>
                "Vytvořila jsem tento kurz, protože jsem viděla, jak mnoho lidí umí zahrát melodii, ale váhají s doprovodem.
                Chci vám ukázat, že harmonizace není složitá - stačí znát pár základních principů a můžete oživit jakoukoli píseň."
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={20} color="var(--color-secondary)" />
                  <span style={{ fontSize: '0.9375rem', color: '#64748b' }}>15+ let zkušeností</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="var(--color-secondary)" />
                  <span style={{ fontSize: '0.9375rem', color: '#64748b' }}>100+ studentů</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        id="login-cta"
        className="card"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(45, 91, 120, 0.1) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '2px solid rgba(181, 31, 101, 0.3)',
          boxShadow: '0 12px 48px rgba(181, 31, 101, 0.2)'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Sparkles size={48} color="var(--color-primary)" style={{ marginBottom: '1.5rem' }} />
        </motion.div>
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: '#ffffff' }}>Připraveni začít?</h2>
        <p style={{ marginBottom: '2.5rem', fontSize: '1.125rem', color: '#ffffff', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Registrace je rychlá a jednoduchá. Začněte se učit během několika vteřin a objevte krásu harmonizace.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            audioEngine.playClick();
            navigate('/registration');
          }}
          className="btn btn-primary"
          style={{
            fontSize: '1.125rem',
            padding: '1rem 3rem',
            boxShadow: '0 8px 24px rgba(45, 91, 120, 0.4)'
          }}
        >
          Přihlásit se
        </motion.button>
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#ffffff', opacity: 0.9 }}>
          ✓ Zdarma k vyzkoušení • ✓ Bez kreditní karty • ✓ Začněte ihned
        </p>
      </motion.div>
    </div>
  );
}

export default Home;
