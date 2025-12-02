import { Clock, TrendingUp, Edit3, GripVertical, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import { getDifficultyColor, DIFFICULTY_OPTIONS } from '../../utils/lessonUtils';
import { ActionButtonGroup, SaveButton, CancelButton } from '../ui/ButtonComponents';
import { ItemCard } from '../ui/CardComponents';
import { FormLabel, FormInput, FormSelect, FormTextarea } from '../ui/FormComponents';

function LessonCard({ lesson, onClick, isAdmin, onEdit, onDelete, onDuplicate, dragAttributes, dragListeners, isEditing, editForm, onEditFormChange, onSaveEdit, onCancelEdit, isCompleted = false }) {

  const handleClick = () => {
    audioEngine.playClick();
    onClick(lesson);
  };

  const dragHandle = isAdmin && dragAttributes && dragListeners && (
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
  );

  const headerActions = isAdmin && (
    <ActionButtonGroup
      onEdit={() => onEdit(lesson)}
      onDuplicate={() => onDuplicate(lesson.id)}
      onDelete={() => onDelete(lesson.id)}
    />
  );

  const footer = (
    <>
      {isCompleted && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="badge badge-xs"
          style={{
            backgroundColor: 'var(--color-secondary-transparent)',
            color: 'var(--color-secondary)',
            padding: '0.2rem 0.4rem'
          }}
          title="Dokončeno"
        >
          <CheckCircle size={14} />
        </motion.span>
      )}
      <span className={`badge ${getDifficultyColor(lesson.difficulty)}`}>
        <TrendingUp size={14} />
        {lesson.difficulty}
      </span>
      <span className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)' }}>
        <Clock size={14} />
        {lesson.duration}
      </span>
    </>
  );

  return (
    <ItemCard
      title={lesson.title}
      description={lesson.description}
      headerActions={headerActions}
      footer={footer}
      dragHandle={dragHandle}
      isExpanded={isEditing}
      onClick={handleClick}
    >
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
            <div style={{ paddingTop: '1.5rem', marginTop: '1rem', borderTop: 'none', boxShadow: '0 -1px 0 rgba(45, 91, 120, 0.1)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={16} color="var(--color-secondary)" />
                Upravit lekci
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <FormLabel text="Název lekce" />
                  <FormInput
                    type="text"
                    value={editForm.title}
                    onChange={(e) => onEditFormChange('title', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <FormLabel text="Obtížnost" />
                  <FormSelect
                    value={editForm.difficulty}
                    onChange={(e) => onEditFormChange('difficulty', e.target.value)}
                    options={DIFFICULTY_OPTIONS}
                  />
                </div>

                <div className="form-group">
                  <FormLabel text="Délka" />
                  <FormInput
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => onEditFormChange('duration', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <FormLabel text="Popis" />
                <FormTextarea
                  value={editForm.description}
                  onChange={(e) => onEditFormChange('description', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <FormLabel text="Tóny (oddělené mezerou)" />
                <FormInput
                  type="text"
                  value={editForm.content.notes.join(' ')}
                  onChange={(e) => onEditFormChange('content.notes', e.target.value.split(/\s+/).map(n => n.trim()).filter(n => n))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <FormLabel text="Instrukce (jedna na řádek)" />
                <FormTextarea
                  value={editForm.content.instructions.join('\n')}
                  onChange={(e) => onEditFormChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <SaveButton onClick={onSaveEdit} label="Uložit změny" />
                <CancelButton onClick={onCancelEdit} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ItemCard>
  );
}

export default LessonCard;
