import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
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
      await authAPI.register({ username, email, password });
      localStorage.setItem('pendingVerifyEmail', email);
      toast.success('Verification code sent to email!');
      navigate('/verify-otp', { state: { email } });
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
          <h2>Create Account</h2>
          <p>Get started with CtrlXURL Shortener</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-clean">
            <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUser /> Username</label>
            <input
              className="form-input-clean"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
              placeholder="Enter a secure password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button className="btn btn-dark btn-pill" type="submit" disabled={loading} style={{ width: '100%', marginTop: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {loading ? 'Creating Account...' : <><FiUserPlus /> Sign Up</>}
          </button>
        </form>

        <div className="auth-footer-clean">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
