import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, List, Clock, CheckCircle } from 'lucide-react';
import LessonList from '../components/lessons/LessonList';
import useUserStore from '../store/useUserStore';
import { PageSection } from '../components/ui/TabButtons';

function Lekce() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const [mainTab, setMainTab] = useState('all');
  const [difficultyTab, setDifficultyTab] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // Dočasné hodnoty pro progress (později z databáze)
  const totalLessons = 12;
  const completedLessons = 5;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  // Dynamický obsah podle aktivních tabů
  const getSectionContent = () => {
    const mainTabContent = {
      all: {
        title: 'Všechny lekce',
        description: 'Procházejte kompletní nabídku lekcí a vyberte si, co vás zajímá.'
      },
      in_progress: {
        title: 'Probíhající lekce',
        description: 'Pokračujte v lekcích, které jste již začali a ještě jste nedokončili.'
      },
      completed: {
        title: 'Dokončené lekce',
        description: 'Přehled všech lekcí, které jste úspěšně dokončili.'
      }
    };

    const difficultyContent = {
      all: '',
      beginner: ' Pro začátečníky.',
      intermediate: ' Pro pokročilé.',
      expert: ' Pro experty.'
    };

    const main = mainTabContent[mainTab] || mainTabContent.all;
    const difficulty = difficultyTab !== 'all' ? difficultyContent[difficultyTab] : '';

    return {
      title: main.title,
      description: main.description + difficulty
    };
  };

  const sectionContent = getSectionContent();

  return (
    <PageSection
      maxWidth="lg"
      icon={BookOpen}
      title="Lekce"
      description="Procházejte své lekce a pokračujte v učení"

      mainTabs={[
        { id: 'all', label: 'Všechny', icon: List },
        { id: 'in_progress', label: 'Probíhající', icon: Clock },
        { id: 'completed', label: 'Dokončené', icon: CheckCircle }
      ]}

      subTabs={{
        'all': [
          { id: 'all', label: 'Vše' },
          { id: 'beginner', label: 'Začátečník' },
          { id: 'intermediate', label: 'Pokročilý' },
          { id: 'expert', label: 'Expert' }
        ],
        'in_progress': [
          { id: 'all', label: 'Vše' },
          { id: 'beginner', label: 'Začátečník' },
          { id: 'intermediate', label: 'Pokročilý' },
          { id: 'expert', label: 'Expert' }
        ],
        'completed': [
          { id: 'all', label: 'Vše' },
          { id: 'beginner', label: 'Začátečník' },
          { id: 'intermediate', label: 'Pokročilý' },
          { id: 'expert', label: 'Expert' }
        ]
      }}

      activeMainTab={mainTab}
      activeSubTab={difficultyTab}
      onMainTabChange={setMainTab}
      onSubTabChange={setDifficultyTab}

      sectionTitle={sectionContent.title}
      sectionDescription={sectionContent.description}
      progressLabel="Váš pokrok"
      progress={progressPercentage}
    >
      <LessonList filter={mainTab} difficulty={difficultyTab} />
    </PageSection>
  );
}

export default Lekce;
