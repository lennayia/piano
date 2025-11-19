import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function RegistrationForm() {
  const navigate = useNavigate();
  const loginUser = useUserStore((state) => state.loginUser);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Spustit Vltavu na pozadí
    audioEngine.startVltavaLoop();

    return () => {
      // Zastavit při opuštění stránky
      audioEngine.stopVltavaLoop();
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Jméno je povinné';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Příjmení je povinné';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Zadejte platný email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Přihlásit nebo zaregistrovat uživatele (bez hesla)
      await loginUser(formData);

      // Ztlumit hudbu a přejít do aplikace
      audioEngine.fadeOut(2.0);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      console.error('Chyba při přihlášení:', error);
      setErrors({ general: error.message || 'Nastala chyba. Zkuste to prosím znovu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="card" style={{
      maxWidth: '500px',
      margin: '2rem auto',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <motion.div
          className="pulse-glow"
          whileHover={{ scale: 1.1, rotate: 5 }}
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(214, 51, 132, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 32px rgba(181, 31, 101, 0.3)'
          }}
        >
          <UserPlus size={32} color="var(--color-primary)" />
        </motion.div>
        <h2>Začněte se učit</h2>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
          Zadejte své údaje a začněte svou cestu ke hře na klavír
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              Jméno
            </div>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Jan"
            disabled={isSubmitting}
            autoComplete="given-name"
          />
          {errors.firstName && (
            <div className="form-error">{errors.firstName}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              Příjmení
            </div>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Novák"
            disabled={isSubmitting}
            autoComplete="family-name"
          />
          {errors.lastName && (
            <div className="form-error">{errors.lastName}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} />
              Email
            </div>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="jan.novak@email.cz"
            disabled={isSubmitting}
            autoComplete="email"
          />
          {errors.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>

        {errors.general && (
          <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Přihlašuji...' : 'Začít se učit'}
        </button>
      </form>
    </div>
  );
}

export default RegistrationForm;
