import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  House,
  SquaresFour,
  Package,
  Receipt,
  Images,
  Archive,
  GearSix,
  SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';
import '../../styles/admin/admin-components.css';
import './AdminLayout.css';

function AdminLayout() {
  const { admin, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">{t('NaturallyU Admin')}</div>
        <nav className="admin-layout__nav">
          <NavLink to="/admin" end className="admin-layout__nav-link">
            <House size={20} />
            <span>{t('Dashboard')}</span>
          </NavLink>
          <NavLink to="/admin/pages" className="admin-layout__nav-link">
            <SquaresFour size={20} />
            <span>{t('Pages')}</span>
          </NavLink>
          <NavLink to="/admin/products" className="admin-layout__nav-link">
            <Package size={20} />
            <span>{t('Products')}</span>
          </NavLink>
          <NavLink to="/admin/orders" className="admin-layout__nav-link">
            <Receipt size={20} />
            <span>{t('Orders')}</span>
          </NavLink>
          <NavLink to="/admin/media" className="admin-layout__nav-link">
            <Images size={20} />
            <span>{t('Media Library')}</span>
          </NavLink>
          <NavLink to="/admin/media-gallery" className="admin-layout__nav-link">
            <Archive size={20} />
            <span>{t('Media Gallery')}</span>
          </NavLink>
          <NavLink to="/admin/settings" className="admin-layout__nav-link">
            <GearSix size={20} />
            <span>{t('Site Settings')}</span>
          </NavLink>
        </nav>
        <div className="admin-layout__user">
          <span className="admin-layout__user-name">{admin?.name}</span>
          <button className="admin-layout__logout" onClick={handleLogout}>
            <SignOut size={18} />
            {t('Logout')}
          </button>
        </div>
      </aside>
      <div className="admin-layout__content">
        <Outlet />
      </div>
      <LanguageSwitcher />
    </div>
  );
}

export default AdminLayout;
