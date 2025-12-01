import React, { useState, useEffect } from 'react';
import { Trophy, Edit, Trash2, Save, X, Music, HelpCircle, Sparkles } from 'lucide-react';
// Achievement Manager - inline editing support
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import * as LucideIcons from 'lucide-react';
import useLessonStore from '../../store/useLessonStore';
import useSongStore from '../../store/useSongStore';
import { HelpPanel } from '../ui/TabButtons';
import { HelpButton, CancelButton, SaveButton, AddButton } from '../ui/ButtonComponents';
import { FormInput, FormLabel, FormTextarea, FormSelect, CheckboxLabel } from '../ui/FormComponents';
import { generateSound } from '../../utils/soundGenerator';
import { CONFETTI_TYPES } from '../common/Confetti';
import { CONFETTI_TYPE_LABELS } from '../../utils/achievementConstants';
import AchievementCard from './AchievementCard';
import '../../styles/admin.css';

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
    confetti_type: 'metallic',
    requirement_type: 'global',
    requirement_value: 0,
    xp_reward: 0,
    trigger_type: 'global',
    trigger_id: null,
    is_active: true,
    valid_from: null,
    valid_until: null
  });
  const lessons = useLessonStore((state) => state.lessons);
  const fetchLessons = useLessonStore((state) => state.fetchLessons);
  const songs = useSongStore((state) => state.songs);
  const fetchSongs = useSongStore((state) => state.fetchSongs);

  useEffect(() => {
    fetchAchievements();
    fetchLessons();
    fetchSongs();
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
      .order('title', { ascending: true });

    if (error) {
      console.error('Chyba při načítání odměn:', error);
      return;
    }

    setAchievements(data || []);
  };

  const mapAchievementToFormData = (achievement, options = {}) => {
    const trigger = achievement?.piano_achievement_triggers?.[0];
    return {
      title: options.isDuplicate ? `${achievement.title} (kopie)` : (achievement?.title || ''),
      description: achievement?.description || '',
      icon_type: achievement?.icon_type || 'Trophy',
      icon_color: achievement?.icon_color || 'primary',
      celebration_sound: achievement?.celebration_sound || 'achievement',
      confetti_type: achievement?.confetti_type || 'metallic',
      requirement_type: achievement?.requirement_type || 'global',
      requirement_value: achievement?.requirement_value || 0,
      xp_reward: achievement?.xp_reward || 0,
      trigger_type: trigger?.trigger_type || 'global',
      trigger_id: trigger?.trigger_id || null,
      is_active: options.isDuplicate ? true : (achievement?.is_active !== false),
      valid_from: options.isDuplicate ? null : (achievement?.valid_from ? achievement.valid_from.split('T')[0] : null),
      valid_until: options.isDuplicate ? null : (achievement?.valid_until ? achievement.valid_until.split('T')[0] : null)
    };
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData(mapAchievementToFormData(null));
  };

  const handleEdit = (achievement) => {
    setEditingId(achievement.id);
    setFormData(mapAchievementToFormData(achievement));
  };

  const handleDuplicate = (achievement) => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(mapAchievementToFormData(achievement, { isDuplicate: true }));
  };

  const handleSave = async () => {
    const achievementData = {
      title: formData.title,
      description: formData.description,
      icon_type: formData.icon_type,
      icon_color: formData.icon_color,
      celebration_sound: formData.celebration_sound,
      confetti_type: formData.confetti_type,
      icon: getEmojiForIcon(formData.icon_type), // Zachováme emoji pro zpětnou kompatibilitu
      requirement_type: formData.requirement_type,
      requirement_value: formData.requirement_value,
      xp_reward: formData.xp_reward,
      is_active: formData.is_active,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null
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
          <HelpButton onClick={() => setShowHelp(!showHelp)} isActive={showHelp} />
        </div>

        {!isEditing && (
          <AddButton onClick={handleCreate} />
        )}
      </div>

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        title="Nápověda - Správa odměn"
        className="achievement-help-panel"
      >
        <p style={{ marginBottom: '0.75rem' }}>
          Zde můžete vytvářet a upravovat odměny pro studenty. Každá odměna má vlastní ikonu, barvu a zvuk oslavy.
        </p>

        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Typy odměn:
          </strong>
          <ul style={{ marginLeft: '0.75rem', marginBottom: '0' }}>
            <li style={{ marginBottom: '0.25rem' }}><strong>Globální</strong> - přidělí se automaticky při splnění podmínky (XP, série, počet lekcí)</li>
            <li style={{ marginBottom: '0.25rem' }}><strong>Za lekci</strong> - přidělí se po dokončení konkrétní lekce</li>
            <li style={{ marginBottom: '0.25rem' }}><strong>Za kvíz</strong> - přidělí se po úspěšném splnění kvízu (např. Poznáte akord?)</li>
            <li><strong>Za materiál</strong> - přidělí se po dokončení konkrétní písničky, šablony nebo slovníčkového pojmu</li>
          </ul>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Dostupné ikony:
          </strong>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            padding: '0.5rem 0.35rem',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 'var(--radius-md)'
          }}>
            {AVAILABLE_ICONS.map(icon => {
              const IconComponent = LucideIcons[icon];
              return IconComponent ? (
                <div
                  key={icon}
                  style={{
                    padding: '0.35rem 0.25rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.625rem'
                  }}
                  title={icon}
                >
                  <IconComponent size={20} color="var(--color-secondary)" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{icon}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Zvuky oslavy:
          </strong>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.35rem'
          }}>
            {CELEBRATION_SOUNDS.map(sound => (
              <button
                key={sound.value}
                onClick={() => {
                  // Nejprve zkusíme načíst MP3 soubor
                  const audio = new Audio(`/sounds/${sound.value}.mp3`);
                  audio.volume = 0.5;

                  audio.play().catch(err => {
                    try {
                      generateSound(sound.value);
                    } catch (synthErr) {
                      // Tiše ignorujeme chybu
                    }
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.5rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 91, 120, 0.1)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
                }}
              >
                <Music size={16} color="var(--color-secondary)" />
                <span style={{ flex: 1, color: 'var(--color-text)', fontSize: '0.75rem' }}>{sound.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▶</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Typy konfet:
          </strong>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.35rem'
          }}>
            {Object.entries(CONFETTI_TYPES).map(([type, config]) => (
              <div
                key={type}
                style={{
                  padding: '0.5rem 0.25rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--color-text)',
                  textTransform: 'capitalize'
                }}>
                  {CONFETTI_TYPE_LABELS[type]} ({type})
                </div>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  {config.colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={color}
                    />
                  ))}
                  <span style={{
                    marginLeft: '0.25rem',
                    fontSize: '0.625rem',
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>
                    {config.count} ks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '0.5rem 0.4rem',
          background: 'rgba(45, 91, 120, 0.08)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--color-secondary)'
        }}>
          <strong style={{ color: 'var(--color-secondary)', fontSize: '0.8125rem' }}>Tip:</strong>
          <span style={{ marginLeft: '0.5rem' }}>
            Použijte růžovou barvu pro důležité milníky a modrou pro běžné úspěchy. Střídejte barvy pro vizuální variety!
          </span>
        </div>
      </HelpPanel>

      {/* Formulář pro vytvoření NOVÉ odměny (zobrazí se nahoře) */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            className="achievement-form-detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(181, 31, 101, 0.05)',
              borderRadius: 'calc(var(--radius) * 2)',
              border: 'none',
              boxShadow: 'var(--glass-shadow)',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            <h4 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
              Nová odměna
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '1rem'
            }}>
              <div>
                <FormLabel text="Název odměny" />
                <FormInput
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="např. První kroky"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <FormLabel text="Popis" />
                <FormTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="např. Dokončili jste svoji první lekci!"
                  rows={2}
                />
              </div>

              <div>
                <FormLabel text="Ikona" />
                <FormSelect
                  value={formData.icon_type}
                  onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                  options={AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Náhled:</span>
                  {renderIcon(formData.icon_type, formData.icon_color, 32)}
                </div>
              </div>

              <div>
                <FormLabel text="Barva" />
                <FormSelect
                  value={formData.icon_color}
                  onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                  options={[
                    { value: 'primary', label: 'Růžová (Primary)' },
                    { value: 'secondary', label: 'Modrá (Secondary)' }
                  ]}
                />
              </div>

              <div>
                <FormLabel text="Zvuk oslavy" />
                <FormSelect
                  value={formData.celebration_sound}
                  onChange={(e) => setFormData({ ...formData, celebration_sound: e.target.value })}
                  options={CELEBRATION_SOUNDS}
                />
              </div>

              <div>
                <FormLabel text="Typ konfet" />
                <FormSelect
                  value={formData.confetti_type}
                  onChange={(e) => setFormData({ ...formData, confetti_type: e.target.value })}
                  options={[
                    { value: 'golden', label: 'Zlaté (Golden)' },
                    { value: 'rainbow', label: 'Duhové (Rainbow)' },
                    { value: 'pink', label: 'Růžové (Pink)' },
                    { value: 'blue', label: 'Modré (Blue)' },
                    { value: 'metallic', label: 'Kovové (Metallic)' },
                    { value: 'stars', label: 'Hvězdy (Stars)' },
                    { value: 'minimal', label: 'Minimální (Minimal)' }
                  ]}
                />
              </div>

              <div>
                <FormLabel text="Typ podmínky" />
                <FormSelect
                  value={formData.requirement_type}
                  onChange={(e) => setFormData({ ...formData, requirement_type: e.target.value })}
                  options={[
                    { value: 'lessons_completed', label: 'Počet dokončených lekcí' },
                    { value: 'xp', label: 'Celkové XP' },
                    { value: 'streak', label: 'Série dnů v řadě' },
                    { value: 'daily_goals_completed', label: 'Počet splněných denních cílů' },
                    { value: 'daily_goal_streak', label: 'Denní cíl - série dnů' },
                    { value: 'global', label: 'Globální (vždy)' }
                  ]}
                />
              </div>

              {formData.requirement_type !== 'global' && (
                <div>
                  <FormLabel text="Požadovaná hodnota" />
                  <FormInput
                    type="number"
                    value={formData.requirement_value}
                    onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              )}

              <div>
                <FormLabel text="XP odměna" />
                <FormInput
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div>
                <FormLabel text="Přidělit po" />
                <FormSelect
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value, trigger_id: null })}
                  options={[
                    { value: 'global', label: 'Globálně (dle podmínky výše)' },
                    { value: 'lesson', label: 'Dokončení konkrétní lekce' },
                    { value: 'quiz', label: 'Úspěšném splnění kvízu' },
                    { value: 'material', label: 'Prostudování materiálu' }
                  ]}
                />
              </div>

              {formData.trigger_type === 'lesson' && (
                <div>
                  <FormLabel text="Vyberte lekci" />
                  <FormSelect
                    value={formData.trigger_id || ''}
                    onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                    options={[
                      { value: '', label: '-- Vyberte lekci --' },
                      ...lessons.map(lesson => ({ value: lesson.id, label: lesson.title }))
                    ]}
                  />
                </div>
              )}

              {formData.trigger_type === 'quiz' && (
                <div>
                  <FormLabel text="Kvíz" />
                  <FormSelect
                    value={formData.trigger_id || ''}
                    onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                    options={[
                      { value: '', label: '-- Vyberte kvíz --' },
                      { value: '1', label: 'Poznáte akord?' }
                    ]}
                  />
                </div>
              )}

              {formData.trigger_type === 'material' && (
                <div>
                  <FormLabel text="Materiál" />
                  <FormSelect
                    value={formData.trigger_id || ''}
                    onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                    options={[
                      { value: '', label: '-- Vyberte materiál --' },
                      ...songs.map(song => ({ value: song.id, label: `${song.title} (písnička)` }))
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Aktivní/Neaktivní + Období */}
            <div className="achievement-period-section" style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(45, 91, 120, 0.05)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div>
                  <CheckboxLabel
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    label="Odměna je aktivní"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <FormLabel text="Platná od (volitelné)" />
                  <FormInput
                    type="date"
                    value={formData.valid_from || ''}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    style={{ minWidth: 0 }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <FormLabel text="Platná do (volitelné)" />
                  <FormInput
                    type="date"
                    value={formData.valid_until || ''}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    style={{ minWidth: 0 }}
                  />
                </div>
              </div>
            </div>

            {/* Tlačítka */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <CancelButton onClick={handleCancel} />
              <SaveButton onClick={handleSave} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seznam odměn */}
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <React.Fragment key={achievement.id}>
            <AchievementCard
              achievement={achievement}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />

            {/* Editační formulář přímo pod kartou */}
            {editingId === achievement.id && (
              <motion.div
                key={`edit-${achievement.id}`}
                className="achievement-form-detail"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  gridColumn: '1 / -1',  // Roztáhne přes celou šířku gridu
                  padding: '1.5rem',
                  background: 'rgba(181, 31, 101, 0.05)',
                  borderRadius: '24px',
                  boxShadow: 'var(--glass-shadow)',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  marginBottom: '1rem'
                }}
              >
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
                  Upravit odměnu
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <FormLabel text="Název odměny" />
                    <FormInput
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="např. První kroky"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormLabel text="Popis" />
                    <FormTextarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="např. Dokončili jste svoji první lekci!"
                      rows={2}
                    />
                  </div>

                  <div>
                    <FormLabel text="Ikona" />
                    <FormSelect
                      value={formData.icon_type}
                      onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                      options={AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))}
                    />
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Náhled:</span>
                      {renderIcon(formData.icon_type, formData.icon_color, 32)}
                    </div>
                  </div>

                  <div>
                    <FormLabel text="Barva" />
                    <FormSelect
                      value={formData.icon_color}
                      onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                      options={[
                        { value: 'primary', label: 'Růžová (Primary)' },
                        { value: 'secondary', label: 'Modrá (Secondary)' }
                      ]}
                    />
                  </div>

                  <div>
                    <FormLabel text="Zvuk oslavy" />
                    <FormSelect
                      value={formData.celebration_sound}
                      onChange={(e) => setFormData({ ...formData, celebration_sound: e.target.value })}
                      options={CELEBRATION_SOUNDS}
                    />
                  </div>

                  <div>
                    <FormLabel text="Typ konfet" />
                    <FormSelect
                      value={formData.confetti_type}
                      onChange={(e) => setFormData({ ...formData, confetti_type: e.target.value })}
                      options={[
                        { value: 'golden', label: 'Zlaté (Golden)' },
                        { value: 'rainbow', label: 'Duhové (Rainbow)' },
                        { value: 'pink', label: 'Růžové (Pink)' },
                        { value: 'blue', label: 'Modré (Blue)' },
                        { value: 'metallic', label: 'Kovové (Metallic)' },
                        { value: 'stars', label: 'Hvězdy (Stars)' },
                        { value: 'minimal', label: 'Minimální (Minimal)' }
                      ]}
                    />
                  </div>

                  <div>
                    <FormLabel text="Typ podmínky" />
                    <FormSelect
                      value={formData.requirement_type}
                      onChange={(e) => setFormData({ ...formData, requirement_type: e.target.value })}
                      options={[
                        { value: 'lessons_completed', label: 'Počet dokončených lekcí' },
                        { value: 'xp', label: 'Celkové XP' },
                        { value: 'streak', label: 'Série dnů v řadě' },
                        { value: 'daily_goals_completed', label: 'Počet splněných denních cílů' },
                        { value: 'daily_goal_streak', label: 'Denní cíl - série dnů' },
                        { value: 'global', label: 'Globální (vždy)' }
                      ]}
                    />
                  </div>

                  {formData.requirement_type !== 'global' && (
                    <div>
                      <FormLabel text="Požadovaná hodnota" />
                      <FormInput
                        type="number"
                        value={formData.requirement_value}
                        onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  )}

                  <div>
                    <FormLabel text="XP odměna" />
                    <FormInput
                      type="number"
                      value={formData.xp_reward}
                      onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>

                  <div>
                    <FormLabel text="Přidělit po" />
                    <FormSelect
                      value={formData.trigger_type}
                      onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value, trigger_id: null })}
                      options={[
                        { value: 'global', label: 'Globálně (dle podmínky výše)' },
                        { value: 'lesson', label: 'Dokončení konkrétní lekce' },
                        { value: 'quiz', label: 'Úspěšném splnění kvízu' },
                        { value: 'material', label: 'Prostudování materiálu' }
                      ]}
                    />
                  </div>

                  {formData.trigger_type === 'lesson' && (
                    <div>
                      <FormLabel text="Vyberte lekci" />
                      <FormSelect
                        value={formData.trigger_id || ''}
                        onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                        options={[
                          { value: '', label: '-- Vyberte lekci --' },
                          ...lessons.map(lesson => ({ value: lesson.id, label: lesson.title }))
                        ]}
                      />
                    </div>
                  )}

                  {formData.trigger_type === 'quiz' && (
                    <div>
                      <FormLabel text="Kvíz" />
                      <FormSelect
                        value={formData.trigger_id || ''}
                        onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                        options={[
                          { value: '', label: '-- Vyberte kvíz --' },
                          { value: '1', label: 'Poznáte akord?' }
                        ]}
                      />
                    </div>
                  )}

                  {formData.trigger_type === 'material' && (
                    <div>
                      <FormLabel text="Materiál" />
                      <FormSelect
                        value={formData.trigger_id || ''}
                        onChange={(e) => setFormData({ ...formData, trigger_id: parseInt(e.target.value) || null })}
                        options={[
                          { value: '', label: '-- Vyberte materiál --' },
                          ...songs.map(song => ({ value: song.id, label: `${song.title} (písnička)` }))
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Aktivní/Neaktivní + Období */}
                <div className="achievement-period-section" style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(45, 91, 120, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    <div>
                      <CheckboxLabel
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        label="Odměna je aktivní"
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <FormLabel text="Platná od (volitelné)" />
                      <FormInput
                        type="date"
                        value={formData.valid_from || ''}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        style={{ minWidth: 0 }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <FormLabel text="Platná do (volitelné)" />
                      <FormInput
                        type="date"
                        value={formData.valid_until || ''}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        style={{ minWidth: 0 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tlačítka */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <CancelButton onClick={handleCancel} />
                  <SaveButton onClick={handleSave} />
                </div>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {achievements.length === 0 && !isEditing && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          <Trophy size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
          <p>Zatím nemáte žádné odměny. Vytvořte první!</p>
        </div>
      )}
    </div>
  );
}

export default AchievementManager;
