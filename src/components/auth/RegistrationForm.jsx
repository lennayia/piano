import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

function RegistrationForm() {
  const navigate = useNavigate();
  const addUser = useUserStore((state) => state.addUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const newUser = addUser(formData);
      setCurrentUser(newUser);
      navigate('/dashboard');
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
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(181, 31, 101, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <UserPlus size={32} color="var(--color-primary)" />
        </div>
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
          />
          {errors.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Začít učit se
        </button>
      </form>
    </div>
  );
}

export default RegistrationForm;
