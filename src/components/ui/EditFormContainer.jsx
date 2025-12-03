import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './CardComponents';
import SectionHeader from './SectionHeader';

/**
 * Univerzální kontejner pro editační formuláře s glassmorphism efektem
 * Kompaktní, responzivní a animovaný - vhodný pro všechny admin sekce
 *
 * Používá modulární komponenty:
 * - Card (glassmorphism efekt)
 * - SectionHeader (nadpis s ikonou)
 *
 * Uvnitř použijte:
 * - FormField, FormFieldGrid (rozložení)
 * - FormLabel, FormInput, FormSelect, FormTextarea (formulářové prvky)
 * - SaveButton, CancelButton (akční tlačítka)
 *
 * @param {boolean} isOpen - Zda je formulář otevřený
 * @param {React.Component} icon - Ikona pro header (z lucide-react)
 * @param {string} title - Nadpis formuláře
 * @param {React.ReactNode} children - Obsah formuláře
 * @param {object} style - Volitelné custom styly (přepíše výchozí)
 */
function EditFormContainer({ isOpen, icon, title, children, style = {} }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginTop: '1rem' }}
        >
          <Card
            shadow="primary"
            radius="xl"
            opacity={0.4}
            blur="30px"
            style={{
              padding: '1rem 0.75rem',
              overflow: 'hidden',
              ...style
            }}
          >
            {(icon || title) && (
              <SectionHeader
                icon={icon}
                title={title}
                variant="h3"
                iconSize={18}
                iconColor="var(--color-secondary)"
              />
            )}

            {children}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EditFormContainer;
