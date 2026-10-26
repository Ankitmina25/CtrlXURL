import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiCheckCircle, FiZap, FiMaximize, FiClock, FiBarChart2, FiShield, FiMail, FiUser, FiSend, FiMessageSquare } from 'react-icons/fi';
import { contactAPI } from '../api';

const InfoModal = ({ type, onClose }) => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.send({
        ...contactForm,
        subject: 'CtrlXURL Contact Message',
      });
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'about':
        return (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px' }}>
              About CtrlXURL
            </h2>
            <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '14px' }}>
              <strong>CtrlXURL</strong> is a next-generation URL shortening and link management platform designed for modern creators, marketers, and enterprise teams.
            </p>
            <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '14px' }}>
              Our mission is to simplify the web by transforming long, unwieldy URLs into memorable, trackable short links. Built on ultra-fast infrastructure, CtrlXURL ensures instant redirection, 99.99% uptime, and detailed analytics.
            </p>
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', marginTop: '20px' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--brand-coral)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiZap /> Why Choose CtrlXURL?
              </h4>
              <ul style={{ paddingLeft: '0', listStyle: 'none', color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle style={{ color: 'var(--brand-coral)' }} /> Lightning-fast 302/301 URL redirection</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle style={{ color: 'var(--brand-coral)' }} /> Custom vanity code support (3 to 10 characters)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle style={{ color: 'var(--brand-coral)' }} /> Auto-generated QR codes for easy mobile sharing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle style={{ color: 'var(--brand-coral)' }} /> Optional link expiration dates for security</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle style={{ color: 'var(--brand-coral)' }} /> Real-time click statistics and tracking</li>
              </ul>
            </div>
          </>
        );

      case 'privacy':
        return (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiShield style={{ color: 'var(--brand-coral)' }} /> Privacy Policy
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Last Updated: August 2026
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                  1. Information We Collect
                </h4>
                <p>We collect basic account information (username and email address) during registration. When links are accessed, we record click metrics to provide real-time dashboard statistics.</p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                  2. How We Use Information
                </h4>
                <p>Your data is strictly used to provide URL shortening, authentication via secure OTP verification, analytics reports, and link expiration enforcement. We never sell or share your personal information.</p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                  3. Data Security & Cookies
                </h4>
                <p>CtrlXURL uses HTTP-only secure cookies for session authentication and bcrypt password hashing. All API communications are encrypted via SSL/TLS.</p>
              </div>
            </div>
          </>
        );

      case 'features':
        return (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px' }}>
              CtrlXURL Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <FiZap style={{ fontSize: '1.5rem', color: 'var(--brand-coral)' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: '8px 0 4px', color: 'var(--text-dark)' }}>Instant Shortening</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Generate clean short URLs instantly with custom codes or random hex keys.</p>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <FiMaximize style={{ fontSize: '1.5rem', color: 'var(--brand-coral)' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: '8px 0 4px', color: 'var(--text-dark)' }}>QR Code Generator</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Download high-resolution QR codes automatically created for every link.</p>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <FiClock style={{ fontSize: '1.5rem', color: 'var(--brand-coral)' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: '8px 0 4px', color: 'var(--text-dark)' }}>Link Expiration</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Set custom future expiration dates to automatically deactivate sensitive links.</p>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <FiBarChart2 style={{ fontSize: '1.5rem', color: 'var(--brand-coral)' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, margin: '8px 0 4px', color: 'var(--text-dark)' }}>Click Stream Analytics</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track live click streams, device types, operating systems, browsers, and IP activity.</p>
              </div>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMail style={{ color: 'var(--brand-coral)' }} /> Contact Us
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Have questions or feedback? Drop us a message below!
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--bg-input)', borderRadius: '12px' }}>
                <FiCheckCircle style={{ fontSize: '2.5rem', color: 'var(--brand-coral)' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', margin: '12px 0 6px' }}>Thank You!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We've received your message and will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUser /> Name</label>
                  <input
                    className="form-input-clean"
                    type="text"
                    placeholder="Enter your full name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMail /> Email</label>
                  <input
                    className="form-input-clean"
                    type="email"
                    placeholder="name@company.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMessageSquare /> Message</label>
                  <textarea
                    className="form-input-clean"
                    rows={3}
                    placeholder="Please describe how our team can help you..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button className="btn btn-dark btn-pill" type="submit" style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', gap: '6px' }}>
                  <FiSend /> Send Message
                </button>
              </form>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay-clean" onClick={onClose}>
      <div className="modal-clean" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <button className="modal-close-clean" onClick={onClose}>
          <FiX />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default InfoModal;
