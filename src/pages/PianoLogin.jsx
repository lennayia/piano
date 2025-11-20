import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Piano, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../store/useUserStore';

function PianoLogin() {
  const navigate = useNavigate();
  const adminLogin = useUserStore((state) => state.adminLogin);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email není ve správném formátu';
    }

    if (!formData.password) {
      newErrors.password = 'Heslo je povinné';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Heslo musí mít alespoň 6 znaků';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔐 Attempting admin login...');
      const user = await adminLogin({
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Admin login successful:', user);

      // Redirect to dashboard (admin-specific)
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        error
      });
      setErrors({
        submit: error.message || 'Přihlášení se nezdařilo. Zkontrolujte email a heslo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '400px'
        }}
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <Piano size={48} color="#ffffff" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{
            fontSize: '2rem',
            color: '#ffffff',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Piano Admin
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#ffffff',
            opacity: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Administrátorské přihlášení
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="card"
          style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                disabled={isSubmitting}
                autoComplete="email"
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} />
                Heslo
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {isSubmitting ? 'Přihlašuji...' : 'Přihlásit se'}
            </button>
          </form>
        </motion.div>

        {/* Back to main login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginTop: '1.5rem'
          }}
        >
          <button
            onClick={() => navigate('/registration')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Zpět na hlavní přihlášení
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default PianoLogin;
