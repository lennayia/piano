import { Clock, TrendingUp, Edit3, GripVertical, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import { getDifficultyColor } from '../../utils/lessonUtils';
import { ActionButtonGroup } from '../ui/ButtonComponents';
import { ItemCard } from '../ui/CardComponents';
import LessonForm from './LessonForm';
import SectionHeader from '../ui/SectionHeader';

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

  // Completion status - zobrazí se vlevo dole (statusChips)
  const statusChips = isCompleted ? (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="badge badge-xs"
      style={{
        backgroundColor: 'var(--color-success-transparent)',
        color: 'var(--color-success)',
        padding: '0.2rem 0.4rem'
      }}
      title="Dokončeno"
    >
      <CheckCircle size={14} />
    </motion.span>
  ) : null;

  // Footer - obtížnost a délka (zobrazí se nahoře)
  const footer = (
    <>
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
      statusChips={statusChips}
      dragHandle={dragHandle}
      layout="list"
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
              <SectionHeader icon={Edit3} title="Upravit lekci" variant="h4" iconSize={16} iconColor="var(--color-secondary)" />

              <LessonForm
                formData={editForm}
                onChange={onEditFormChange}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
                saveLabel="Uložit změny"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ItemCard>
  );
}

export default LessonCard;
