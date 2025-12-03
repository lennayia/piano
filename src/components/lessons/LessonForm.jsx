import { DIFFICULTY_OPTIONS } from '../../utils/lessonUtils';
import { FormLabel, FormInput, FormSelect, FormTextarea } from '../ui/FormComponents';
import { SaveButton, CancelButton } from '../ui/ButtonComponents';

/**
 * Univerzální formulář pro vytvoření nebo editaci lekce
 * Používá se v LessonList (nová lekce) i LessonCard (editace)
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <FormLabel text="Název lekce" />
          <FormInput
            type="text"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder={titlePlaceholder}
          />
        </div>

        <div className="form-group">
          <FormLabel text="Obtížnost" />
          <FormSelect
            value={formData.difficulty}
            onChange={(e) => onChange('difficulty', e.target.value)}
            options={DIFFICULTY_OPTIONS}
          />
        </div>

        <div className="form-group">
          <FormLabel text="Délka" />
          <FormInput
            type="text"
            value={formData.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            placeholder={durationPlaceholder}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <FormLabel text="Popis" />
        <FormTextarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={2}
          placeholder="Popis lekce"
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <FormLabel text="Tóny (oddělené mezerou)" />
        <FormInput
          type="text"
          value={formData.content.notes.join(' ')}
          onChange={(e) => onChange('content.notes', e.target.value.split(/\s+/).map(n => n.trim()).filter(n => n))}
          placeholder="Např. C D E"
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <FormLabel text="Instrukce (jedna na řádek)" />
        <FormTextarea
          value={formData.content.instructions.join('\n')}
          onChange={(e) => onChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
          rows={3}
          placeholder="Zadejte instrukce&#10;Každá na nový řádek"
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SaveButton onClick={onSave} label={saveLabel} />
        <CancelButton onClick={onCancel} />
      </div>
    </>
  );
}

export default LessonForm;
