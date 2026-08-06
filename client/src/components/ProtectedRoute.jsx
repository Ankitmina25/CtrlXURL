import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Loader = () => (
  <div className="loader-wrapper">
    <div className="loader" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
