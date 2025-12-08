import { Piano, Play } from 'lucide-react';
import { Card } from './CardComponents';
import { PrimaryButton } from './ButtonComponents';

/**
 * PianoPrepareDialog - Reusable dialog pro inicializaci Salamander Piano
 * Použití: ChordQuiz, ChordPracticeSection, další komponenty s audio
 *
 * @param {function} onInitPiano - Callback pro spuštění piano inicializace
 * @param {boolean} isLoading - Stav načítání piano samples
 * @param {number} iconSize - Velikost ikony (default: 32)
 * @param {string} title - Nadpis dialogu (default: "Připravit piano")
 * @param {string} description - Popis dialogu
 * @param {string} buttonText - Text tlačítka (default: "Spustit piano")
 * @param {string} loadingText - Text během načítání (default: "Načítání...")
 */
function PianoPrepareDialog({
  onInitPiano,
  isLoading = false,
  iconSize = 32,
  title = 'Připravit piano',
  description = 'Klikněte pro načtení kvalitních piano samplů ze Salamander Grand Piano',
  buttonText = 'Spustit piano',
  loadingText = 'Načítání...'
}) {
  return (
    <div className="container" style={{ maxWidth: '1024px', margin: '2rem auto' }}>
      <Card opacity={0.4} style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
        <Piano
          size={iconSize}
          color="var(--color-primary)"
          style={{ marginBottom: '0.75rem' }}
        />
        <h3 style={{
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
          fontSize: '1.125rem'
        }}>
          {title}
        </h3>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
        <PrimaryButton
          onClick={onInitPiano}
          disabled={isLoading}
          style={{
            background: 'var(--color-primary)',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(45, 91, 120, 0.3)',
            margin: '0 auto'
          }}
        >
          <Play size={18} />
          {isLoading ? loadingText : buttonText}
        </PrimaryButton>
      </Card>
    </div>
  );
}

export default PianoPrepareDialog;
