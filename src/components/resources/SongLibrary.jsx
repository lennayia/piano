import { useState, useRef } from 'react';
import { Music, Play, Pause, BookOpen, Piano } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import PianoKeyboard from '../lessons/PianoKeyboard';

function SongLibrary() {
  const [playingSong, setPlayingSong] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [showKeyboard, setShowKeyboard] = useState(null);
  const playingRef = useRef(false);

  const songs = [
    {
      id: 1,
      title: 'Skákal pes přes oves',
      difficulty: 'začátečník',
      notes: ['C', 'C', 'D', 'E', 'E', 'D', 'C'],
      tempo: 'Allegro',
      key: 'C dur',
      tips: 'Doprovod: C dur - F dur - G dur - C dur'
    },
    {
      id: 2,
      title: 'Holka modrooká',
      difficulty: 'začátečník',
      notes: ['C', 'D', 'E', 'F', 'G', 'G', 'G'],
      tempo: 'Moderato',
      key: 'C dur',
      tips: 'Doprovod: C dur - G dur - C dur'
    },
    {
      id: 3,
      title: 'Když jsem já šel okolo vrat',
      difficulty: 'mírně pokročilý',
      notes: ['D', 'D', 'D', 'D', 'E', 'F#', 'G', 'A', 'A', 'A', 'A', 'H', 'C', 'D'],
      tempo: 'Andante',
      key: 'G dur',
      tips: 'Doprovod: G dur - D dur - Em - C dur - G dur'
    },
    {
      id: 4,
      title: 'Ach synku, synku',
      difficulty: 'začátečník',
      notes: ['C', 'C', 'C', 'C', 'D', 'E', 'F', 'E', 'E', 'E', 'E', 'F', 'G'],
      tempo: 'Moderato',
      key: 'C dur',
      tips: 'Doprovod: C dur - F dur - G dur - C dur'
    },
    {
      id: 5,
      title: 'Slyšel jsem zvon',
      difficulty: 'mírně pokročilý',
      notes: ['D', 'F#', 'A', 'A', 'G', 'F#', 'E', 'D'],
      tempo: 'Andante',
      key: 'D dur',
      tips: 'Doprovod: D dur - A dur - Hm - G dur - D dur'
    },
    {
      id: 6,
      title: 'Twinkle Twinkle Little Star',
      difficulty: 'začátečník',
      notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'],
      tempo: 'Andante',
      key: 'C dur',
      tips: 'Doprovod: C dur - F dur - C dur - G dur - C dur'
    }
  ];

  const playMelody = async (song) => {
    if (playingRef.current && playingSong === song.id) {
      playingRef.current = false;
      setPlayingSong(null);
      setCurrentNoteIndex(-1);
      return;
    }

    playingRef.current = true;
    setPlayingSong(song.id);
    setCurrentNoteIndex(-1);

    for (let i = 0; i < song.notes.length; i++) {
      if (!playingRef.current) break;

      setCurrentNoteIndex(i);
      audioEngine.playNote(song.notes[i], 0.6);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    playingRef.current = false;
    setPlayingSong(null);
    setCurrentNoteIndex(-1);
  };

  const toggleKeyboard = (songId) => {
    setShowKeyboard(showKeyboard === songId ? null : songId);
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
      <h2 style={{ marginBottom: '1.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Music size={28} color="var(--color-primary)" />
        Playlist lidových písní
      </h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
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
            whileHover={{
              y: -4,
              boxShadow: '0 12px 40px rgba(181, 31, 101, 0.25)'
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '1.5rem' }}>
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playMelody(song)}
                style={{
                  width: '64px',
                  height: '64px',
                  background: playingSong === song.id
                    ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(45, 91, 120, 0.9) 0%, rgba(65, 111, 140, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: playingSong === song.id
                    ? '0 8px 32px rgba(181, 31, 101, 0.5)'
                    : '0 8px 32px rgba(45, 91, 120, 0.4)',
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

                {/* Noty s vizualizací */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {song.notes.map((note, noteIndex) => {
                      const isCurrent = playingSong === song.id && currentNoteIndex === noteIndex;
                      const isNext = playingSong === song.id && currentNoteIndex + 1 === noteIndex;

                      return (
                        <motion.div
                          key={noteIndex}
                          animate={{
                            scale: isCurrent ? 1.3 : isNext ? 1.1 : 1,
                            backgroundColor: isCurrent
                              ? 'rgba(181, 31, 101, 0.4)'
                              : isNext
                              ? 'rgba(181, 31, 101, 0.15)'
                              : 'rgba(45, 91, 120, 0.1)'
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isCurrent || isNext ? 'var(--color-primary)' : 'var(--color-secondary)',
                            border: isCurrent
                              ? '2px solid var(--color-primary)'
                              : isNext
                              ? '2px dashed var(--color-primary)'
                              : '1px solid rgba(45, 91, 120, 0.2)',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          {note}
                          {isNext && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                fontSize: '0.75rem'
                              }}
                            >
                              ▶
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleKeyboard(song.id)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <Piano size={16} />
                    {showKeyboard === song.id ? 'Skrýt klavír' : 'Zkusit na klavíru'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showKeyboard === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '1rem', marginBottom: '1rem' }}
                    >
                      <PianoKeyboard highlightedNotes={song.notes} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {playingSong === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '1rem',
                        background: 'rgba(45, 91, 120, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 'var(--radius)',
                        marginTop: '0.75rem',
                        border: '2px solid rgba(45, 91, 120, 0.3)',
                        boxShadow: '0 4px 16px rgba(45, 91, 120, 0.2)'
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
