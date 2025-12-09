import { RADIUS, SHADOW } from '../../utils/styleConstants';

/**
 * QuizStatCard - Univerzální statistická karta pro kvízy
 * Použití v start screen i během hry
 *
 * @param {string|number} value - Hodnota (číslo nebo text)
 * @param {string} label - Popisek pod hodnotou
 * @param {React.Component} icon - Ikona z lucide-react (optional)
 * @param {string} iconColor - Barva ikony (optional)
 * @param {number} iconSize - Velikost ikony (optional)
 * @param {string} variant - 'primary' | 'secondary' | 'success' | 'danger' (barva)
 * @param {string} size - 'normal' (start screen) | 'compact' (game stats)
 * @param {boolean} isMobile - Responzivní úpravy
 * @param {object} style - Dodatečné styly
 */
function QuizStatCard({
  value,
  label,
  icon: Icon,
  iconColor,
  iconSize,
  variant = 'secondary',
  size = 'normal',
  isMobile = false,
  style = {},
  ...props
}) {
  // Barvy podle varianty
  const backgrounds = {
    primary: 'rgba(181, 31, 101, 0.05)',
    secondary: 'rgba(45, 91, 120, 0.05)',
    success: 'rgba(16, 185, 129, 0.05)',
    danger: 'rgba(239, 68, 68, 0.05)'
  };

  const textColors = {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'rgb(16, 185, 129)',
    danger: 'rgb(239, 68, 68)'
  };

  // Rozměry podle velikosti
  const dimensions = {
    normal: {
      padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
      valueFontSize: '1.5rem',
      labelFontSize: '0.875rem'
    },
    compact: {
      padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
      valueFontSize: '1.25rem',
      labelFontSize: '0.75rem'
    }
  };

  const dim = dimensions[size];

  // Layout pro compact režim (game stats)
  const compactLayout = size === 'compact' ? {
    flex: 1,
    minWidth: isMobile ? '80px' : '100px',
    textAlign: 'center'
  } : {};

  return (
    <div
      style={{
        background: backgrounds[variant],
        padding: dim.padding,
        borderRadius: RADIUS.md,
        boxShadow: SHADOW.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...compactLayout,
        ...style
      }}
      {...props}
    >
      {/* Normal: VALUE nahoře, LABEL dole */}
      {/* Compact: LABEL nahoře, VALUE dole */}
      {/* Ikona: Ikona vedle VALUE (horizontální, bez labelu) */}
      {Icon ? (
        // Layout s ikonou (bez labelu)
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Icon size={iconSize || (isMobile ? 16 : 20)} color={iconColor || textColors[variant]} />
          <div style={{
            fontSize: dim.valueFontSize,
            fontWeight: 'bold',
            color: 'var(--color-text-primary)',
            lineHeight: 1
          }}>
            {value}
          </div>
        </div>
      ) : size === 'normal' ? (
        // Normal layout: VALUE nahoře, LABEL dole
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: dim.valueFontSize,
            fontWeight: 'bold',
            color: textColors[variant],
            marginBottom: '0.25rem'
          }}>
            {value}
          </div>
          <div style={{
            fontSize: dim.labelFontSize,
            color: 'var(--text-secondary)'
          }}>
            {label}
          </div>
        </div>
      ) : (
        // Compact layout: LABEL nahoře, VALUE dole
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: dim.labelFontSize,
            color: 'var(--text-secondary)',
            marginBottom: '0.25rem'
          }}>
            {label}
          </div>
          <div style={{
            fontSize: dim.valueFontSize,
            fontWeight: 'bold',
            color: textColors[variant]
          }}>
            {value}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizStatCard;
