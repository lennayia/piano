import { useState, useEffect } from 'react';
import { Shield, BarChart3, Users, Trophy, Gamepad2, Zap, Eye, Settings, Music, BookOpen } from 'lucide-react';
import TabButtons from '../components/ui/TabButtons';
import AdminDashboard from '../components/admin/Dashboard';
import UserList from '../components/admin/UserList';
import AchievementManager from '../components/admin/AchievementManager';
import AchievementManagerBackup from '../components/admin/AchievementManager-backup';
import QuizManager from '../components/admin/QuizManager';
import GamificationManager from '../components/admin/GamificationManager';
import GamificationManagerBackup from '../components/admin/GamificationManager-backup';
import PageSection from '../components/ui/PageSection';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';
import useUserStore from '../store/useUserStore';

function Admin() {
  // 3-úrovňová navigace
  const [activeMainTab, setActiveMainTab] = useState('quizzes');
  const [activeSubTab, setActiveSubTab] = useState('listening');
  const [activeThirdTab, setActiveThirdTab] = useState('chords');

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

  // Third level tabs pro každý sub tab (úroveň 3)
  const thirdLevelTabs = {
    'quizzes-listening': [
      { id: 'chords', label: 'Akordy', icon: Music }
    ],
    'quizzes-theory': [
      { id: 'chords', label: 'Akordy', icon: Music },
      { id: 'theory', label: 'Teorie', icon: BookOpen },
      { id: 'intervals', label: 'Intervaly', icon: Music },
      { id: 'scales', label: 'Stupnice', icon: Music },
      { id: 'rhythm', label: 'Rytmus', icon: Music },
      { id: 'mix', label: 'Mix', icon: Trophy }
    ],
    'gamification-management': [
      { id: 'xp-rules', label: 'XP body', icon: Zap },
      { id: 'bonuses', label: 'Bonusy', icon: Trophy },
      { id: 'achievements', label: 'Odměny', icon: Trophy },
      { id: 'achievements-backup', label: 'Odměny - Záloha', icon: Eye },
      { id: 'levels', label: 'Levely', icon: BarChart3 }
    ],
    'gamification-overview': [
      { id: 'xp-rules', label: 'XP body', icon: Zap },
      { id: 'bonuses', label: 'Bonusy', icon: Trophy },
      { id: 'achievements', label: 'Odměny', icon: Trophy },
      { id: 'achievements-backup', label: 'Odměny - Záloha', icon: Eye },
      { id: 'levels', label: 'Levely', icon: BarChart3 }
    ],
    'overview-statistics': [
      { id: 'general', label: 'Obecné', icon: BarChart3 },
      { id: 'gamification', label: 'Gamifikace', icon: Zap },
      { id: 'gamification-backup', label: 'Gamifikace - Záloha', icon: Eye },
      { id: 'leaderboard', label: 'Žebříček', icon: Trophy }
    ],
    'overview-users': [
      { id: 'overview', label: 'Přehled', icon: Users },
      { id: 'history', label: 'Historie', icon: BookOpen },
      { id: 'statistics', label: 'Statistiky', icon: BarChart3 }
    ]
  };

  // Při změně hlavního tabu nastav první sub-tab
  useEffect(() => {
    if (subTabs[activeMainTab]?.[0]?.id) {
      setActiveSubTab(subTabs[activeMainTab][0].id);
    }
  }, [activeMainTab]);

  // Při změně sub-tabu nastav první third-level tab
  useEffect(() => {
    const thirdTabsKey = `${activeMainTab}-${activeSubTab}`;
    if (thirdLevelTabs[thirdTabsKey]?.[0]?.id) {
      setActiveThirdTab(thirdLevelTabs[thirdTabsKey][0].id);
    }
  }, [activeMainTab, activeSubTab]);

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

  // Dynamický obsah podle aktivních tabů (3 úrovně)
  const getSectionContent = () => {
    // Klíč pro přístup ke content definici
    const contentKey = `${activeMainTab}-${activeSubTab}-${activeThirdTab}`;

    const content = {
      // KVÍZY
      'quizzes-listening-chords': {
        title: 'Poslech - Akordy',
        description: 'Správa akordů pro poslechové kvízy.'
      },
      'quizzes-theory-chords': {
        title: 'Teorie - Akordy',
        description: 'Správa akordových otázek pro teoretické kvízy.'
      },
      'quizzes-theory-theory': {
        title: 'Teorie - Obecná teorie',
        description: 'Správa obecných teoretických otázek.'
      },
      'quizzes-theory-intervals': {
        title: 'Teorie - Intervaly',
        description: 'Správa otázek o intervalech.'
      },
      'quizzes-theory-scales': {
        title: 'Teorie - Stupnice',
        description: 'Správa otázek o stupnicích.'
      },
      'quizzes-theory-rhythm': {
        title: 'Teorie - Rytmus',
        description: 'Správa otázek o rytmu.'
      },
      'quizzes-theory-mix': {
        title: 'Teorie - Mix',
        description: 'Správa smíšených teoretických otázek.'
      },

      // GAMIFIKACE - SPRÁVA
      'gamification-management-xp-rules': {
        title: 'Správa XP pravidel',
        description: 'Nastavte body za opakované akce - dokončení lekce, kvízu, písně atd.'
      },
      'gamification-management-bonuses': {
        title: 'Správa bonusů',
        description: 'Nastavte bonusy za výkon - perfektní zahrání, rychlost, kontinuitu atd.'
      },
      'gamification-management-achievements': {
        title: 'Správa odměn',
        description: 'Vytvářejte a upravujte jednorázové odměny za dosažené milníky.'
      },
      'gamification-management-achievements-backup': {
        title: 'Správa odměn - Záloha',
        description: 'Původní verze před refactoringem - pro porovnání.'
      },
      'gamification-management-levels': {
        title: 'Správa levelů',
        description: 'Nastavte prahy XP a názvy pro jednotlivé levely.'
      },

      // GAMIFIKACE - PŘEHLED
      'gamification-overview-xp-rules': {
        title: 'Přehled XP pravidel',
        description: 'Celkový přehled nastavených XP pravidel.'
      },
      'gamification-overview-bonuses': {
        title: 'Přehled bonusů',
        description: 'Celkový přehled nastavených bonusů.'
      },
      'gamification-overview-achievements': {
        title: 'Přehled odměn',
        description: 'Celkový přehled všech odměn v aplikaci.'
      },
      'gamification-overview-achievements-backup': {
        title: 'Přehled odměn - Záloha',
        description: 'Původní verze před refactoringem - pro porovnání.'
      },
      'gamification-overview-levels': {
        title: 'Přehled levelů',
        description: 'Celkový přehled nastavených levelů.'
      },

      // PŘEHLEDY - STATISTIKY
      'overview-statistics-general': {
        title: 'Obecné statistiky',
        description: 'Přehled celkové aktivity a statistik aplikace.'
      },
      'overview-statistics-gamification': {
        title: 'Statistiky gamifikace',
        description: 'Statistiky XP, levelů a odměn.'
      },
      'overview-statistics-gamification-backup': {
        title: 'Statistiky gamifikace - Záloha',
        description: 'Původní verze před refactoringem - pro porovnání.'
      },
      'overview-statistics-leaderboard': {
        title: 'Žebříček',
        description: 'TOP 50 uživatelů podle celkového XP.'
      },

      // PŘEHLEDY - UŽIVATELÉ
      'overview-users-overview': {
        title: 'Přehled uživatelů',
        description: 'Seznam všech registrovaných uživatelů a jejich statistiky.'
      },
      'overview-users-history': {
        title: 'Historie aktivit',
        description: 'Kompletní historie všech aktivit uživatelů.'
      },
      'overview-users-statistics': {
        title: 'Statistiky uživatelů',
        description: 'Detailní statistiky jednotlivých uživatelů.'
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
        {/* 3. úroveň navigace (TabButtons pro third level) */}
        {thirdLevelTabs[`${activeMainTab}-${activeSubTab}`] && (
          <div style={{ marginBottom: '2rem' }}>
            <TabButtons
              tabs={thirdLevelTabs[`${activeMainTab}-${activeSubTab}`]}
              activeTab={activeThirdTab}
              onTabChange={setActiveThirdTab}
              options={{ layout: 'pill', size: 'sm' }}
            />
          </div>
        )}

        {/* ==================== KVÍZY ==================== */}

        {/* KVÍZY - POSLECH - Akordy */}
        {activeMainTab === 'quizzes' && activeSubTab === 'listening' && activeThirdTab === 'chords' && (
          <QuizManager />
        )}

        {/* KVÍZY - TEORIE - všechny sub-taby */}
        {activeMainTab === 'quizzes' && activeSubTab === 'theory' && (
          <>
            {activeThirdTab === 'chords' && <QuizManager />}
            {activeThirdTab === 'theory' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>📚 Teorie - Obecná teorie</h3>
                <p>Komponenta pro správu obecných teoretických otázek</p>
              </div>
            )}
            {activeThirdTab === 'intervals' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>🎵 Teorie - Intervaly</h3>
                <p>Komponenta pro správu otázek o intervalech</p>
              </div>
            )}
            {activeThirdTab === 'scales' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>🎹 Teorie - Stupnice</h3>
                <p>Komponenta pro správu otázek o stupnicích</p>
              </div>
            )}
            {activeThirdTab === 'rhythm' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>🥁 Teorie - Rytmus</h3>
                <p>Komponenta pro správu otázek o rytmu</p>
              </div>
            )}
            {activeThirdTab === 'mix' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>🎲 Teorie - Mix</h3>
                <p>Komponenta pro správu smíšených teoretických otázek</p>
              </div>
            )}
          </>
        )}

        {/* ==================== GAMIFIKACE ==================== */}

        {/* GAMIFIKACE - SPRÁVA */}
        {activeMainTab === 'gamification' && activeSubTab === 'management' && (
          <>
            {activeThirdTab === 'xp-rules' && <GamificationManager />}
            {activeThirdTab === 'bonuses' && (
              <div style={{ padding: '1rem', background: 'rgba(181, 31, 101, 0.1)', borderRadius: '8px' }}>
                <h3>⚡ Bonusy - CRUD operace</h3>
                <p>Tady bude NOVÁ komponenta pro správu bonusů za výkon</p>
                <p>S možností přidat, upravit, duplikovat, smazat</p>
              </div>
            )}
            {activeThirdTab === 'achievements' && <AchievementManager />}
            {activeThirdTab === 'achievements-backup' && <AchievementManagerBackup />}
            {activeThirdTab === 'levels' && (
              <div style={{ padding: '1rem', background: 'rgba(181, 31, 101, 0.1)', borderRadius: '8px' }}>
                <h3>📊 Levely - CRUD operace</h3>
                <p>Tady bude komponenta pro správu levelů</p>
                <p>S možností přidat, upravit, duplikovat, smazat</p>
              </div>
            )}
          </>
        )}

        {/* GAMIFIKACE - PŘEHLED */}
        {activeMainTab === 'gamification' && activeSubTab === 'overview' && (
          <>
            {activeThirdTab === 'xp-rules' && <GamificationManager />}
            {activeThirdTab === 'bonuses' && (
              <div style={{ padding: '1rem', background: 'rgba(181, 31, 101, 0.1)', borderRadius: '8px' }}>
                <h3>⚡ Přehled bonusů</h3>
                <p>Přehled všech nastavených bonusů</p>
              </div>
            )}
            {activeThirdTab === 'achievements' && <AchievementManager />}
            {activeThirdTab === 'achievements-backup' && <AchievementManagerBackup />}
            {activeThirdTab === 'levels' && <GamificationManager />}
          </>
        )}

        {/* ==================== PŘEHLEDY ==================== */}

        {/* PŘEHLEDY - STATISTIKY */}
        {activeMainTab === 'overview' && activeSubTab === 'statistics' && (
          <>
            {activeThirdTab === 'general' && <AdminDashboard />}
            {activeThirdTab === 'gamification' && <GamificationManager />}
            {activeThirdTab === 'gamification-backup' && <GamificationManagerBackup />}
            {activeThirdTab === 'leaderboard' && <GamificationManager />}
          </>
        )}

        {/* PŘEHLEDY - UŽIVATELÉ */}
        {activeMainTab === 'overview' && activeSubTab === 'users' && (
          <>
            {activeThirdTab === 'overview' && <UserList />}
            {activeThirdTab === 'history' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>📜 Historie aktivit</h3>
                <p>Komponenta pro zobrazení kompletní historie všech aktivit</p>
              </div>
            )}
            {activeThirdTab === 'statistics' && (
              <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
                <h3>📊 Statistiky uživatelů</h3>
                <p>Komponenta pro detailní statistiky jednotlivých uživatelů</p>
              </div>
            )}
          </>
        )}
      </PageSection>
    </>
  );
}

export default Admin;
