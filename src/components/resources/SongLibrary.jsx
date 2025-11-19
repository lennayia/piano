import { useState } from 'react';
import { Music, Play, Pause, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';

function SongLibrary() {
  const [playingSong, setPlayingSong] = useState(null);

  const songs = [
    {
      id: 1,
      title: 'Skákal pes přes oves',
      difficulty: 'začátečník',
      notes: ['C', 'C', 'D', 'E', 'E', 'D'],
      tempo: 'Allegro',
      key: 'C dur',
      tips: 'Doprovod: C dur - F dur - G dur - C dur'
    },
    {
      id: 2,
      title: 'Holka modrooká',
      difficulty: 'začátečník',
      notes: ['C', 'D', 'E', 'F', 'G', 'G'],
      tempo: 'Moderato',
      key: 'C dur',
      tips: 'Doprovod: C dur - G dur - C dur'
    },
    {
      id: 3,
      title: 'Když jsem já šel okolo vrat',
      difficulty: 'mírně pokročilý',
      notes: ['G', 'G', 'A', 'H', 'C', 'H', 'A'],
      tempo: 'Andante',
      key: 'G dur',
      tips: 'Doprovod: G dur - D dur - Em - C dur - G dur'
    },
    {
      id: 4,
      title: 'Ach synku, synku',
      difficulty: 'začátečník',
      notes: ['C', 'E', 'G', 'G', 'F', 'E', 'D'],
      tempo: 'Moderato',
      key: 'C dur',
      tips: 'Doprovod: C dur - F dur - G dur - C dur'
    },
    {
      id: 5,
      title: 'Sly jsem zvon',
      difficulty: 'mírně pokročilý',
      notes: ['D', 'F#', 'A', 'A', 'G', 'F#', 'E'],
      tempo: 'Andante',
      key: 'D dur',
      tips: 'Doprovod: D dur - A dur - Hm - G dur - D dur'
    }
  ];

  const playMelody = async (song) => {
    if (playingSong === song.id) {
      setPlayingSong(null);
      return;
    }

    setPlayingSong(song.id);

    for (let i = 0; i < song.notes.length; i++) {
      if (playingSong !== song.id) break;
      await audioEngine.playNote(song.notes[i], 0.5);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setPlayingSong(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý':
        return 'badge-warning';
      default:
        return '';
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Music size={28} color="var(--color-primary)" />
        Playlist lidových písní
      </h2>
      <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '1rem' }}>
        Procvičte si harmonizaci na těchto oblíbených lidových písních
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {songs.map((song, index) => (
          <motion.div
            key={song.id}
            className="card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '1.5rem' }}>
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playMelody(song)}
                style={{
                  width: '56px',
                  height: '56px',
                  background: playingSong === song.id
                    ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                    : 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(45, 91, 120, 0.3)',
                  flexShrink: 0,
                  transition: 'all 0.3s'
                }}
              >
                {playingSong === song.id ? (
                  <Pause size={24} color="#ffffff" />
                ) : (
                  <Play size={24} color="#ffffff" style={{ marginLeft: '3px' }} />
                )}
              </motion.button>

              {/* Song Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: 0, color: '#1e293b' }}>
                    {song.title}
                  </h3>
                  <span className={`badge ${getDifficultyColor(song.difficulty)}`}>
                    {song.difficulty}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Tónina:</strong> {song.key}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Tempo:</strong> {song.tempo}
                  </span>
                </div>

                <AnimatePresence>
                  {playingSong === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(45, 91, 120, 0.05)',
                        borderRadius: 'var(--radius)',
                        marginTop: '0.75rem',
                        border: '1px solid rgba(45, 91, 120, 0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <BookOpen size={16} color="var(--color-secondary)" />
                        <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>Tip pro harmonizaci:</strong>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        {song.tips}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default SongLibrary;
