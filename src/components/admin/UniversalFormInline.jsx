import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { FormInput, FormLabel, FormTextarea, FormSelect, CheckboxLabel } from '../ui/FormComponents';
import { SaveButton, CancelButton } from '../ui/ButtonComponents';

// Dostupné ikony
const AVAILABLE_ICONS = [
  'Star', 'Trophy', 'Award', 'Medal', 'Crown', 'Target', 'Zap',
  'Flame', 'Sparkles', 'Heart', 'Gift', 'Cake', 'Piano',
  'Music', 'BookOpen', 'GraduationCap', 'CheckCircle', 'Shield'
];

// Zvuky pro oslavu
const CELEBRATION_SOUNDS = [
  { value: 'achievement', label: 'Úspěch (achievement)' },
  { value: 'fanfare', label: 'Fanfára (fanfare)' },
  { value: 'success', label: 'Úspěch (success)' },
  { value: 'applause', label: 'Potlesk (applause)' },
  { value: 'cheer', label: 'Povzbuzení (cheer)' }
];

/**
 * Univerzální inline formulář - PŘESNĚ podle AchievementManager
 * @param {string} type - 'achievement' | 'xp_rule' | 'quiz_bonus' | 'level'
 * @param {object} formData - Data formuláře
 * @param {function} onChange - Callback pro změny
 * @param {function} onSave - Callback pro uložení
 * @param {function} onCancel - Callback pro zrušení
 * @param {boolean} isCreating - True pokud vytváříme nový
 * @param {boolean} loading - Loading state
 * @param {array} lessons - Seznam lekcí (pro achievements)
 * @param {array} songs - Seznam písní (pro achievements)
 */
function UniversalFormInline({
  type = 'achievement',
  formData,
  onChange,
  onSave,
  onCancel,
  isCreating = false,
  loading = false,
  lessons = [],
  songs = []
}) {
  // Renderování ikony pro náhled
  const renderIcon = (iconType, color, size = 32) => {
    const IconComponent = LucideIcons[iconType] || LucideIcons.Trophy;
    return <IconComponent size={size} color={`var(--color-${color || 'primary'})`} />;
  };

  // Titulek podle typu
  const getTitle = () => {
    if (isCreating) {
      switch (type) {
        case 'achievement': return 'Nová odměna';
        case 'xp_rule': return 'Nové XP pravidlo';
        case 'quiz_bonus': return 'Nový kvízový bonus';
        case 'level': return 'Nový level';
        default: return 'Nová položka';
      }
    } else {
      switch (type) {
        case 'achievement': return 'Upravit odměnu';
        case 'xp_rule': return 'Upravit XP pravidlo';
        case 'quiz_bonus': return 'Upravit kvízový bonus';
        case 'level': return 'Upravit level';
        default: return 'Upravit';
      }
    }
  };

  return (
    <motion.div
      key={isCreating ? 'create' : `edit-${formData.id}`}
      className="achievement-form-detail"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        gridColumn: '1 / -1',
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
        {getTitle()}
      </h4>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '1rem'
      }}>
        {/* XP RULE - Action Type (ID) */}
        {(type === 'xp_rule' || type === 'quiz_bonus') && (
          <div>
            <FormLabel text="Action Type (ID)" />
            <FormInput
              type="text"
              value={formData.action_type}
              onChange={(e) => onChange({ ...formData, action_type: e.target.value })}
              placeholder="lesson_completion"
              disabled={!isCreating}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              {isCreating ? 'Unikátní identifikátor (nelze změnit po vytvoření)' : 'Nelze změnit po vytvoření'}
            </p>
          </div>
        )}

        {/* Název - pro achievement: "Název odměny", pro xp_rule: "Název (zobrazený)" */}
        <div>
          <FormLabel text={type === 'achievement' ? 'Název odměny' : 'Název (zobrazený)'} />
          <FormInput
            type="text"
            value={type === 'achievement' ? formData.title : formData.label}
            onChange={(e) => onChange({
              ...formData,
              [type === 'achievement' ? 'title' : 'label']: e.target.value
            })}
            placeholder={type === 'achievement' ? 'např. První kroky' : 'Dokončení lekce'}
          />
        </div>

        {/* Popis */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FormLabel text="Popis" />
          <FormTextarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder={type === 'achievement' ? 'např. Dokončili jste svoji první lekci!' : 'Popis pravidla...'}
            rows={2}
          />
        </div>

        {/* Ikona */}
        <div>
          <FormLabel text="Ikona" />
          <FormSelect
            value={formData.icon_type}
            onChange={(e) => onChange({ ...formData, icon_type: e.target.value })}
            options={AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))}
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Náhled:</span>
            {renderIcon(formData.icon_type, formData.icon_color, 32)}
          </div>
        </div>

        {/* Barva */}
        <div>
          <FormLabel text="Barva" />
          <FormSelect
            value={formData.icon_color}
            onChange={(e) => onChange({ ...formData, icon_color: e.target.value })}
            options={[
              { value: 'primary', label: 'Růžová (Primary)' },
              { value: 'secondary', label: 'Modrá (Secondary)' }
            ]}
          />
        </div>

        {/* POUZE PRO ACHIEVEMENTS - Zvuk oslavy */}
        {type === 'achievement' && (
          <div>
            <FormLabel text="Zvuk oslavy" />
            <FormSelect
              value={formData.celebration_sound}
              onChange={(e) => onChange({ ...formData, celebration_sound: e.target.value })}
              options={CELEBRATION_SOUNDS}
            />
          </div>
        )}

        {/* POUZE PRO ACHIEVEMENTS - Typ konfet */}
        {type === 'achievement' && (
          <div>
            <FormLabel text="Typ konfet" />
            <FormSelect
              value={formData.confetti_type}
              onChange={(e) => onChange({ ...formData, confetti_type: e.target.value })}
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
        )}

        {/* POUZE PRO ACHIEVEMENTS - Typ podmínky */}
        {type === 'achievement' && (
          <div>
            <FormLabel text="Typ podmínky" />
            <FormSelect
              value={formData.requirement_type}
              onChange={(e) => onChange({ ...formData, requirement_type: e.target.value })}
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
        )}

        {/* POUZE PRO ACHIEVEMENTS - Požadovaná hodnota (pokud není global) */}
        {type === 'achievement' && formData.requirement_type !== 'global' && (
          <div>
            <FormLabel text="Požadovaná hodnota" />
            <FormInput
              type="number"
              value={formData.requirement_value}
              onChange={(e) => onChange({ ...formData, requirement_value: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        )}

        {/* XP hodnota - pro achievement: "XP odměna", pro xp_rule: "XP hodnota" */}
        <div>
          <FormLabel text={type === 'achievement' ? 'XP odměna' : 'XP hodnota'} />
          <FormInput
            type="number"
            value={type === 'achievement' ? formData.xp_reward : formData.xp_value}
            onChange={(e) => onChange({
              ...formData,
              [type === 'achievement' ? 'xp_reward' : 'xp_value']: parseInt(e.target.value) || 0
            })}
            min="0"
          />
        </div>

        {/* POUZE PRO XP RULE - Pořadí zobrazení */}
        {(type === 'xp_rule' || type === 'quiz_bonus') && (
          <div>
            <FormLabel text="Pořadí zobrazení" />
            <FormInput
              type="number"
              value={formData.display_order}
              onChange={(e) => onChange({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        )}

        {/* POUZE PRO ACHIEVEMENTS - Přidělit po */}
        {type === 'achievement' && (
          <div>
            <FormLabel text="Přidělit po" />
            <FormSelect
              value={formData.trigger_type}
              onChange={(e) => onChange({ ...formData, trigger_type: e.target.value, trigger_id: null })}
              options={[
                { value: 'global', label: 'Globálně (dle podmínky výše)' },
                { value: 'lesson', label: 'Dokončení konkrétní lekce' },
                { value: 'quiz', label: 'Úspěšném splnění kvízu' },
                { value: 'material', label: 'Prostudování materiálu' }
              ]}
            />
          </div>
        )}

        {/* POUZE PRO ACHIEVEMENTS - Vybrat lekci */}
        {type === 'achievement' && formData.trigger_type === 'lesson' && (
          <div>
            <FormLabel text="Vyberte lekci" />
            <FormSelect
              value={formData.trigger_id || ''}
              onChange={(e) => onChange({ ...formData, trigger_id: parseInt(e.target.value) || null })}
              options={[
                { value: '', label: '-- Vyberte lekci --' },
                ...lessons.map(lesson => ({ value: lesson.id, label: lesson.title }))
              ]}
            />
          </div>
        )}

        {/* POUZE PRO ACHIEVEMENTS - Vybrat kvíz */}
        {type === 'achievement' && formData.trigger_type === 'quiz' && (
          <div>
            <FormLabel text="Kvíz" />
            <FormSelect
              value={formData.trigger_id || ''}
              onChange={(e) => onChange({ ...formData, trigger_id: parseInt(e.target.value) || null })}
              options={[
                { value: '', label: '-- Vyberte kvíz --' },
                { value: '1', label: 'Poznáte akord?' }
              ]}
            />
          </div>
        )}

        {/* POUZE PRO ACHIEVEMENTS - Vybrat materiál */}
        {type === 'achievement' && formData.trigger_type === 'material' && (
          <div>
            <FormLabel text="Materiál" />
            <FormSelect
              value={formData.trigger_id || ''}
              onChange={(e) => onChange({ ...formData, trigger_id: parseInt(e.target.value) || null })}
              options={[
                { value: '', label: '-- Vyberte materiál --' },
                ...songs.map(song => ({ value: song.id, label: `${song.title} (písnička)` }))
              ]}
            />
          </div>
        )}
      </div>

      {/* Aktivní/Neaktivní + Období - POUZE PRO ACHIEVEMENTS */}
      {type === 'achievement' && (
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
                onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
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
                onChange={(e) => onChange({ ...formData, valid_from: e.target.value })}
                style={{ minWidth: 0 }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <FormLabel text="Platná do (volitelné)" />
              <FormInput
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => onChange({ ...formData, valid_until: e.target.value })}
                style={{ minWidth: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Aktivní checkbox - POUZE PRO XP_RULE/QUIZ_BONUS/LEVEL */}
      {type !== 'achievement' && (
        <div style={{ marginTop: '1rem' }}>
          <CheckboxLabel
            checked={formData.is_active}
            onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
            label="Aktivní"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </div>
      )}

      {/* Tlačítka */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <CancelButton onClick={onCancel} />
        <SaveButton onClick={onSave} disabled={loading} />
      </div>
    </motion.div>
  );
}

export default UniversalFormInline;
