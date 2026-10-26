import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiTag, FiMaximize, FiClock, FiBarChart2, FiShield, FiZap, FiArrowRight, FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiLayers } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
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

  const featureList = [
    {
      icon: <FiTag style={{ color: 'var(--brand-coral)', fontSize: '2rem' }} />,
      title: 'Custom Vanity Short Codes',
      desc: 'Customize your short links with your brand name or custom aliases (3 to 10 characters). Build brand recognition with every link shared.',
    },
    {
      icon: <FiMaximize style={{ color: 'var(--brand-coral)', fontSize: '2rem' }} />,
      title: 'Automated QR Code Generator',
      desc: 'Every short URL automatically generates a high-resolution QR code, perfect for print marketing, posters, business cards, and offline sharing.',
    },
    {
      icon: <FiClock style={{ color: 'var(--brand-coral)', fontSize: '2rem' }} />,
      title: 'Link Expiration Controls',
      desc: 'Set custom expiration dates for sensitive or time-limited links. Expired links are automatically deactivated to protect your campaigns.',
    },
    {
      icon: <FiBarChart2 style={{ color: 'var(--brand-coral)', fontSize: '2rem' }} />,
      title: 'Deep Click Stream Analytics',
      desc: 'Inspect real-time device distributions (Desktop, Mobile, Tablet), operating systems, top browsers, IP logs, and live click timelines.',
    },
    {
      icon: <FiShield style={{ color: 'var(--brand-coral)', fontSize: '2rem' }} />,
      title: 'Email OTP Verification',
      desc: 'Protect your account with 6-digit email OTP authentication. Ensures only authorized users can manage your link catalog.',
    },
    {
      icon: <FiZap style={{ color: 'var(--brand-coral)', fontSize: '2rem' }} />,
      title: 'Sub-20ms Global Redirection',
      desc: 'Powered by distributed edge servers ensuring instant HTTP 302/301 redirects with zero latency worldwide.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="reveal-wrapper">
        <section
          className="reveal-card reveal-card-hero"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <div className="landing-badge" style={{ background: '#fbece8', color: '#e05638', border: '1px solid #f9d8cf', margin: '0 auto 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700 }}>
            <FiLayers /> Complete Feature Suite
          </div>

          <h1 className="hero-title">
            Everything You Need for <span className="highlight-box">Smart</span> Link Management
          </h1>

          <p className="hero-subtitle">
            Explore the full set of tools engineered to make your short URLs branded, secure, and trackable.
          </p>
        </section>

        {/* Feature Grid Card */}
        <section
          className="reveal-card reveal-card-lightmint"
          ref={(el) => (cardsRef.current[1] = el)}
        >
          <div className="features-grid-6">
            {featureList.map((f, i) => (
              <div className="grid-feature-card" key={i}>
                <div style={{ marginBottom: '14px' }}>{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Card */}
        <section
          className="reveal-card reveal-card-cta"
          ref={(el) => (cardsRef.current[2] = el)}
        >
          <h2>Try all CtrlXURL features for free</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '560px', margin: '12px auto 28px' }}>
            No credit card required. Start shortening your links in seconds.
          </p>
          <Link to={ctaTarget} className="btn btn-coral btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {user ? 'Go to Dashboard' : 'Get Started Free'} <FiArrowRight />
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

export default Features;
