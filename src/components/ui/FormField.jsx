/**
 * Wrapper pro kompaktní form fieldy s optimalizovaným spacingem
 * Používá stejné nastavení jako optimalizované formuláře v Lekce sekci
 *
 * @param {React.Component} children - Obsah pole (label + input)
 * @param {string} spacing - Spacing varianta: 'compact' (0.5rem), 'tight' (0.35rem), 'none' (0)
 * @param {object} style - Volitelné custom styly
 */
export function FormField({ children, spacing = 'compact', style = {} }) {
  const spacingMap = {
    compact: '0.5rem',
    tight: '0.35rem',
    none: 0
  };

  return (
    <div className="form-group" style={{ marginBottom: spacingMap[spacing], ...style }}>
      {children}
    </div>
  );
}

/**
 * Grid kontejner pro dva fieldy vedle sebe (např. Obtížnost + Délka)
 * S optimalizovaným gap a responzivitou
 *
 * @param {React.Component} children - Form fieldy
 * @param {string} gap - Gap mezi fieldy: 'compact' (0.5rem), 'tight' (0.35rem)
 * @param {string} marginBottom - Spodní margin: 'compact' (0.5rem), 'tight' (0.35rem), 'none' (0)
 * @param {object} style - Volitelné custom styly
 */
export function FormFieldGrid({ children, gap = 'tight', marginBottom = 'tight', style = {} }) {
  const gapMap = {
    compact: '0.5rem',
    tight: '0.35rem'
  };

  const marginMap = {
    compact: '0.5rem',
    tight: '0.35rem',
    none: 0
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
      gap: gapMap[gap],
      marginBottom: marginMap[marginBottom],
      ...style
    }}>
      {children}
    </div>
  );
}

export default FormField;
