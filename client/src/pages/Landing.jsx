import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoModal from '../components/InfoModal';
import { buildShortUrl } from '../api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiLink, FiMousePointer, FiGlobe, FiZap, FiTag, FiBarChart2, FiMaximize, FiClock, FiShield, FiArrowRight, FiGithub, FiTwitter, FiLinkedin, FiCopy } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const { user } = useAuth();
  const [modalType, setModalType] = useState(null);
  const [demoUrl, setDemoUrl] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const cardsRef = useRef([]);

  const ctaTarget = user ? '/dashboard' : '/register';
  const displayUser = user ? user.username : 'User';

  useEffect(() => {
    // Animate Hero immediately on mount
    if (cardsRef.current[0]) {
      gsap.fromTo(
        cardsRef.current[0],
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
      );
    }

    // Subsequent reveal cards with scrollTrigger (once: true so content never vanishes)
    cardsRef.current.slice(1).forEach((card) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoUrl) return;
    setDemoLoading(true);
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 7);
      setDemoResult({
        originalUrl: demoUrl,
        shortUrl: buildShortUrl(code),
        shortCode: code,
      });
      setDemoLoading(false);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="reveal-wrapper">
        {/* CARD 1: HERO CARD */}
        <section
          className="reveal-card reveal-card-hero"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <h1 className="hero-title">
            Make Your URL <span className="highlight-box">Short</span>
            <br />
            Branded And Practical
          </h1>

          <p className="hero-subtitle">
            A clean and modern URL shortener built to make link shortening, custom tracking, and campaign management fast, smart, and effortless.
          </p>

          <form onSubmit={handleDemoSubmit}>
            <div className="shortener-box">
              <div className="shortener-input-group">
                <FiLink className="input-icon" />
                <input
                  className="shortener-input"
                  type="url"
                  placeholder="Enter or paste your long URL (e.g. https://yourbrand.com/campaign)..."
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-dark btn-pill" type="submit" disabled={demoLoading}>
                {demoLoading ? 'Shortening...' : 'Shorten'}
              </button>
            </div>
          </form>

          {demoResult && (
            <div className="shortened-result" style={{ maxWidth: '760px', margin: '20px auto 0' }}>
              <div className="result-info">
                <span className="result-title">Code: {demoResult.shortCode}</span>
                <span className="result-url">Destination: {demoResult.originalUrl}</span>
                <span className="result-short-link">{demoResult.shortUrl}</span>
              </div>
              <div className="result-actions">
                <Link to={ctaTarget} className="btn btn-coral btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {user ? 'Go to Dashboard' : 'Save in Dashboard'} <FiArrowRight />
                </Link>
              </div>
            </div>
          )}

          {/* Hero Mockup Card Graphic */}
          <div className="hero-illustration">
            <div className="hero-mockup-card">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="mockup-dot red"></span>
                  <span className="mockup-dot yellow"></span>
                  <span className="mockup-dot green"></span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ctrlxurl.com/dashboard</span>
                <span>✨</span>
              </div>
              <div className="url-row" style={{ boxShadow: 'none', border: '1px solid var(--border-light)', gap: '16px', padding: '20px' }}>
                <div className="url-row-left" style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                  <span className="url-row-title">{displayUser} | Sample Short Link</span>
                  <span className="url-row-destination" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>Destination # https://example.com/my-long-url</span>
                </div>
                <div className="url-row-short" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <FiLink style={{ color: 'var(--brand-coral)', flexShrink: 0 }} /> ctrlxurl.com/sample
                </div>
                <div className="url-row-actions">
                  <span className="action-btn"><FiCopy /> Copy</span>
                  <span className="action-btn"><FiBarChart2 /> Statistics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CARD 2: MINT SECTION (SHORT IS BETTER) */}
        <section
          className="reveal-card reveal-card-mint"
          ref={(el) => (cardsRef.current[1] = el)}
        >
          <div className="split-grid">
            <div className="mint-stats-graphic">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>Number of Clicks</span>
                <span className="stats-badge-green">🟢 Live Updates</span>
              </div>
              <div className="stats-circle-bar">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL CLICK RATE</span>
                  <div className="stats-big-num">85.5%</div>
                </div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'conic-gradient(#e05638 85.5%, #eaf2ee 0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span><FiMousePointer style={{ color: 'var(--brand-coral)' }} /> 1,200 Active Clicks</span>
                <span>📅 Updated Today</span>
              </div>
            </div>

            <div className="split-content">
              <h2>SHORT IS BETTER 🚀</h2>
              <p>
                Shortened URLs eliminate clunky text, improve link memorability, and boost click-through rates across social media, email campaigns, and SMS marketing.
              </p>
              <Link to={ctaTarget} className="btn btn-dark btn-pill">
                {user ? 'Go to Dashboard' : 'Shorten Your Links Now'}
              </Link>
            </div>
          </div>
        </section>

        {/* CARD 3: WHITE SECTION (ALL IN ONE TOOL) */}
        <section
          className="reveal-card reveal-card-white"
          ref={(el) => (cardsRef.current[2] = el)}
        >
          <div className="split-grid">
            <div className="split-content">
              <h2>The all-in-one tool to shorten your URLs</h2>
              <p>
                Manage your entire link catalog from a single intuitive dashboard. Generate QR codes, set expiration dates, and monitor every single visit.
              </p>

              <div className="feature-bullets">
                <div className="bullet-item">
                  <span className="bullet-check">✓</span>
                  <span>Custom alias codes (3 to 10 characters)</span>
                </div>
                <div className="bullet-item">
                  <span className="bullet-check">✓</span>
                  <span>Automated QR code generation for mobile campaigns</span>
                </div>
                <div className="bullet-item">
                  <span className="bullet-check">✓</span>
                  <span>Optional link expiration date for security</span>
                </div>
                <div className="bullet-item">
                  <span className="bullet-check">✓</span>
                  <span>Real-time total click tracking</span>
                </div>
              </div>

              <Link to={ctaTarget} className="btn btn-coral btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {user ? 'Go to Dashboard' : 'Get Started Free'} <FiArrowRight />
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: '#f8faf9', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
                <FiGlobe style={{ fontSize: '3.5rem', color: 'var(--brand-coral)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: '16px 0 8px', fontSize: '1.4rem' }}>Global Link Tracking</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Track clicks in real-time with instant server synchronization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CARD 4: LIGHT MINT GRID CARD (EXPLORE FEATURES) */}
        <section
          className="reveal-card reveal-card-lightmint"
          ref={(el) => (cardsRef.current[3] = el)}
        >
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              We're more than an URL Shortener tool. Explore our features, and satisfy your customers
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>
              Built for performance, privacy, and seamless integration.
            </p>
          </div>

          <div className="features-grid-6">
            <div className="grid-feature-card">
              <FiZap className="grid-feature-icon" style={{ color: 'var(--brand-coral)' }} />
              <h4>Ultra-Fast Redirection</h4>
              <p>Under 20ms redirection times for optimal user experience.</p>
            </div>

            <div className="grid-feature-card">
              <FiTag className="grid-feature-icon" style={{ color: 'var(--brand-coral)' }} />
              <h4>Custom Code Support</h4>
              <p>Define your own vanity short codes from 3 to 10 characters.</p>
            </div>

            <div className="grid-feature-card">
              <FiBarChart2 className="grid-feature-icon" style={{ color: 'var(--brand-coral)' }} />
              <h4>Deep Click Analytics</h4>
              <p>Track live visits with device, OS, browser, and IP activity stream breakdowns.</p>
            </div>

            <div className="grid-feature-card">
              <FiMaximize className="grid-feature-icon" style={{ color: 'var(--brand-coral)' }} />
              <h4>QR Code Generator</h4>
              <p>Instant high-res QR codes generated for every short URL.</p>
            </div>

            <div className="grid-feature-card">
              <FiClock className="grid-feature-icon" style={{ color: 'var(--brand-coral)' }} />
              <h4>Expiration Dates</h4>
              <p>Set custom dates after which links automatically expire.</p>
            </div>

            <div className="grid-feature-card">
              <FiShield className="grid-feature-icon" style={{ color: 'var(--brand-coral)' }} />
              <h4>OTP Cipher Auth</h4>
              <p>Email cipher verification ensuring maximum account security.</p>
            </div>
          </div>
        </section>

        {/* CARD 5: DARK CTA BANNER CARD */}
        <section
          className="reveal-card reveal-card-cta"
          ref={(el) => (cardsRef.current[4] = el)}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px' }}>
            Make your URLs stand out with our free link shortener
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '560px', margin: '0 auto 32px' }}>
            Join thousands of creators shortening links today. Simple, fast, and completely free.
          </p>
          <Link to={ctaTarget} className="btn btn-coral btn-pill" style={{ padding: '16px 36px', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {user ? 'Go to Dashboard' : 'Get Started Now'} <FiArrowRight />
          </Link>
        </section>
      </main>

      <footer className="pingalo-footer">
        <div>© CtrlXURL Shortener</div>
        <div className="footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/features">Features</Link>
          <Link to="/contact">Contact US</Link>
        </div>
        <div className="footer-socials">
          <a href="https://github.com/Ankitmina25" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FiGithub />
          </a>
          <a href="https://x.com/AnkitMeena2512" target="_blank" rel="noopener noreferrer" aria-label="X">
            <FiTwitter />
          </a>
          <a href="https://www.linkedin.com/in/ankit-meena77/?isSelfProfile=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FiLinkedin />
          </a>
          <FiGlobe />
        </div>
      </footer>

      {modalType && (
        <InfoModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
};

export default Landing;
