import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const email = location.state?.email || localStorage.getItem('pendingVerifyEmail') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.94, rotateX: 6 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8, ease: 'power3.out' }
    );

    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return toast.error('Enter 6-digit code');
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email, otp: otpString });
      localStorage.removeItem('pendingVerifyEmail');
      await checkAuth();
      toast.success('Account verified!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    localStorage.removeItem('pendingVerifyEmail');
    navigate('/register');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-clean" ref={cardRef}>
        <div className="auth-header">
          <h2>Enter Code</h2>
          <p>We sent a 6-digit code to <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-grid" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => (inputsRef.current[i] = el)}
              />
            ))}
          </div>

          <button className="btn btn-dark btn-pill" type="submit" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="auth-footer-clean" style={{ marginTop: '20px' }}>
          Didn't receive code or wrong email?{' '}
          <button
            onClick={handleStartOver}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-coral)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Go back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
