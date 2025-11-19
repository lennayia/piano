import { useState } from 'react';
import { motion } from 'framer-motion';
import LessonCard from './LessonCard';
import LessonModal from './LessonModal';
import useLessonStore from '../../store/useLessonStore';

function LessonList() {
  const lessons = useLessonStore((state) => state.lessons);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '1.5rem', color: '#ffffff' }}
      >
        Dostupné lekce
      </motion.h2>
      <motion.div
        className="grid grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <LessonCard lesson={lesson} onClick={handleLessonClick} />
          </motion.div>
        ))}
      </motion.div>

      <LessonModal
        lesson={selectedLesson}
        isOpen={!!selectedLesson}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default LessonList;
