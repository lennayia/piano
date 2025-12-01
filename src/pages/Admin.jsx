import { useState, useEffect } from 'react';
import { Shield, BarChart3, Users, Gamepad2, Zap, Eye, Settings, Music, BookOpen, Trophy, Award, TrendingUp } from 'lucide-react';
import PageSection from '../components/ui/PageSection';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';
import useUserStore from '../store/useUserStore';

// Komponenty
import QuizManager from '../components/admin/QuizManager';

// Wrapper komponenty pro 3. úroveň navigace (Gamifikace a Přehledy)
import GamificationManagement from '../components/admin/gamification/GamificationManagement';
import GamificationOverview from '../components/admin/gamification/GamificationOverview';
import StatisticsOverview from '../components/admin/overview/StatisticsOverview';
import UsersOverview from '../components/admin/overview/UsersOverview';

function Admin() {
  // 2-úrovňová navigace (3. úroveň je ve wrapper komponentách)
  const [activeMainTab, setActiveMainTab] = useState('quizzes');
  const [activeSubTab, setActiveSubTab] = useState('listening');

  const currentUser = useUserStore((state) => state.currentUser);
  const getAllUsers = useUserStore((state) => state.getAllUsers);

  // Kontrola, zda je uživatel admin
  const isAdmin = currentUser?.is_admin === true;

  // Sub tabs pro každý main tab (úroveň 2)
  const subTabs = {
    quizzes: [
      { id: 'listening', label: 'Poslech', icon: Music },
      { id: 'theory', label: 'Teorie', icon: BookOpen }
    ],
    gamification: [
      { id: 'management', label: 'Správa', icon: Settings },
      { id: 'overview', label: 'Přehled', icon: Eye }
    ],
    overview: [
      { id: 'statistics', label: 'Statistiky', icon: BarChart3 },
      { id: 'users', label: 'Uživatelé', icon: Users }
    ]
  };

  // Při změně hlavního tabu nastav první sub-tab
  useEffect(() => {
    if (subTabs[activeMainTab]?.[0]?.id) {
      setActiveSubTab(subTabs[activeMainTab][0].id);
    }
  }, [activeMainTab]);

  // Načíst všechny uživatele při otevření Admin stránky
  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    }
  }, [isAdmin, getAllUsers]);

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Shield size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Přístup odepřen</h2>
          <p style={{ color: '#64748b' }}>
            Pro přístup k admin panelu musíte mít administrátorská oprávnění.
          </p>
        </div>
      </div>
    );
  }

  // Main tabs (úroveň 1)
  const mainTabs = [
    { id: 'quizzes', label: 'Kvízy', icon: Gamepad2 },
    { id: 'gamification', label: 'Gamifikace', icon: Zap },
    { id: 'overview', label: 'Přehledy', icon: BarChart3 }
  ];

  // Dynamický obsah podle aktivních tabů (2 úrovně)
  const getSectionContent = () => {
    const contentKey = `${activeMainTab}-${activeSubTab}`;

    const content = {
      // KVÍZY
      'quizzes-listening': {
        title: 'Správa kvízů - Poslech',
        description: 'Správa akordů pro poslechové kvízy.'
      },
      'quizzes-theory': {
        title: 'Správa kvízů - Teorie',
        description: 'Správa teoretických otázek pro kvízy.'
      },

      // GAMIFIKACE
      'gamification-management': {
        title: 'Správa gamifikace',
        description: 'Nastavte XP pravidla, bonusy, odměny a levely.'
      },
      'gamification-overview': {
        title: 'Přehled gamifikace',
        description: 'Celkový přehled XP pravidel, bonusů, odměn a levelů.'
      },

      // PŘEHLEDY
      'overview-statistics': {
        title: 'Statistiky',
        description: 'Obecné statistiky, gamifikace a žebříček.'
      },
      'overview-users': {
        title: 'Uživatelé',
        description: 'Přehled uživatelů, historie aktivit a statistiky.'
      }
    };

    return content[contentKey] || { title: '', description: '' };
  };

  const sectionContent = getSectionContent();

  return (
    <>
      {/* Plovoucí nápověda - modulární komponenta */}
      <FloatingHelpButton title="Nápověda - Admin panel">
        <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
          <h4 style={{ color: '#1e293b', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Vítejte v admin panelu
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            Zde můžete spravovat veškerý obsah aplikace PianoPro.
          </p>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Přehled</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Statistiky aplikace - počet uživatelů, aktivita, XP.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Uživatelé</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Seznam všech registrovaných uživatelů a jejich statistiky.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Odměny</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Správa achievementů a odměn pro uživatele.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Kvízy</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Správa akordů pro kvíz "Poznáte akord?". Přidávejte nové akordy, upravujte možnosti odpovědí.
            </p>
          </div>

          <h4 style={{ color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Tipy
          </h4>

          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Drag & Drop:</strong> Přetahujte položky za ikonu ⋮⋮⋮ pro změnu pořadí
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Duplikace:</strong> Tlačítko kopírování vytvoří kopii položky
            </li>
            <li>
              <strong>Toto okno:</strong> Můžete ho přetáhnout kamkoliv nebo minimalizovat
            </li>
          </ul>
        </div>
      </FloatingHelpButton>

      <PageSection
        icon={Shield}
        title="Admin panel"
        description="Správa uživatelů, statistik a obsahu aplikace"
        mainTabs={mainTabs}
        subTabs={subTabs}
        activeMainTab={activeMainTab}
        activeSubTab={activeSubTab}
        onMainTabChange={setActiveMainTab}
        onSubTabChange={setActiveSubTab}
        mainTabsSize="md"
        sectionTitle={sectionContent.title}
        sectionDescription={sectionContent.description}
      >
        {/* KVÍZY - QuizManager (bez 3. úrovně) */}
        {activeMainTab === 'quizzes' && activeSubTab === 'listening' && <QuizManager />}
        {activeMainTab === 'quizzes' && activeSubTab === 'theory' && <QuizManager />}

        {/* GAMIFIKACE - wrapper komponenty s vlastními TabButtons (stejně jako u Přehledů) */}
        {activeMainTab === 'gamification' && activeSubTab === 'management' && <GamificationManagement />}
        {activeMainTab === 'gamification' && activeSubTab === 'overview' && <GamificationOverview />}

        {/* PŘEHLEDY (bez 3. úrovně) */}
        {activeMainTab === 'overview' && activeSubTab === 'statistics' && <StatisticsOverview />}
        {activeMainTab === 'overview' && activeSubTab === 'users' && <UsersOverview />}
      </PageSection>
    </>
  );
}

export default Admin;
