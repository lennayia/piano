import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Music, Gamepad2, Book, Trophy, Calendar, Clock, Award } from 'lucide-react';
import useUserStore from '../store/useUserStore';
import { supabase } from '../lib/supabase';

function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, songs, quizzes, lessons
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      fetchUserHistory();
    }
  }, [currentUser]);

  const fetchUserHistory = async () => {
    setLoading(true);
    try {
      const allActivities = [];

      console.log('Načítám historii pro uživatele:', currentUser.id);

      // Fetch song completions
      const { data: songs, error: songsError } = await supabase
        .from('piano_song_completions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false });

      console.log('Songs:', songs, 'Error:', songsError);

      if (!songsError && songs) {
        songs.forEach(song => {
          allActivities.push({
            id: `song-${song.id}`,
            type: 'song',
            title: song.song_title,
            date: new Date(song.completed_at),
            xp: 100,
            isPerfect: song.is_perfect,
            mistakes: song.mistakes_count,
            icon: Music
          });
        });
      }

      // Fetch quiz completions
      const { data: quizzes, error: quizzesError } = await supabase
        .from('piano_quiz_completions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false });

      console.log('Quizzes:', quizzes, 'Error:', quizzesError);

      if (!quizzesError && quizzes) {
        quizzes.forEach(quiz => {
          allActivities.push({
            id: `quiz-${quiz.id}`,
            type: 'quiz',
            title: 'Poznáte akord?',
            date: new Date(quiz.completed_at),
            xp: quiz.xp_earned || 50,
            score: quiz.score,
            totalQuestions: quiz.total_questions,
            icon: Gamepad2
          });
        });
      }

      // Fetch lesson completions
      const { data: lessons, error: lessonsError } = await supabase
        .from('piano_lesson_completions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false });

      if (!lessonsError && lessons) {
        lessons.forEach(lesson => {
          allActivities.push({
            id: `lesson-${lesson.id}`,
            type: 'lesson',
            title: lesson.lesson_title || 'Lekce',
            date: new Date(lesson.completed_at),
            xp: lesson.xp_earned || 50,
            icon: Book
          });
        });
      }

      // Sort by date (newest first)
      allActivities.sort((a, b) => b.date - a.date);

      console.log('Celkem aktivit:', allActivities.length);
      console.log('Aktivity:', allActivities);

      setActivities(allActivities);
    } catch (error) {
      console.error('Chyba při načítání historie:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'songs') return activity.type === 'song';
    if (filter === 'quizzes') return activity.type === 'quiz';
    if (filter === 'lessons') return activity.type === 'lesson';
    return true;
  });

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const totalXP = activities.reduce((sum, activity) => sum + activity.xp, 0);
  const songCount = activities.filter(a => a.type === 'song').length;
  const quizCount = activities.filter(a => a.type === 'quiz').length;
  const lessonCount = activities.filter(a => a.type === 'lesson').length;

  const filterButtons = [
    { id: 'all', label: 'Všechno', icon: HistoryIcon },
    { id: 'lessons', label: 'Lekce', icon: Book },
    { id: 'songs', label: 'Písničky', icon: Music },
    { id: 'quizzes', label: 'Kvízy', icon: Gamepad2 },
  ];

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--color-border)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(181, 31, 101, 0.2)',
          boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
        }}>
          <HistoryIcon size={24} color="var(--color-primary)" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.25rem', color: '#1e293b' }}>Historie aktivit</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Přehled všech dokončených aktivit a získaných bodů
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(221, 51, 121, 0.1) 100%)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Award size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {totalXP}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Celkem XP</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Book size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
            {lessonCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených lekcí</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Music size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
            {songCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených písní</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="card"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}
        >
          <Gamepad2 size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
            {quizCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dokončených kvízů</div>
        </motion.div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(btn.id)}
              className="card"
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === btn.id
                  ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: filter === btn.id
                  ? '2px solid rgba(181, 31, 101, 0.3)'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: filter === btn.id ? 600 : 500,
                color: filter === btn.id ? '#ffffff' : '#64748b',
                transition: 'all 0.3s'
              }}
            >
              <Icon size={16} />
              {btn.label}
            </motion.button>
          );
        })}
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Načítám historii...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <HistoryIcon size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Ještě tu nic není</h3>
          <p style={{ color: '#64748b' }}>
            {filter === 'all'
              ? 'Hned jak začnete cvičit, uvidíte tady všechny svoje úspěchy 🎉'
              : `Ještě jste to nezkusili. Tak s chutí do toho! 🎵`
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                whileHover={{
                  scale: 1.01,
                  y: -2,
                  boxShadow: '0 8px 24px rgba(181, 31, 101, 0.15)'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(221, 51, 121, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(181, 31, 101, 0.2)',
                  flexShrink: 0
                }}>
                  <Icon size={24} color="var(--color-primary)" />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {activity.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#64748b',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {formatDate(activity.date)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {formatTime(activity.date)}
                    </span>
                    {activity.type === 'song' && activity.isPerfect && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--color-primary)',
                        fontWeight: 600
                      }}>
                        <Trophy size={14} />
                        Perfektní!
                      </span>
                    )}
                    {activity.type === 'song' && !activity.isPerfect && (
                      <span style={{ color: '#94a3b8' }}>
                        {activity.mistakes} {activity.mistakes === 1 ? 'chyba' : activity.mistakes < 5 ? 'chyby' : 'chyb'}
                      </span>
                    )}
                    {activity.type === 'quiz' && (
                      <span style={{ color: '#64748b' }}>
                        Skóre: {activity.score}/{activity.totalQuestions}
                      </span>
                    )}
                  </div>
                </div>

                {/* XP Badge */}
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(221, 51, 121, 0.15) 100%)',
                  border: '2px solid rgba(181, 31, 101, 0.2)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--color-primary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  +{activity.xp} XP
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
