import { DIFFICULTY_OPTIONS } from '../../utils/lessonUtils';
import { FormLabel, FormInput, FormSelect, FormTextarea } from '../ui/FormComponents';
import { SaveButton, CancelButton } from '../ui/ButtonComponents';
import { FormField, FormFieldGrid } from '../ui/FormField';

/**
 * Univerzální formulář pro vytvoření nebo editaci lekce
 * Používá optimalizované komponenty FormField a FormFieldGrid
 */
function LessonForm({
  formData,
  onChange,
  onSave,
  onCancel,
  saveLabel = 'Uložit',
  titlePlaceholder = '',
  durationPlaceholder = ''
}) {
  return (
    <>
      {/* Název lekce - celý řádek */}
      <FormField spacing="compact">
        <FormLabel text="Název lekce" />
        <FormInput
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder={titlePlaceholder}
        />
      </FormField>

      {/* Obtížnost a délka - responzivní grid */}
      <FormFieldGrid gap="tight" marginBottom="tight">
        <FormField spacing="none">
          <FormLabel text="Obtížnost" />
          <FormSelect
            value={formData.difficulty}
            onChange={(e) => onChange('difficulty', e.target.value)}
            options={DIFFICULTY_OPTIONS}
          />
        </FormField>

        <FormField spacing="none" style={{ maxWidth: '50%', minWidth: '120px' }}>
          <FormLabel text="Délka" />
          <FormInput
            type="text"
            value={formData.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            placeholder={durationPlaceholder}
          />
        </FormField>
      </FormFieldGrid>

      <FormField spacing="compact" style={{ marginTop: 0 }}>
        <FormLabel text="Popis" />
        <FormTextarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={2}
          placeholder="Popis lekce"
        />
      </FormField>

      <FormField spacing="compact">
        <FormLabel text="Tóny (oddělené mezerou)" />
        <FormInput
          type="text"
          value={formData.content.notes.join(' ')}
          onChange={(e) => onChange('content.notes', e.target.value.split(/\s+/).map(n => n.trim()).filter(n => n))}
          placeholder="Např. C D E"
        />
      </FormField>

      <FormField spacing="compact">
        <FormLabel text="Instrukce (jedna na řádek)" />
        <FormTextarea
          value={formData.content.instructions.join('\n')}
          onChange={(e) => onChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
          rows={5}
          placeholder="Zadejte instrukce&#10;Každá na nový řádek"
        />
      </FormField>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SaveButton onClick={onSave} label={saveLabel} />
        <CancelButton onClick={onCancel} />
      </div>
    </>
  );
}

export default LessonForm;
