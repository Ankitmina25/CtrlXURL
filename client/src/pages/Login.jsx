import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
      return;
    }

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.94, rotateX: 6 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.login({ email, password });
      await checkAuth();
      toast.success('Welcome back to CtrlXURL!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-clean" ref={cardRef}>
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Log in to your CtrlXURL account to manage links</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-clean">
            <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMail /> Email Address</label>
            <input
              className="form-input-clean"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-clean">
            <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiLock /> Password</label>
            <input
              className="form-input-clean"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-dark btn-pill" type="submit" disabled={loading} style={{ width: '100%', marginTop: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {loading ? 'Logging in...' : <><FiLogIn /> Log In</>}
          </button>
        </form>

        <div className="auth-footer-clean">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
