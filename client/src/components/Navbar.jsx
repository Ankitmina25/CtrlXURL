import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiScissors, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <FiScissors style={{ color: 'var(--brand-coral)', transform: 'rotate(-20deg)', fontSize: '1.4rem' }} />
        <span>CtrlXURL</span>
        <span className="logo-dot"></span>
      </Link>

      <nav className="navbar-nav">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
          About Us
        </Link>
        <Link to="/features" className={`nav-item ${isActive('/features') ? 'active' : ''}`}>
          Features
        </Link>
        <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>
          Contacts
        </Link>
        {user && (
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
        )}
      </nav>

      <div className="navbar-user">
        {user ? (
          <>
            <Link to="/dashboard" className="user-badge" title="Go to Dashboard">
              <span className="user-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
              <span>{user.username}</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiLogIn /> Log In
            </Link>
            <Link to="/register" className="btn btn-dark btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiUserPlus /> Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
