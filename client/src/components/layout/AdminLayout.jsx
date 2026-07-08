import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AdminLayout.css';

function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <h3>NaturallyU Admin</h3>
        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/pages/home">Page Builder (Home)</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/media">Media Library</Link>
          <Link to="/admin/settings">Site Settings</Link>
        </nav>
        <div className="admin-layout__user">
          <span>{admin?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <div className="admin-layout__content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
