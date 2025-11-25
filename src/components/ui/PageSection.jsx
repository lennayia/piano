import { motion } from 'framer-motion';
import TabButtons from './TabButtons';

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
 * @param {string} props.activeMainTab - ID aktivního hlavního tabu
 * @param {string} props.activeSubTab - ID aktivního sub tabu
 * @param {function} props.onMainTabChange - Callback při změně hlavního tabu
 * @param {function} props.onSubTabChange - Callback při změně sub tabu
 * @param {string} props.mainTabsSize - Velikost main tabs: 'sm' | 'md' | 'lg' (default: 'lg')
 * @param {string} props.sectionTitle - H2 nadpis content sekce
 * @param {string} props.sectionDescription - Popisný text pod section title
 * @param {React.Component} props.sectionAction - Action button vedle section title
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
  activeMainTab,
  activeSubTab,
  onMainTabChange,
  onSubTabChange,
  mainTabsSize = 'md',
  sectionTitle,
  sectionDescription,
  sectionAction,
  progressLabel,
  progress,
  children
}) {
  // Zjistit, jestli aktivní hlavní tab má submenu
  const currentSubTabs = subTabs[activeMainTab] || [];
  const hasSubMenu = currentSubTabs.length > 0;

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
                {Icon && <Icon size={32} color="var(--color-primary)" />}
                {title}
              </h1>
            )}
            {description && (
              <p style={{ color: '#64748b', margin: 0 }}>
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

          {/* Submenu pills */}
          {hasSubMenu && (
            <TabButtons
              tabs={currentSubTabs}
              activeTab={activeSubTab}
              onTabChange={onSubTabChange}
              options={{ layout: 'pill', style: { marginBottom: 0 } }}
            />
          )}

          <Divider />
        </>
      )}

      {/* Content header sekce */}
      {sectionTitle && (
        <>
          <h2 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {sectionTitle}
          </h2>

          {sectionDescription && (
            <p style={{ color: '#64748b', margin: 0, marginBottom: '1.5rem' }}>
              {sectionDescription}
            </p>
          )}
        </>
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
              color: '#475569',
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
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(181, 31, 101, 0.5), rgba(45, 91, 120, 0.5))',
                  borderRadius: '2px'
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
