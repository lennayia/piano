import { Clock, GripVertical, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import audioEngine from '../../utils/audio';
import { getDifficultyColor } from '../../utils/lessonUtils';
import { ActionButtonGroup } from '../ui/ButtonComponents';
import { ItemCard } from '../ui/CardComponents';
import { RADIUS } from '../../utils/styleConstants';

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
      style={{
        color: 'var(--color-success)',
        display: 'flex',
        alignItems: 'flex-end'
      }}
      title="Dokončeno"
    >
      <CheckCircle size={14} />
    </motion.span>
  ) : null;

  // Footer - obtížnost a délka (zobrazí se nahoře)
  const footer = (
    <>
      <span className={`badge ${getDifficultyColor(lesson.difficulty)}`} style={{ borderRadius: RADIUS.md }}>
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
    />
  );
}

export default LessonCard;
