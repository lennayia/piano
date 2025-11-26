import { useState, useEffect } from 'react';
import { Trophy, Plus, Edit, Trash2, Save, X, Music, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import * as LucideIcons from 'lucide-react';
import useLessonStore from '../../store/useLessonStore';
import useSongStore from '../../store/useSongStore';
import { HelpPanel } from '../ui/TabButtons';
import { HelpButton } from '../ui/ButtonComponents';
import { generateSound } from '../../utils/soundGenerator';

// Dostupné ikony pro výběr
const AVAILABLE_ICONS = [
  'Star', 'Trophy', 'Award', 'Medal', 'Crown', 'Target', 'Zap',
  'Flame', 'Sparkles', 'Heart', 'Gift', 'Cake', 'Piano',
  'Music', 'BookOpen', 'GraduationCap', 'CheckCircle', 'Shield'
];

// Dostupné zvuky pro oslavu
const CELEBRATION_SOUNDS = [
  { value: 'achievement', label: 'Úspěch (achievement)' },
  { value: 'fanfare', label: 'Fanfára (fanfare)' },
  { value: 'success', label: 'Úspěch (success)' },
  { value: 'applause', label: 'Potlesk (applause)' },
  { value: 'cheer', label: 'Povzbuzení (cheer)' }
];

function AchievementManager() {
  const [achievements, setAchievements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_type: 'Trophy',
    icon_color: 'primary',
    celebration_sound: 'achievement',
    requirement_type: 'global',
    requirement_value: 0,
    xp_reward: 0,
    trigger_type: 'global',
    trigger_id: null
  });
  const lessons = useLessonStore((state) => state.lessons);
  const fetchLessons = useLessonStore((state) => state.fetchLessons);
  const songs = useSongStore((state) => state.songs);
  const fetchSongs = useSongStore((state) => state.fetchSongs);

  useEffect(() => {
    fetchAchievements();
    fetchLessons(); // Načíst lekce pro dropdown
    fetchSongs(); // Načíst písničky pro dropdown
  }, [fetchLessons, fetchSongs]);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('piano_achievements')
      .select(`
        *,
        piano_achievement_triggers (
          trigger_type,
          trigger_id
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      console.error('Chyba při načítání odměn:', error);
      return;
    }

    setAchievements(data || []);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      icon_type: 'Trophy',
      icon_color: 'primary',
      celebration_sound: 'achievement',
      requirement_type: 'global',
      requirement_value: 0,
      xp_reward: 0,
      trigger_type: 'global',
      trigger_id: null
    });
  };

  const handleEdit = (achievement) => {
    setEditingId(achievement.id);
    const trigger = achievement.piano_achievement_triggers?.[0];
    setFormData({
      title: achievement.title,
      description: achievement.description,
      icon_type: achievement.icon_type || 'Trophy',
      icon_color: achievement.icon_color || 'primary',
      celebration_sound: achievement.celebration_sound || 'achievement',
      requirement_type: achievement.requirement_type,
      requirement_value: achievement.requirement_value,
      xp_reward: achievement.xp_reward,
      trigger_type: trigger?.trigger_type || 'global',
      trigger_id: trigger?.trigger_id || null
    });
  };

  const handleSave = async () => {
    const achievementData = {
      title: formData.title,
      description: formData.description,
      icon_type: formData.icon_type,
      icon_color: formData.icon_color,
      celebration_sound: formData.celebration_sound,
      icon: getEmojiForIcon(formData.icon_type), // Zachováme emoji pro zpětnou kompatibilitu
      requirement_type: formData.requirement_type,
      requirement_value: formData.requirement_value,
      xp_reward: formData.xp_reward
    };

    let achievementId;

    if (isCreating) {
      // Vytvoření nové odměny
      const { data, error } = await supabase
        .from('piano_achievements')
        .insert([achievementData])
        .select()
        .single();

      if (error) {
        console.error('Chyba při vytváření odměny:', error);
        alert('Nepodařilo se vytvořit odměnu: ' + error.message);
        return;
      }
      achievementId = data.id;
    } else {
      // Aktualizace existující odměny
      const { error } = await supabase
        .from('piano_achievements')
        .update(achievementData)
        .eq('id', editingId);

      if (error) {
        console.error('Chyba při ukládání odměny:', error);
        alert('Nepodařilo se uložit odměnu: ' + error.message);
        return;
      }
      achievementId = editingId;
    }

    // Uložení triggeru
    await supabase
      .from('piano_achievement_triggers')
      .delete()
      .eq('achievement_id', achievementId);

    const { error: triggerError } = await supabase
      .from('piano_achievement_triggers')
      .insert([{
        achievement_id: achievementId,
        trigger_type: formData.trigger_type,
        trigger_id: formData.trigger_type === 'global' ? null : formData.trigger_id
      }]);

    if (triggerError) {
      console.error('Chyba při ukládání triggeru:', triggerError);
    }

    setIsCreating(false);
    setEditingId(null);
    fetchAchievements();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Opravdu chcete smazat odměnu "${title}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('piano_achievements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Chyba při mazání odměny:', error);
      alert('Nepodařilo se smazat odměnu: ' + error.message);
      return;
    }

    fetchAchievements();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  // Pomocná funkce pro získání emoji ikony (zpětná kompatibilita)
  const getEmojiForIcon = (iconType) => {
    const emojiMap = {
      'Piano': '🎹',
      'BookOpen': '📚',
      'GraduationCap': '🎓',
      'Flame': '🔥',
      'Star': '⭐',
      'Target': '💯',
      'Trophy': '🏆',
      'Award': '🏅',
      'Medal': '🥇',
      'Crown': '👑',
      'Gift': '🎁',
      'Cake': '🎂'
    };
    return emojiMap[iconType] || '🏆';
  };

  // Dynamické renderování ikony
  const renderIcon = (iconType, color, size = 24) => {
    const IconComponent = LucideIcons[iconType];
    if (!IconComponent) return <Trophy size={size} color={`var(--color-${color})`} />;
    return <IconComponent size={size} color={`var(--color-${color})`} />;
  };

  const isEditing = isCreating || editingId !== null;

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} color="var(--color-primary)" />
            Správa odměn
          </h2>

          {/* Help Button */}
          <HelpButton onClick={() => setShowHelp(!showHelp)} isActive={showHelp} />
        </div>

        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={16} />
            Přidat odměnu
          </motion.button>
        )}
      </div>

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        title="Nápověda - Správa odměn"
      >
        <p style={{ marginBottom: '1rem' }}>
          Zde můžete vytvářet a upravovat odměny pro studenty. Každá odměna má vlastní ikonu, barvu a zvuk oslavy.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Typy odměn:
          </strong>
          <ul style={{ marginLeft: '1.25rem', marginBottom: '0' }}>
            <li style={{ marginBottom: '0.25rem' }}><strong>Globální</strong> - přidělí se automaticky při splnění podmínky (XP, série, počet lekcí)</li>
            <li style={{ marginBottom: '0.25rem' }}><strong>Za lekci</strong> - přidělí se po dokončení konkrétní lekce</li>
            <li style={{ marginBottom: '0.25rem' }}><strong>Za kvíz</strong> - přidělí se po úspěšném splnění kvízu (např. Poznáte akord?)</li>
            <li><strong>Za materiál</strong> - přidělí se po dokončení konkrétní písničky, šablony nebo slovníčkového pojmu</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Dostupné ikony:
          </strong>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '12px'
          }}>
            {AVAILABLE_ICONS.map(icon => {
              const IconComponent = LucideIcons[icon];
              return IconComponent ? (
                <div
                  key={icon}
                  style={{
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '10px',
                    border: '1px solid rgba(45, 91, 120, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.625rem'
                  }}
                  title={icon}
                >
                  <IconComponent size={20} color="var(--color-secondary)" />
                  <span style={{ color: '#64748b' }}>{icon}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Zvuky oslavy:
          </strong>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            {CELEBRATION_SOUNDS.map(sound => (
              <button
                key={sound.value}
                onClick={() => {
                  // Nejprve zkusíme načíst MP3 soubor
                  const audio = new Audio(`/sounds/${sound.value}.mp3`);
                  audio.volume = 0.5;

                  audio.play().catch(err => {
                    // Pokud MP3 neexistuje, použijeme syntetický zvuk
                    console.log(`MP3 soubor nenalezen, používám syntetický zvuk`);
                    try {
                      generateSound(sound.value);
                    } catch (synthErr) {
                      console.log('Nepodařilo se přehrát zvuk:', synthErr);
                    }
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(45, 91, 120, 0.15)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 91, 120, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(45, 91, 120, 0.15)';
                }}
              >
                <Music size={16} color="var(--color-secondary)" />
                <span style={{ flex: 1, color: '#1e293b', fontSize: '0.75rem' }}>{sound.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▶</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          padding: '0.75rem',
          background: 'rgba(45, 91, 120, 0.08)',
          borderRadius: '12px',
          borderLeft: '3px solid var(--color-secondary)'
        }}>
          <strong style={{ color: 'var(--color-secondary)', fontSize: '0.8125rem' }}>Tip:</strong>
          <span style={{ marginLeft: '0.5rem' }}>
            Použijte růžovou barvu pro důležité milníky a modrou pro běžné úspěchy. Střídejte barvy pro vizuální variety!
          </span>
        </div>
      </HelpPanel>

      {/* Formulář pro vytvoření/editaci */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'rgba(181, 31, 101, 0.05)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.2)'
            }}
          >
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              {isCreating ? 'Nová odměna' : 'Upravit odměnu'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {/* Název */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Název odměny
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="např. První kroky"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Popis */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Popis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="např. Dokončili jste svoji první lekci!"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Ikona */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Ikona
                </label>
                <select
                  value={formData.icon_type}
                  onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Náhled:</span>
                  {renderIcon(formData.icon_type, formData.icon_color, 32)}
                </div>
              </div>

              {/* Barva */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Barva
                </label>
                <select
                  value={formData.icon_color}
                  onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="primary">Růžová (Primary)</option>
                  <option value="secondary">Modrá (Secondary)</option>
                </select>
              </div>

              {/* Zvuk oslavy */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Zvuk oslavy
                </label>
                <select
                  value={formData.celebration_sound}
                  onChange={(e) => setFormData({ ...formData, celebration_sound: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  {CELEBRATION_SOUNDS.map(sound => (
                    <option key={sound.value} value={sound.value}>{sound.label}</option>
                  ))}
                </select>
              </div>

              {/* Typ podmínky */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Typ podmínky
                </label>
                <select
                  value={formData.requirement_type}
                  onChange={(e) => setFormData({ ...formData, requirement_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="lessons_completed">Počet dokončených lekcí</option>
                  <option value="xp">Celkové XP</option>
                  <option value="streak">Série dnů v řadě</option>
                  <option value="global">Globální (vždy)</option>
                </select>
              </div>

              {/* Hodnota podmínky */}
              {formData.requirement_type !== 'global' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Požadovaná hodnota
                  </label>
                  <input
                    type="number"
                    value={formData.requirement_value}
                    onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid #ddd',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* XP odměna */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  XP odměna
                </label>
                <input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Trigger typ */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Přidělit po
                </label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value, trigger_id: null })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="global">Globálně (dle podmínky výše)</option>
                  <option value="lesson">Dokončení konkrétní lekce</option>
                  <option value="quiz">Úspěšném splnění kvízu</option>
                  <option value="material">Prostudování materiálu</option>
                </select>
              </div>

              {/* Trigger ID - lekce */}
              {formData.trigger_type === 'lesson' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Vyberte lekci
                  </label>
                  <select
                    value={formData.trigger_id || ''}
                    onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid #ddd',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">-- Vyberte lekci --</option>
                    {lessons.map(lesson => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Trigger ID - kvíz */}
              {formData.trigger_type === 'quiz' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Kvíz
                  </label>
                  <select
                    value={formData.trigger_id || ''}
                    onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid #ddd',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">-- Vyberte kvíz --</option>
                    <option value="1">Poznáte akord?</option>
                    {/* Další kvízy budou přidány později */}
                  </select>
                </div>
              )}

              {/* Trigger ID - materiál */}
              {formData.trigger_type === 'material' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Materiál
                  </label>
                  <select
                    value={formData.trigger_id || ''}
                    onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid #ddd',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">-- Vyberte materiál --</option>
                    <optgroup label="Písničky">
                      {songs.map(song => (
                        <option key={`song-${song.id}`} value={song.id}>
                          {song.title}
                        </option>
                      ))}
                    </optgroup>
                    {/* Další typy materiálů budou přidány podle potřeby */}
                  </select>
                </div>
              )}
            </div>

            {/* Tlačítka */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <X size={16} />
                Zrušit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Save size={16} />
                Uložit
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seznam odměn */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.2)',
              boxShadow: '0 4px 15px rgba(181, 31, 101, 0.15)',
              position: 'relative'
            }}
          >
            {/* Ikona odměny */}
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: `2px solid var(--color-${achievement.icon_color})`,
              boxShadow: `0 4px 16px rgba(181, 31, 101, 0.25)`
            }}>
              {renderIcon(achievement.icon_type, achievement.icon_color, 32)}
            </div>

            {/* Název a popis */}
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b', textAlign: 'center', fontSize: '1rem' }}>
              {achievement.title}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center', marginBottom: '1rem' }}>
              {achievement.description}
            </p>

            {/* Info */}
            <div style={{
              padding: '0.75rem',
              background: 'rgba(45, 91, 120, 0.05)',
              borderRadius: 'var(--radius)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                <strong>XP:</strong> +{achievement.xp_reward}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                <strong>Zvuk:</strong> {achievement.celebration_sound}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                <strong>Podmínka:</strong> {achievement.requirement_type === 'global' ? 'Globální' : `${achievement.requirement_type}: ${achievement.requirement_value}`}
              </div>
            </div>

            {/* Akce */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEdit(achievement)}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem'
                }}
              >
                <Edit size={14} />
                Upravit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(achievement.id, achievement.title)}
                className="btn btn-danger"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem'
                }}
              >
                <Trash2 size={14} />
                Smazat
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {achievements.length === 0 && !isEditing && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <Trophy size={48} color="#ddd" style={{ margin: '0 auto 1rem' }} />
          <p>Zatím nemáte žádné odměny. Vytvořte první!</p>
        </div>
      )}
    </div>
  );
}

export default AchievementManager;
