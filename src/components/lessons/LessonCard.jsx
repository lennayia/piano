import { Clock, TrendingUp, ChevronRight, ChevronDown, Edit3, Trash2, GripVertical, Copy, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';

function LessonCard({ lesson, onClick, isAdmin, onEdit, onDelete, onDuplicate, dragAttributes, dragListeners, isEditing, editForm, onEditFormChange, onSaveEdit, onCancelEdit }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý začátečník':
        return 'badge-warning';
      case 'pokročilý':
        return 'badge-primary';
      default:
        return '';
    }
  };

  const handleClick = () => {
    audioEngine.playClick();
    onClick(lesson);
  };

  return (
    <motion.div
      className="card"
      style={{
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 12px 48px rgba(45, 91, 120, 0.25)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {/* Drag Handle (pouze pro adminy) */}
          {isAdmin && dragAttributes && dragListeners && (
            <div
              {...dragAttributes}
              {...dragListeners}
              onClick={(e) => e.stopPropagation()}
              style={{
                cursor: 'grab',
                padding: '0.25rem',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                transition: 'opacity 0.2s',
                marginRight: '0.5rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              <GripVertical size={16} />
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{lesson.title}</h3>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDuplicate(lesson.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(181, 31, 101, 0.1)',
                      border: '1px solid rgba(181, 31, 101, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Duplikovat lekci"
                  >
                    <Copy size={14} color="var(--color-primary)" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(lesson)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(45, 91, 120, 0.1)',
                      border: '1px solid rgba(45, 91, 120, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit3 size={14} color="var(--color-secondary)" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(lesson.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={14} color="var(--color-danger)" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isEditing ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={20} color="var(--color-text-secondary)" />
          </motion.div>
        </div>
        <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
          {lesson.description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <span className={`badge ${getDifficultyColor(lesson.difficulty)}`}>
          <TrendingUp size={14} />
          {lesson.difficulty}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <Clock size={14} />
          {lesson.duration}
        </span>
      </div>

      {/* Edit Form Accordion */}
      <AnimatePresence>
        {isEditing && editForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ paddingTop: '1.5rem', marginTop: '1rem', borderTop: '2px solid rgba(45, 91, 120, 0.2)' }}>
              <h4 style={{ marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                <Edit3 size={16} color="var(--color-secondary)" />
                Upravit lekci
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                    Název lekce
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.title}
                    onChange={(e) => onEditFormChange('title', e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                    Obtížnost
                  </label>
                  <select
                    className="form-input"
                    value={editForm.difficulty}
                    onChange={(e) => onEditFormChange('difficulty', e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value="začátečník">začátečník</option>
                    <option value="mírně pokročilý začátečník">mírně pokročilý začátečník</option>
                    <option value="pokročilý">pokročilý</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                    Délka
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.duration}
                    onChange={(e) => onEditFormChange('duration', e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Popis
                </label>
                <textarea
                  className="form-input"
                  value={editForm.description}
                  onChange={(e) => onEditFormChange('description', e.target.value)}
                  rows={2}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Tóny (oddělené čárkou)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.content.notes.join(', ')}
                  onChange={(e) => onEditFormChange('content.notes', e.target.value.split(',').map(n => n.trim()).filter(n => n))}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Instrukce (jedna na řádek)
                </label>
                <textarea
                  className="form-input"
                  value={editForm.content.instructions.join('\n')}
                  onChange={(e) => onEditFormChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
                  rows={3}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSaveEdit}
                  className="btn btn-primary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  <Save size={16} />
                  Uložit změny
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancelEdit}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  <X size={16} />
                  Zrušit
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LessonCard;
