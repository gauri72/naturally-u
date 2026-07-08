import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back. Quick links:</p>
      <ul>
        <li><Link to="/admin/pages/home">Edit Homepage</Link></li>
        <li><Link to="/admin/products">Manage Products</Link></li>
        <li><Link to="/admin/orders">View Orders</Link></li>
      </ul>
    </div>
  );
}

export default DashboardPage;
