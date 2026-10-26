import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiMail,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiHelpCircle,
  FiCheckCircle,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiGlobe,
  FiMessageCircle,
  FiZap,
  FiShield,
} from 'react-icons/fi';
import { contactAPI } from '../api';

gsap.registerPlugin(ScrollTrigger);

const SUPPORT_EMAIL = 'ankitmina2512@gmail.com';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.send(formData);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="reveal-wrapper">
        {/* Main 2-Column Contact Card */}
        <section
          className="reveal-card contact-card"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <div className="contact-grid">
            {/* Left Column: Heading & Contact Info */}
            <div>
              <div
                className="landing-badge"
                style={{
                  background: '#fbece8',
                  color: '#e05638',
                  border: '1px solid #f9d8cf',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                <FiMessageCircle /> Get In Touch
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--text-dark)',
                  lineHeight: 1.15,
                  margin: '8px 0 14px',
                }}
              >
                We'd Love to <span className="highlight-box">Hear</span> From You
              </h1>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.96rem',
                  lineHeight: '1.6',
                  maxWidth: '460px',
                  marginBottom: '20px',
                }}
              >
                Have questions about CtrlXURL, custom domain requests, or technical support? Our team is available 24/7.
              </p>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <FiMail />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', display: 'block' }}>
                      Support Email
                    </span>
                    <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <FiZap />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', display: 'block' }}>
                      Response Time
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      Within 2 hours average
                    </span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                    <FiShield />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', display: 'block' }}>
                      Service Reliability
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      99.99% Redirection Uptime SLA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              {submitted ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'var(--bg-input)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <FiCheckCircle style={{ fontSize: '3.5rem', color: 'var(--brand-coral)' }} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', margin: '16px 0 8px', fontSize: '1.4rem', fontWeight: 800 }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '380px', margin: '0 auto 20px' }}>
                    Thank you for reaching out. We will get back to <strong>{formData.email}</strong> within 2 hours.
                  </p>
                  <button
                    className="btn btn-dark btn-sm btn-pill"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form-box">
                  <div className="contact-form-row">
                    <div className="form-group-clean" style={{ marginBottom: '14px' }}>
                      <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiUser /> Your Name
                      </label>
                      <input
                        className="form-input-clean"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ padding: '11px 14px' }}
                      />
                    </div>

                    <div className="form-group-clean" style={{ marginBottom: '14px' }}>
                      <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiMail /> Email Address
                      </label>
                      <input
                        className="form-input-clean"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        style={{ padding: '11px 14px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group-clean" style={{ marginBottom: '14px' }}>
                    <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FiHelpCircle /> Subject
                    </label>
                    <input
                      className="form-input-clean"
                      type="text"
                      placeholder="e.g. Enterprise inquiry, API integrations, or support"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      style={{ padding: '11px 14px' }}
                    />
                  </div>

                  <div className="form-group-clean" style={{ marginBottom: '18px' }}>
                    <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FiMessageSquare /> Message
                    </label>
                    <textarea
                      className="form-input-clean"
                      rows={3}
                      placeholder="Please describe how our team can help you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      style={{ resize: 'vertical', padding: '11px 14px' }}
                    />
                  </div>

                  <button
                    className="btn btn-dark btn-pill"
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  >
                    <FiSend /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Quick FAQ */}
        <section
          className="reveal-card reveal-card-white"
          ref={(el) => (cardsRef.current[1] = el)}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, textAlign: 'center', marginBottom: '28px' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg-input)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                Is CtrlXURL completely free to use?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Yes! You can shorten unlimited links, generate QR codes, and track real-time click stream statistics for free.
              </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                How do link expiration dates work?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                When creating a link, set an optional expiration date. Once the date passes, visitors will see an expired link notice.
              </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                Can I edit or delete my shortened links?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Yes! Log into your CtrlXURL dashboard at any time to delete links or inspect live device & browser statistics.
              </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                How fast is link redirection?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Powered by in-memory Redis caching, links redirect in sub-20ms with near-zero latency globally.
              </p>
            </div>
          </div>
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

export default Contact;
