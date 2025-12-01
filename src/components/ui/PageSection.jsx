import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import TabButtons from './TabButtons';
import { FormInput, FormLabel } from './FormComponents';
import { RADIUS } from '../../utils/styleConstants';

/**
 * PageSection - Komplexní layout komponenta pro stránky s menu/submenu strukturou
 *
 * @param {object} props
 * @param {string} props.maxWidth - Maximální šířka: 'sm' | 'md' | 'lg' | 'xl' | 'full' nebo custom (např. '1200px')
 * @param {React.Component} props.icon - Ikona pro hlavičku (z lucide-react)
 * @param {string} props.title - H1 nadpis stránky
 * @param {string} props.description - Popis pod nadpisem
 * @param {array} props.mainTabs - Pole hlavních tabs [{id, label, icon}]
 * @param {object} props.subTabs - Object s submenu pro každý hlavní tab: {mainTabId: [{id, label, icon}]}
 * @param {object} props.thirdLevelTabs - Object s 3. úrovní tabů: {'mainTab-subTab': [{id, label, icon}]}
 * @param {string} props.activeMainTab - ID aktivního hlavního tabu
 * @param {string} props.activeSubTab - ID aktivního sub tabu
 * @param {string} props.activeThirdLevelTab - ID aktivního 3. úrovně tabu
 * @param {function} props.onMainTabChange - Callback při změně hlavního tabu
 * @param {function} props.onSubTabChange - Callback při změně sub tabu
 * @param {function} props.onThirdLevelTabChange - Callback při změně 3. úrovně tabu
 * @param {string} props.mainTabsSize - Velikost main tabs: 'sm' | 'md' | 'lg' (default: 'lg')
 * @param {string} props.sectionTitle - H2 nadpis content sekce
 * @param {string} props.sectionDescription - Popisný text pod section title
 * @param {React.Component} props.sectionAction - Action button vedle section title
 * @param {boolean} props.showDailyGoal - Zobrazit UI pro denní cíl
 * @param {number} props.dailyGoal - Denní cíl (kolik položek chce uživatel dnes dokončit)
 * @param {function} props.onSetDailyGoal - Callback při změně denního cíle
 * @param {number} props.completedToday - Počet dokončených položek dnes
 * @param {string} props.goalLabel - Label pro denní cíl (např. "lekcí", "písniček")
 * @param {string} props.progressLabel - Label pro progress bar (např. "Váš pokrok")
 * @param {number} props.progress - Progress bar value (0-100)
 * @param {React.Component} props.children - Obsah stránky
 */
export function PageSection({
  maxWidth = 'lg',
  icon: Icon,
  title,
  description,
  mainTabs,
  subTabs = {},
  thirdLevelTabs = {},
  activeMainTab,
  activeSubTab,
  activeThirdLevelTab,
  onMainTabChange,
  onSubTabChange,
  onThirdLevelTabChange,
  mainTabsSize = 'md',
  sectionTitle,
  sectionDescription,
  sectionAction,
  showDailyGoal = false,
  dailyGoal = 0,
  onSetDailyGoal,
  completedToday = 0,
  goalLabel = 'položek',
  progressLabel,
  progress,
  children
}) {
  // Zjistit, jestli aktivní hlavní tab má submenu
  const currentSubTabs = subTabs[activeMainTab] || [];
  const hasSubMenu = currentSubTabs.length > 0;

  // Zjistit, jestli aktivní kombinace main+sub má třetí úroveň
  const thirdLevelKey = `${activeMainTab}-${activeSubTab}`;
  const currentThirdLevelTabs = thirdLevelTabs[thirdLevelKey] || [];
  const hasThirdLevel = currentThirdLevelTabs.length > 0;

  // Divider komponent
  const Divider = () => (
    <div style={{
      width: '100%',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent)',
      margin: '1.5rem 0'
    }} />
  );

  return (
    <div className="container">
      {/* Header sekce */}
      {(Icon || title || description) && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '1rem' }}
          >
            {title && (
              <h1 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: description ? '0.5rem' : '0'
              }}>
                {Icon && <Icon size={32} color="var(--color-text-secondary)" />}
                {title}
              </h1>
            )}
            {description && (
              <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                {description}
              </p>
            )}
          </motion.div>
        </>
      )}

      {/* Menu sekce */}
      {mainTabs && mainTabs.length > 0 && (
        <>
          <TabButtons
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={onMainTabChange}
            options={{ size: mainTabsSize, style: { marginBottom: hasSubMenu ? '1rem' : 0 } }}
          />

          {/* Submenu pills (2. úroveň) */}
          {hasSubMenu && (
            <TabButtons
              tabs={currentSubTabs}
              activeTab={activeSubTab}
              onTabChange={onSubTabChange}
              options={{ layout: 'pill', size: 'sm', style: { marginBottom: hasThirdLevel ? '0.75rem' : 0 } }}
            />
          )}

          {/* Third level pills (3. úroveň) */}
          {hasThirdLevel && (
            <TabButtons
              tabs={currentThirdLevelTabs}
              activeTab={activeThirdLevelTab}
              onTabChange={onThirdLevelTabChange}
              options={{ layout: 'pill', size: 'sm', style: { marginBottom: 0 } }}
            />
          )}

          <Divider />
        </>
      )}

      {/* Content header sekce */}
      {sectionTitle && (
        <>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>
            {sectionTitle}
          </h2>

          {sectionDescription && (
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, marginBottom: '1.5rem' }}>
              {sectionDescription}
            </p>
          )}
        </>
      )}

      {/* Denní cíl sekce */}
      {showDailyGoal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'var(--glass-bg)',
            borderRadius: RADIUS.lg,
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <Target size={20} color="var(--color-primary)" />
          <FormLabel text="Dnešní cíl:" style={{ margin: 0, fontWeight: 600 }} />
          <FormInput
            type="number"
            min="0"
            max="100"
            value={dailyGoal}
            onChange={(e) => onSetDailyGoal?.(e.target.value)}
            placeholder="0"
            style={{ width: '80px', textAlign: 'center' }}
          />
          <span style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 500
          }}>
            {goalLabel}
          </span>
          {dailyGoal > 0 && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: completedToday >= dailyGoal ? 'var(--color-success)' : 'var(--color-primary)'
            }}>
              {completedToday}/{dailyGoal}
              {completedToday >= dailyGoal && ' 🎉'}
            </span>
          )}
        </motion.div>
      )}

      {/* Progress bar sekce */}
      {(progressLabel || progress !== undefined) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {progressLabel && (
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              flexShrink: 0
            }}>
              {progressLabel}
            </span>
          )}

          {progress !== undefined && (
            <div style={{
              flex: 1,
              height: '4px',
              background: 'rgba(0, 0, 0, 0.03)',
              borderRadius: RADIUS.sm,
              overflow: 'hidden'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-primary-transparent), var(--color-secondary-transparent))',
                  borderRadius: RADIUS.sm
                }}
              />
            </div>
          )}

          {sectionAction && <div style={{ flexShrink: 0 }}>{sectionAction}</div>}
        </div>
      )}

      {/* Obsah stránky */}
      {children}
    </div>
  );
}

export default PageSection;
