import { motion } from 'framer-motion';
import LessonCard from './LessonCard';
import useLessonStore from '../../store/useLessonStore';

function LessonList() {
  const lessons = useLessonStore((state) => state.lessons);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '1.5rem', color: '#1e293b' }}
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
            <LessonCard lesson={lesson} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default LessonList;
