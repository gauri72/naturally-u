import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return null; // or a spinner
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}

export default ProtectedRoute;
