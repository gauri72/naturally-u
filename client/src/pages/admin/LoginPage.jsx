import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import './LoginPage.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

function LoginPage() {
  const { t } = useLang();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/admin');
    } catch {
      toast.error(t('Invalid email or password'));
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>{t('Admin Login')}</h2>
        <input
          type="email"
          placeholder={t('Email')}
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder={t('Password')}
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
        <button type="submit" className="btn btn--primary">{t('Log In')}</button>
      </form>
    </div>
  );
}

export default LoginPage;
