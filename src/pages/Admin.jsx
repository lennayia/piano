import { useState, useEffect } from 'react';
import { Shield, BarChart3, Users, Trophy, Gamepad2, Zap, Eye, Settings } from 'lucide-react';
import AdminDashboard from '../components/admin/Dashboard';
import UserList from '../components/admin/UserList';
import AchievementManager from '../components/admin/AchievementManager';
import QuizManager from '../components/admin/QuizManager';
import GamificationManager from '../components/admin/GamificationManager';
import GamificationManagerBackup from '../components/admin/GamificationManager-backup';
import PageSection from '../components/ui/PageSection';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';
import useUserStore from '../store/useUserStore';

function Admin() {
  // Hlavní navigace
  const [activeMainTab, setActiveMainTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('stats');

  const currentUser = useUserStore((state) => state.currentUser);
  const getAllUsers = useUserStore((state) => state.getAllUsers);

  // Kontrola, zda je uživatel admin
  const isAdmin = currentUser?.is_admin === true;

  // Sub tabs pro každý main tab
  const subTabs = {
    overview: [
      { id: 'stats', label: 'Statistiky', icon: BarChart3 },
      { id: 'users', label: 'Uživatelé', icon: Users },
      { id: 'gamification', label: 'Gamifikace', icon: Zap },
      { id: 'gamification-backup', label: 'Gamifikace - Záloha', icon: Eye }
    ],
    management: [
      { id: 'quizzes', label: 'Kvízy', icon: Gamepad2 },
      { id: 'xp-rules', label: 'XP body', icon: Zap },
      { id: 'achievements', label: 'Odměny', icon: Trophy }
    ]
  };

  // Při změně hlavního tabu nastav první pod-tab
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

  // Main tabs
  const mainTabs = [
    { id: 'overview', label: 'Přehled', icon: Eye },
    { id: 'management', label: 'Správa', icon: Settings }
  ];

  // Dynamický obsah podle aktivních tabů
  const getSectionContent = () => {
    const mainTabContent = {
      overview: {
        stats: {
          title: 'Statistiky aplikace',
          description: 'Přehled celkové aktivity uživatelů, získaných XP a pokroku v lekcích.'
        },
        users: {
          title: 'Přehled uživatelů',
          description: 'Seznam všech registrovaných uživatelů a jejich statistiky.'
        },
        gamification: {
          title: 'Přehled gamifikace',
          description: 'Celkový přehled XP pravidel a odměn v aplikaci.'
        },
        'gamification-backup': {
          title: 'Přehled gamifikace - Záloha',
          description: 'Původní verze před refactoringem - pro porovnání.'
        }
      },
      management: {
        quizzes: {
          title: 'Správa kvízů',
          description: 'Přidávejte, upravujte a organizujte otázky pro teoretické kvízy.'
        },
        'xp-rules': {
          title: 'Správa XP pravidel',
          description: 'Nastavte body za opakované akce - dokončení lekce, správná odpověď v kvízu atd.'
        },
        achievements: {
          title: 'Správa odměn',
          description: 'Vytvářejte a upravujte jednorázové odměny za dosažené milníky.'
        }
      }
    };

    return mainTabContent[activeMainTab]?.[activeSubTab] || { title: '', description: '' };
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
        {/* PŘEHLED - Statistiky */}
        {activeMainTab === 'overview' && activeSubTab === 'stats' && (
          <AdminDashboard />
        )}

        {/* PŘEHLED - Uživatelé */}
        {activeMainTab === 'overview' && activeSubTab === 'users' && (
          <UserList />
        )}

        {/* PŘEHLED - Gamifikace */}
        {activeMainTab === 'overview' && activeSubTab === 'gamification' && (
          <GamificationManager />
        )}

        {/* PŘEHLED - Gamifikace - Záloha */}
        {activeMainTab === 'overview' && activeSubTab === 'gamification-backup' && (
          <GamificationManagerBackup />
        )}

        {/* SPRÁVA - Kvízy */}
        {activeMainTab === 'management' && activeSubTab === 'quizzes' && (
          <QuizManager />
        )}

        {/* SPRÁVA - XP body */}
        {activeMainTab === 'management' && activeSubTab === 'xp-rules' && (
          <div style={{ padding: '1rem', background: 'rgba(181, 31, 101, 0.1)', borderRadius: '8px' }}>
            <h3>⚡ XP body - CRUD operace</h3>
            <p>Tady bude NOVÁ komponenta pro správu XP pravidel</p>
            <p>S možností přidat, upravit, duplikovat, smazat</p>
          </div>
        )}

        {/* SPRÁVA - Odměny */}
        {activeMainTab === 'management' && activeSubTab === 'achievements' && (
          <AchievementManager />
        )}
      </PageSection>
    </>
  );
}

export default Admin;
