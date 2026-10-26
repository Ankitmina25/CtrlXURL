import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiShield, FiZap, FiLock, FiArrowRight, FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiAward } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { user } = useAuth();
  const ctaTarget = user ? '/dashboard' : '/register';
  const cardsRef = useRef([]);

  useEffect(() => {
    if (cardsRef.current[0]) {
      gsap.fromTo(
        cardsRef.current[0],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="reveal-wrapper">
        <section
          className="reveal-card reveal-card-hero"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <div className="landing-badge" style={{ background: '#fbece8', color: '#e05638', border: '1px solid #f9d8cf', margin: '0 auto 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700 }}>
            <FiAward /> Our Story & Mission
          </div>

          <h1 className="hero-title">
            Simplifying Web Links for <span className="highlight-box">Millions</span> Worldwide
          </h1>

          <p className="hero-subtitle">
            CtrlXURL was founded with a single mission: to transform long, messy, unreadable URLs into short, powerful, and trackable assets for modern creators and enterprise teams.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '800px', margin: '40px auto 0' }}>
            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-coral)', fontSize: '2.2rem', fontWeight: 800 }}>10M+</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Links Shortened</p>
            </div>
            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)', fontSize: '2.2rem', fontWeight: 800 }}>99.99%</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Uptime Guarantee</p>
            </div>
            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-coral)', fontSize: '2.2rem', fontWeight: 800 }}>&lt;20ms</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Global Redirection Speed</p>
            </div>
          </div>
        </section>

        {/* Section 2: Values */}
        <section
          className="reveal-card reveal-card-mint"
          ref={(el) => (cardsRef.current[1] = el)}
        >
          <div className="split-grid">
            <div className="split-content">
              <h2>Built for Speed, Privacy & Trust 🛡️</h2>
              <p>
                We believe your links belong to you. CtrlXURL provides end-to-end link management with zero compromise on user privacy or data security.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '1.05rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiLock style={{ color: '#ffffff' }} /> <strong>Secure OTP Auth</strong> for user accounts</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiZap style={{ color: '#ffffff' }} /> <strong>Distributed Edge Redirection</strong> worldwide</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiShield style={{ color: '#ffffff' }} /> <strong>Zero Third-Party Data Selling</strong> guaranteed</li>
              </ul>
            </div>

            <div style={{ background: '#ffffff', color: '#121619', borderRadius: '24px', padding: '36px', textAlign: 'center' }}>
              <FiShield style={{ fontSize: '3.5rem', color: 'var(--brand-coral)' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '16px 0 8px' }}>Security Pledge</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Every link you create on CtrlXURL is protected by our global infrastructure and strict privacy policies.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: CTA */}
        <section
          className="reveal-card reveal-card-cta"
          ref={(el) => (cardsRef.current[2] = el)}
        >
          <h2>Ready to shorten your URLs?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '560px', margin: '12px auto 28px' }}>
            Start shortening your URLs for free today and track every click.
          </p>
          <Link to={ctaTarget} className="btn btn-coral btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {user ? 'Go to Dashboard' : 'Create Free Account'} <FiArrowRight />
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
    </div>
  );
};

export default About;
