import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { House, Package, UserCircle, LockKey, SignOut } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './Account.css';

const NAV = [
  { to: '/account', label: 'Overview', icon: House, end: true },
  { to: '/account/orders', label: 'My orders', icon: Package },
  { to: '/account/profile', label: 'Profile & address', icon: UserCircle },
  { to: '/account/security', label: 'Password & sign-in', icon: LockKey },
];

// Customer dashboard shell: sidebar (a scrollable tab row on phones) plus
// the active section. Signed-out visitors are sent to sign in and brought
// back here afterwards.
function AccountLayout() {
  const { t } = useLang();
  const { customer, loading, logout } = useCustomer();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <p className="page-loading">{t('Loading…')}</p>;
  if (!customer) {
    return <Navigate to={`/account/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const handleLogout = () => {
    logout();
    toast.success(t('You’re signed out.'));
    navigate('/');
  };

  return (
    <section className="account-dashboard">
      <aside className="account-sidebar">
        <div className="account-sidebar__who">
          <span className="account-avatar" aria-hidden="true">{customer.name.trim()[0]?.toUpperCase()}</span>
          <div>
            <strong>{customer.name}</strong>
            <small>{customer.email}</small>
          </div>
        </div>
        <nav className="account-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="account-nav__link">
              <Icon size={18} /> {t(label)}
            </NavLink>
          ))}
          <button type="button" className="account-nav__link account-nav__logout" onClick={handleLogout}>
            <SignOut size={18} /> {t('Sign out')}
          </button>
        </nav>
      </aside>
      <div className="account-main">
        <Outlet />
      </div>
    </section>
  );
}

export default AccountLayout;
