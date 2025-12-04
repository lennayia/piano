import { motion } from 'framer-motion';
import { Trophy, Search, ArrowUpDown } from 'lucide-react';
import TabButtons from './TabButtons';
import { FormInput, FormLabel, FormSelect } from './FormComponents';
import { ProgressBar } from './CardComponents';
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
 * @param {React.Component} props.subTabsAction - Extra tlačítko/komponenta vedle sub-tabs
 * @param {string} props.sectionTitle - H2 nadpis content sekce
 * @param {string} props.sectionDescription - Popisný text pod section title
 * @param {React.Component} props.sectionAction - Action button vedle section title
 * @param {boolean} props.showDailyGoal - Zobrazit UI pro denní cíl
 * @param {number} props.dailyGoal - Denní cíl (kolik položek chce uživatel dnes dokončit)
 * @param {function} props.onSetDailyGoal - Callback při změně denního cíle
 * @param {number} props.completedToday - Počet dokončených položek dnes
 * @param {string} props.goalLabel - Label pro denní cíl (např. "lekcí", "písniček")
 * @param {string} props.progressLabel - Label pro progress bar (např. "Váš pokrok")
 * @param {number} props.progress - Progress bar value (0-100) - DEPRECATED, use progressCurrent/progressTotal
 * @param {number} props.progressCurrent - Current value for ProgressBar modul
 * @param {number} props.progressTotal - Total value for ProgressBar modul
 * @param {string} props.progressTitle - Title for ProgressBar modul
 * @param {boolean} props.showSearch - Zobrazit vyhledávání
 * @param {string} props.searchValue - Hodnota vyhledávání
 * @param {function} props.onSearchChange - Callback při změně vyhledávání
 * @param {string} props.searchPlaceholder - Placeholder pro vyhledávací pole
 * @param {boolean} props.showSort - Zobrazit řazení
 * @param {array} props.sortOptions - Možnosti řazení [{value, label}]
 * @param {string} props.sortValue - Hodnota řazení
 * @param {function} props.onSortChange - Callback při změně řazení
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
  subTabsAction,
  sectionTitle,
  sectionDescription,
  sectionAction,
  showDailyGoal = false,
  dailyGoal = 0,
  onSetDailyGoal,
  completedToday = 0,
  goalLabel = 'položek',
  progressLabel,
  progress, // DEPRECATED
  progressCurrent,
  progressTotal,
  progressTitle = 'Dnešní pokrok:',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Hledat...',
  showSort = false,
  sortOptions = [],
  sortValue = '',
  onSortChange,
  children
}) {
  // Zjistit, jestli aktivní hlavní tab má submenu
  const currentSubTabs = subTabs[activeMainTab] || [];
  const hasSubMenu = currentSubTabs.length > 0;

  // Zjistit, jestli aktivní kombinace main+sub má třetí úroveň
  const thirdLevelKey = `${activeMainTab}-${activeSubTab}`;
  const currentThirdLevelTabs = thirdLevelTabs[thirdLevelKey] || [];
  const hasThirdLevel = currentThirdLevelTabs.length > 0;

  // MaxWidth mapping
  const maxWidthMap = {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    'full': '100%'
  };

  // Pokud maxWidth není v mapě, použij ho jako custom hodnotu (např. '1200px')
  const containerMaxWidth = maxWidthMap[maxWidth] || maxWidth;

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
    <div className="container" style={{ maxWidth: containerMaxWidth }}>
      {/* Header sekce - kompaktnější */}
      {(Icon || title || description) && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '0.75rem' }}
          >
            {title && (
              <h1 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: description ? '0.35rem' : '0'
              }}>
                {Icon && <Icon size={24} color="var(--color-text-secondary)" />}
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
            options={{ size: mainTabsSize, style: { marginBottom: hasSubMenu ? '0.75rem' : 0 } }}
          />

          {/* Submenu pills (2. úroveň) + extra action button */}
          {hasSubMenu && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: hasThirdLevel ? '0.5rem' : 0
            }}>
              <TabButtons
                tabs={currentSubTabs}
                activeTab={activeSubTab}
                onTabChange={onSubTabChange}
                options={{ layout: 'pill', size: 'sm', style: { marginBottom: 0 } }}
              />
              {subTabsAction && <div>{subTabsAction}</div>}
            </div>
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

      {/* Content header + Search/Sort v jednom řádku */}
      {(sectionTitle || showSearch || showSort) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1rem' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: sectionDescription ? '0.35rem' : 0,
            flexWrap: 'wrap'
          }}>
            {/* Title vlevo */}
            {sectionTitle && (
              <h2 style={{ margin: 0, flex: '0 0 auto' }}>
                {sectionTitle}
              </h2>
            )}

            {/* Search + Sort vpravo (na mobilu pod sebou) */}
            {(showSearch || showSort) && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginLeft: 'auto',
                flex: '1 1 auto',
                minWidth: '300px',
                flexWrap: 'wrap'
              }}>
                {showSearch && (
                  <div style={{ flex: '1 1 200px', position: 'relative', minWidth: '200px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--color-text-secondary)'
                    }}>
                      <Search size={14} />
                    </div>
                    <FormInput
                      type="text"
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder={searchPlaceholder}
                      style={{
                        paddingLeft: '2.25rem',
                        width: '100%',
                        padding: '0.35rem 0.35rem 0.35rem 2.25rem',
                        fontSize: '0.8125rem',
                        borderRadius: RADIUS.sm
                      }}
                    />
                  </div>
                )}

                {showSort && sortOptions.length > 0 && (
                  <div style={{ flex: '0 1 160px', display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: '140px' }}>
                    <ArrowUpDown size={14} color="var(--color-text-secondary)" />
                    <FormSelect
                      value={sortValue}
                      onChange={(e) => onSortChange?.(e.target.value)}
                      options={sortOptions}
                      style={{ width: '100%', padding: '0.35rem', fontSize: '0.8125rem' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description pod vším */}
          {sectionDescription && (
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              {sectionDescription}
            </p>
          )}
        </motion.div>
      )}

      {/* Denní cíl + Progress bar inline - jemnější, kompaktnější */}
      {(showDailyGoal || progress !== undefined) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '1.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(45, 91, 120, 0.03)',
            borderRadius: RADIUS.lg,
            border: '1px solid rgba(45, 91, 120, 0.08)'
          }}
        >
          {/* Denní cíl + Progress bar v jednom řádku */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {showDailyGoal && (
              <>
                <Trophy size={14} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
                <FormLabel text="Dnešní cíl:" style={{ margin: 0, fontWeight: 600, fontSize: '0.8125rem' }} />
                <FormInput
                  type="number"
                  min="0"
                  max="100"
                  value={dailyGoal}
                  onChange={(e) => onSetDailyGoal?.(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '60px',
                    textAlign: 'center',
                    padding: '0.25rem 0.35rem',
                    fontSize: '0.8125rem',
                    border: '1px solid rgba(45, 91, 120, 0.15)',
                    borderRadius: RADIUS.md
                  }}
                />
                <span style={{
                  color: 'var(--color-secondary)',
                  fontWeight: 500,
                  fontSize: '0.8125rem'
                }}>
                  {goalLabel}
                </span>
                {dailyGoal > 0 && (
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'var(--color-secondary)'
                  }}>
                    {completedToday}/{dailyGoal}
                  </span>
                )}
                {sectionAction && <div style={{ flexShrink: 0 }}>{sectionAction}</div>}
              </>
            )}

            {/* Progress bar - podporuje starý i nový způsob */}
            {(progress !== undefined || (progressCurrent !== undefined && progressTotal !== undefined)) && (
              <div style={{
                marginLeft: showDailyGoal ? '1.5rem' : '0',
                flex: '1 1 250px',
                minWidth: '250px'
              }}>
                {/* Nový způsob - ProgressBar modul */}
                {progressCurrent !== undefined && progressTotal !== undefined ? (
                  <ProgressBar
                    current={progressCurrent}
                    total={progressTotal}
                    title={progressTitle}
                    titleColor="var(--color-secondary)"
                    style={{ marginBottom: 0 }}
                  />
                ) : (
                  /* Starý způsob - inline progress bar (fallback) */
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: '1 1 250px',
                    minWidth: '200px',
                    paddingRight: '1rem'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '3px',
                      background: 'rgba(0, 0, 0, 0.08)',
                      borderRadius: RADIUS.sm,
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                          borderRadius: RADIUS.sm
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Obsah stránky */}
      {children}
    </div>
  );
}

export default PageSection;
