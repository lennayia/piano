import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';

function LoginForm({ disableBackgroundMusic = false, videoRef = null, isVideoMuted = true, toggleVideoSound = null }) {
  const navigate = useNavigate();
  const loginUser = useUserStore((state) => state.loginUser);

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
    // Pokud máme video se zvukem, ovládáme video
    if (disableBackgroundMusic && toggleVideoSound) {
      toggleVideoSound();
    } else {
      // Jinak ovládáme Vltavu
      if (isMusicPlaying) {
        audioEngine.stopVltavaLoop();
        setIsMusicPlaying(false);
      } else {
        audioEngine.startVltavaLoop();
        setIsMusicPlaying(true);
      }
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
      newErrors.firstName = 'Vyplňte svoje jméno, prosím';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vyplňte svoje příjmení, prosím';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vyplňte svůj e-mail, prosím';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Zkontrolujte, jestli v e-mailové adrese není chyba';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Přihlásit uživatele přes Supabase (bez hesla)
      await loginUser(formData);

      // Ztlumit hudbu a přejít do aplikace
      audioEngine.fadeOut(2.0);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      setErrors({ general: error.message || 'Aaa, něco se nepovedlo 😕 Zkuste to znovu, prosím.' });
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Vítejte</h2>

        {/* Music control button */}
        <motion.button
          type="button"
          onClick={toggleMusic}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(45, 91, 120, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginBottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: (disableBackgroundMusic ? !isVideoMuted : isMusicPlaying) ? 'rgba(45, 91, 120, 0.12)' : 'rgba(120, 120, 120, 0.1)',
            border: (disableBackgroundMusic ? !isVideoMuted : isMusicPlaying) ? '1.5px solid rgba(45, 91, 120, 0.4)' : '1.5px solid rgba(120, 120, 120, 0.3)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.8125rem',
            color: (disableBackgroundMusic ? !isVideoMuted : isMusicPlaying) ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
            fontWeight: 500
          }}
          title={(disableBackgroundMusic ? !isVideoMuted : isMusicPlaying) ? 'Vypněte si zvuk' : 'Zapněte si zvuk'}
        >
          {(disableBackgroundMusic ? !isVideoMuted : isMusicPlaying) ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{(disableBackgroundMusic ? !isVideoMuted : isMusicPlaying) ? 'Vypněte si zvuk' : 'Zapněte si zvuk'}</span>
        </motion.button>

        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
          Vyplňte svoje údaje a začněte hrát na klavír
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
            autoComplete="given-name"
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
            autoComplete="family-name"
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
