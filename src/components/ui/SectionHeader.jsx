/**
 * Univerzální komponenta pro nadpisy sekcí s ikonami
 * Použití: <SectionHeader icon={Plus} title="Nová lekce" variant="h3" />
 */
function SectionHeader({ icon: Icon, title, variant = 'h3', iconSize = 20, iconColor }) {
  const HeadingTag = variant;

  return (
    <HeadingTag style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {Icon && <Icon size={iconSize} color={iconColor || 'var(--color-primary)'} />}
      {title}
    </HeadingTag>
  );
}

export default SectionHeader;
