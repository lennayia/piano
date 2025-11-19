import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function LoginForm({ disableBackgroundMusic = false }) {
  const navigate = useNavigate();
  const loginUser = useUserStore((state) => state.loginUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(!disableBackgroundMusic);

  useEffect(() => {
    // Inicializovat audio engine
    audioEngine.init();

    // Spustit Vltavu pouze pokud není zakázáno (např. když se používá video se zvukem)
    if (!disableBackgroundMusic) {
      // Malá pauza pro inicializaci
      setTimeout(() => {
        audioEngine.startVltavaLoop();
        setIsMusicPlaying(true);
      }, 100);
    }

    return () => {
      // Zastavit při opuštění stránky
      if (!disableBackgroundMusic) {
        audioEngine.stopVltavaLoop();
      }
    };
  }, [disableBackgroundMusic]);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioEngine.stopVltavaLoop();
      setIsMusicPlaying(false);
    } else {
      audioEngine.startVltavaLoop();
      setIsMusicPlaying(true);
    }
  };

  // API integrace - připravené pro email marketing služby
  const sendToEmailMarketing = async (userData) => {
    const apiConfig = {
      ecomail: {
        enabled: import.meta.env.VITE_ECOMAIL_ENABLED === 'true',
        apiKey: import.meta.env.VITE_ECOMAIL_API_KEY || '',
        listId: import.meta.env.VITE_ECOMAIL_LIST_ID || '',
        endpoint: 'https://api2.ecomailapp.cz/subscribers/subscribe'
      },
      mailerlite: {
        enabled: import.meta.env.VITE_MAILERLITE_ENABLED === 'true',
        apiKey: import.meta.env.VITE_MAILERLITE_API_KEY || '',
        groupId: import.meta.env.VITE_MAILERLITE_GROUP_ID || '',
        endpoint: 'https://connect.mailerlite.com/api/subscribers'
      },
      smartemailing: {
        enabled: import.meta.env.VITE_SMARTEMAILING_ENABLED === 'true',
        username: import.meta.env.VITE_SMARTEMAILING_USERNAME || '',
        apiKey: import.meta.env.VITE_SMARTEMAILING_API_KEY || '',
        listId: import.meta.env.VITE_SMARTEMAILING_LIST_ID || '',
        endpoint: 'https://app.smartemailing.cz/api/v3/import'
      }
    };

    const promises = [];

    // EcoMail API
    if (apiConfig.ecomail.enabled && apiConfig.ecomail.apiKey) {
      promises.push(
        fetch(apiConfig.ecomail.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'key': apiConfig.ecomail.apiKey
          },
          body: JSON.stringify({
            subscriber_data: {
              email: userData.email,
              name: `${userData.firstName} ${userData.lastName}`,
              surname: userData.lastName,
              vokativ: userData.firstName
            },
            lists: [apiConfig.ecomail.listId],
            update_existing: true,
            trigger_autoresponders: true
          })
        }).catch(err => console.error('EcoMail error:', err))
      );
    }

    // MailerLite API
    if (apiConfig.mailerlite.enabled && apiConfig.mailerlite.apiKey) {
      promises.push(
        fetch(apiConfig.mailerlite.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.mailerlite.apiKey}`
          },
          body: JSON.stringify({
            email: userData.email,
            fields: {
              name: userData.firstName,
              last_name: userData.lastName
            },
            groups: [apiConfig.mailerlite.groupId]
          })
        }).catch(err => console.error('MailerLite error:', err))
      );
    }

    // SmartEmailing API
    if (apiConfig.smartemailing.enabled && apiConfig.smartemailing.apiKey) {
      promises.push(
        fetch(apiConfig.smartemailing.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${apiConfig.smartemailing.username}:${apiConfig.smartemailing.apiKey}`)}`
          },
          body: JSON.stringify({
            settings: {
              update: true,
              add_to_lists: [apiConfig.smartemailing.listId]
            },
            data: [{
              emailaddress: userData.email,
              name: userData.firstName,
              surname: userData.lastName
            }]
          })
        }).catch(err => console.error('SmartEmailing error:', err))
      );
    }

    // Počkat na všechny API volání
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  };

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
      // Odeslat do email marketingu
      await sendToEmailMarketing(formData);

      // Přihlásit uživatele (najde existujícího nebo vytvoří nového)
      const user = loginUser(formData);

      setCurrentUser(user);

      // Ztlumit hudbu a přejít do aplikace
      audioEngine.fadeOut(2.0);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      setErrors({ general: 'Nastala chyba při přihlašování. Zkuste to prosím znovu.' });
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
      width: '100%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
      position: 'relative'
    }}>
      {/* Music control button - zobrazit pouze pokud je povolená background music */}
      {!disableBackgroundMusic && (
        <button
          type="button"
          onClick={toggleMusic}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(45, 91, 120, 0.1)',
            border: '1px solid rgba(45, 91, 120, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title={isMusicPlaying ? 'Vypnout hudbu' : 'Zapnout hudbu'}
        >
          {isMusicPlaying ? <Volume2 size={20} color="var(--color-secondary)" /> : <VolumeX size={20} color="var(--color-text-secondary)" />}
        </button>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Vítejte</h2>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
          Zadejte své údaje a začněte svou cestu ke hře na klavír
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
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
          />
          {errors.firstName && (
            <div className="form-error">{errors.firstName}</div>
          )}
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
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
          />
          {errors.lastName && (
            <div className="form-error">{errors.lastName}</div>
          )}
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
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

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(45, 91, 120, 0.05)',
        borderRadius: 'var(--radius)',
        fontSize: '0.75rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'center'
      }}>
        Přihlášením souhlasíte se zpracováním osobních údajů pro účely vzdělávání a zasílání informací o aplikaci.
      </div>
    </div>
  );
}

export default LoginForm;
