import LessonCard from './LessonCard';
import useLessonStore from '../../store/useLessonStore';

function LessonList() {
  const lessons = useLessonStore((state) => state.lessons);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dostupné lekce</h2>
      <div className="grid grid-cols-2">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}

export default LessonList;
