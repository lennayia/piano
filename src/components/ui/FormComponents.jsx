import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';

/**
 * RadioLabel - stylizovaný radio button s labelem
 *
 * @param {boolean} checked - Je radio button zaškrtnutý?
 * @param {function} onChange - Callback funkce při změně
 * @param {string} name - Name atribut pro radio input
 * @param {string} label - Text labelu (default: 'Správná')
 * @param {object} style - Dodatečné styly (přepíší defaultní styly)
 */
export function RadioLabel({ checked, onChange, name, label = 'Správná', style = {}, ...props }) {
  // Defaultní styly pro RadioLabel
  const defaultStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    cursor: 'pointer',
    padding: '0.35rem 0.6rem',
    background: checked ? 'var(--color-secondary)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '10px',
    color: checked ? '#fff' : '#64748b',
    fontWeight: 500,
    minWidth: '95px',
    justifyContent: 'center',
    fontSize: '0.75rem',
    transition: 'all 0.2s ease'
  };

  return (
    <label
      style={{
        ...defaultStyle,
        ...style
      }}
      {...props}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--color-primary)'
        }}
      />
      {label}
    </label>
  );
}

/**
 * FormLabel - stylizovaný label pro formulářové prvky
 *
 * @param {string} text - Text labelu
 * @param {boolean} required - Je pole povinné? (zobrazí *)
 * @param {object} style - Dodatečné styly
 */
export function FormLabel({ text, required = false, style = {}, ...props }) {
  return (
    <label
      style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#374151',
        ...style
      }}
      {...props}
    >
      {text}
      {required && ' *'}
    </label>
  );
}

/**
 * FormTextarea - stylizovaný textarea pro formuláře
 *
 * @param {string} value - Hodnota textarea
 * @param {function} onChange - Callback při změně
 * @param {string} placeholder - Placeholder text
 * @param {number} rows - Počet řádků (default: 3)
 * @param {object} style - Dodatečné styly
 */
export function FormTextarea({ value, onChange, placeholder = '', rows = 3, style = {}, ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: RADIUS.lg,
        border: BORDER.none,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        resize: 'vertical',
        transition: 'border-color 0.2s ease',
        ...style
      }}
      {...props}
    />
  );
}

/**
 * FormSelect - stylizovaný select pro formuláře
 *
 * @param {string} value - Hodnota selectu
 * @param {function} onChange - Callback při změně
 * @param {array} options - Pole objektů { value, label }
 * @param {object} style - Dodatečné styly
 */
export function FormSelect({ value, onChange, options = [], style = {}, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: RADIUS.sm,
        border: BORDER.none,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
        ...style
      }}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * FormInput - stylizovaný input pro formuláře
 *
 * @param {string} type - Typ inputu (text, number, atd.)
 * @param {string|number} value - Hodnota inputu
 * @param {function} onChange - Callback při změně
 * @param {string} placeholder - Placeholder text
 * @param {object} style - Dodatečné styly
 */
export function FormInput({ type = 'text', value, onChange, placeholder = '', style = {}, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: RADIUS.sm,
        border: BORDER.none,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        transition: 'border-color 0.2s ease',
        ...style
      }}
      {...props}
    />
  );
}

/**
 * CheckboxLabel - stylizovaný checkbox s labelem
 *
 * @param {boolean} checked - Je checkbox zaškrtnutý?
 * @param {function} onChange - Callback při změně
 * @param {string} label - Text labelu
 * @param {object} style - Dodatečné styly pro label
 */
export function CheckboxLabel({ checked, onChange, label, style = {}, ...props }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '10px',
        width: '100%',
        fontSize: '0.875rem',
        transition: 'background 0.2s ease',
        ...style
      }}
      {...props}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: '18px',
          height: '18px',
          accentColor: 'var(--color-primary)'
        }}
      />
      {label}
    </label>
  );
}

/**
 * FormContainer - hlavní kontejner pro formulář (22px border-radius)
 *
 * @param {React.ReactNode} children - Obsah formuláře
 * @param {object} style - Dodatečné styly
 * @param {React.ElementType} as - Vlastní element (default: 'div')
 */
export function FormContainer({ children, style = {}, as: Component = 'div', ...props }) {
  return (
    <Component
      style={{
        marginBottom: '2rem',
        padding: '1.25rem',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f5f9 30%, #e8f4f8 45%, #fef8fb 55%, #e8f4f8 65%, #f0f5f9 80%, #f8f9fa 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 45s ease-in-out infinite',
        borderRadius: RADIUS.xl,
        border: BORDER.none,
        boxShadow: SHADOW.default,
        ...style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * FormSection - sekce uvnitř formuláře (12px border-radius)
 *
 * @param {string} title - Nadpis sekce
 * @param {string} variant - 'primary' | 'secondary' (default: 'secondary')
 * @param {React.ReactNode} children - Obsah sekce
 * @param {object} style - Dodatečné styly
 */
export function FormSection({ title, variant = 'secondary', children, style = {}, ...props }) {
  const variants = {
    primary: {
      titleColor: 'var(--color-primary)'
    },
    secondary: {
      titleColor: 'var(--color-secondary)'
    }
  };

  const variantStyle = variants[variant];

  return (
    <div
      style={{
        padding: '1rem',
        marginBottom: '1.5rem',
        background: 'transparent',
        border: BORDER.none,
        borderRadius: RADIUS.md,
        boxShadow: SHADOW.default,
        ...style
      }}
      {...props}
    >
      {title && (
        <h5 style={{ margin: '0 0 1rem 0', color: variantStyle.titleColor, fontSize: '0.9375rem', fontWeight: 600 }}>
          {title}
        </h5>
      )}
      {children}
    </div>
  );
}
