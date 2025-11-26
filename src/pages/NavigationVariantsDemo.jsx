import { useState } from 'react';
import { Shield, BarChart3, Users, Zap, Eye, Settings, Gamepad2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import TabButtons from '../components/ui/TabButtons';

/**
 * DEMO STRÁNKA pro porovnání variant navigace
 * Po výběru preferované varianty tuto stránku smažeme
 */
function NavigationVariantsDemo() {
  const [activeMainTab, setActiveMainTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('stats');

  const mainTabs = [
    { id: 'overview', label: 'Přehled', icon: Eye },
    { id: 'management', label: 'Správa', icon: Settings }
  ];

  const subTabs = {
    overview: [
      { id: 'stats', label: 'Statistiky', icon: BarChart3 },
      { id: 'users', label: 'Uživatelé', icon: Users },
      { id: 'gamification', label: 'Gamifikace', icon: Zap }
    ],
    management: [
      { id: 'quizzes', label: 'Kvízy', icon: Gamepad2 },
      { id: 'xp-rules', label: 'XP body', icon: Zap },
      { id: 'achievements', label: 'Odměny', icon: Trophy }
    ]
  };

  const currentSubTabs = subTabs[activeMainTab] || [];

  return (
    <div style={{ padding: '2rem', background: '#f8fafc' }}>
      <h1 style={{ marginBottom: '3rem', textAlign: 'center' }}>
        Porovnání variant navigace
      </h1>

      {/* VARIANTA 1: AKTUÁLNÍ (default) */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 1: AKTUÁLNÍ (bez změn)
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Současný stav - dvě úrovně menu pod sebou
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            options={{ size: 'md', style: { marginBottom: '1rem' } }}
          />

          <TabButtons
            tabs={currentSubTabs}
            activeTab={activeSubTab}
            onTabChange={setActiveSubTab}
            options={{ layout: 'pill' }}
          />
        </div>
      </div>

      {/* VARIANTA 2: S POPISKY */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 2: S POPISKY
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Přidané textové labely nad každou úrovní menu
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          {/* Label pro hlavní menu */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Hlavní sekce
          </div>

          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            options={{ size: 'md', style: { marginBottom: '1.5rem' } }}
          />

          {/* Label pro pod-menu */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Pod-sekce
          </div>

          <TabButtons
            tabs={currentSubTabs}
            activeTab={activeSubTab}
            onTabChange={setActiveSubTab}
            options={{ layout: 'pill' }}
          />
        </div>
      </div>

      {/* VARIANTA 3: V KARTĚ */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 3: V KARTĚ
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Menu v oddělené kartě s jemným pozadím
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          {/* Menu v kartě */}
          <div style={{
            background: 'rgba(181, 31, 101, 0.04)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(181, 31, 101, 0.1)'
          }}>
            <TabButtons
              tabs={mainTabs}
              activeTab={activeMainTab}
              onTabChange={setActiveMainTab}
              options={{ size: 'md', style: { marginBottom: '1rem' } }}
            />

            <TabButtons
              tabs={currentSubTabs}
              activeTab={activeSubTab}
              onTabChange={setActiveSubTab}
              options={{ layout: 'pill' }}
            />
          </div>
        </div>
      </div>

      {/* VARIANTA 4: BAREVNÉ ROZLIŠENÍ */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 4: BAREVNÉ ROZLIŠENÍ
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Pod-menu má jinou barvu (secondary modrá)
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            options={{ size: 'md', style: { marginBottom: '1rem' } }}
          />

          {/* Pod-menu se secondary barvou */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {currentSubTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === activeSubTab;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    background: isActive ? 'var(--color-secondary)' : 'rgba(45, 91, 120, 0.1)',
                    color: isActive ? 'white' : 'var(--color-secondary)',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                >
                  {Icon && <Icon size={14} />}
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VARIANTA 5: ODSAZENÍ A ŠIPKA SE SECONDARY POZADÍM */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 5: ODSAZENÍ A ŠIPKA + SVĚTLÉ SECONDARY POZADÍ
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Pod-menu je odsazené s vizuální šipkou, celý switcher má světlé secondary pozadí
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          {/* Hlavní menu bez pozadí */}
          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            options={{ size: 'md', style: { marginBottom: '0.75rem' } }}
          />

          {/* Pod-menu s odsazením a šipkou */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '2rem',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(45, 91, 120, 0.4)',
              fontSize: '1.25rem'
            }}>
              └→
            </div>
            {/* Custom pill s light secondary pozadím */}
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              padding: '0.3rem',
              background: 'rgba(45, 91, 120, 0.08)', // Světlá secondary místo bílé
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '14px',
              border: '1px solid rgba(45, 91, 120, 0.15)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              {currentSubTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = tab.id === activeSubTab;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubTab(tab.id)}
                    style={{
                      padding: '0.4rem 1rem',
                      background: isActive ? 'rgba(45, 91, 120, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#64748b',
                      boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {Icon && <Icon size={14} />}
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* VARIANTA 7: KOPIE VARIANTY 5 PRO ÚPRAVY */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 7: VARIANTA 5 - UPRAVENÁ VERZE
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Kopie varianty 5 pro experimenty s úpravami
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          {/* Hlavní menu bez pozadí */}
          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            options={{ size: 'md', style: { marginBottom: '0.75rem' } }}
          />

          {/* Pod-menu s odsazením a šipkou */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '2rem',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(45, 91, 120, 0.4)',
              fontSize: '1.25rem'
            }}>
              └→
            </div>
            {/* Custom pill s bílým pozadím a modulárním stínem */}
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              padding: '0.3rem',
              background: 'rgba(255, 255, 255, 0.9)', // Bílá
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '14px',
              border: '0px', // Bez borderu
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' // Modulární stín
            }}>
              {currentSubTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = tab.id === activeSubTab;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubTab(tab.id)}
                    style={{
                      padding: '0.4rem 1rem',
                      background: isActive ? 'rgba(45, 91, 120, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#64748b',
                      boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none' // Neaktivní bez stínu
                    }}
                  >
                    {Icon && <Icon size={14} />}
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* VARIANTA 6: VĚTŠÍ HLAVNÍ TLAČÍTKA */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
          Varianta 6: VĚTŠÍ HLAVNÍ TLAČÍTKA
        </h2>
        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
          Výrazně větší hlavní menu, menší pod-menu
        </p>

        <div className="container">
          <h1 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            color: 'var(--color-primary)'
          }}>
            <Shield size={32} color="var(--color-primary)" />
            Admin panel
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>

          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            options={{ size: 'lg', style: { marginBottom: '1rem' } }}
          />

          <TabButtons
            tabs={currentSubTabs}
            activeTab={activeSubTab}
            onTabChange={setActiveSubTab}
            options={{ layout: 'pill', size: 'sm' }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        <p>Po výběru varianty tuto demo stránku smažeme 🗑️</p>
      </div>
    </div>
  );
}

export default NavigationVariantsDemo;
