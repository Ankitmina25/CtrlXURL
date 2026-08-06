import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiMail, FiUser, FiMessageSquare, FiSend, FiHelpCircle, FiCheckCircle, FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiMessageCircle } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current.forEach((card) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, scale: 0.95, rotateX: 4 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Message sent! Our support team will get back to you shortly.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="reveal-wrapper">
        <section
          className="reveal-card reveal-card-hero"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          <div className="landing-badge" style={{ background: '#fbece8', color: '#e05638', border: '1px solid #f9d8cf', margin: '0 auto 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700 }}>
            <FiMessageCircle /> Get In Touch
          </div>

          <h1 className="hero-title">
            We'd Love to <span className="highlight-box">Hear</span> From You
          </h1>

          <p className="hero-subtitle">
            Have a question about CtrlXURL, feature requests, or technical support? Our team is ready 24/7 to assist.
          </p>

          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'left' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8faf9', borderRadius: '24px', border: '1px solid #e2ebe7' }}>
                <FiCheckCircle style={{ fontSize: '3.5rem', color: 'var(--brand-coral)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: '16px 0 8px', fontSize: '1.5rem' }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. We will respond to {formData.email} within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e2ebe7', padding: '36px', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUser /> Your Name</label>
                  <input
                    className="form-input-clean"
                    type="text"
                    placeholder="Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMail /> Email Address</label>
                  <input
                    className="form-input-clean"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiHelpCircle /> Subject</label>
                  <input
                    className="form-input-clean"
                    type="text"
                    placeholder="Question regarding custom domains..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <label className="form-label-clean" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMessageSquare /> Message</label>
                  <textarea
                    className="form-input-clean"
                    rows={4}
                    placeholder="Type yer message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button className="btn btn-dark btn-pill" type="submit" style={{ width: '100%', marginTop: '12px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', gap: '6px' }}>
                  <FiSend /> Send Message
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Section 2: Quick FAQ */}
        <section
          className="reveal-card reveal-card-white"
          ref={(el) => (cardsRef.current[1] = el)}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                Is CtrlXURL completely free to use?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Yes! You can shorten unlimited links, generate QR codes, and track real-time click statistics for free.
              </p>
            </div>

            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                How do link expiration dates work?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                When creating a link, set an optional expiration timestamp. Once the date passes, visitors will see an expired link notice.
              </p>
            </div>

            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                Can I edit or delete my shortened links?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Yes! Log into yer CtrlXURL dashboard at any time to delete links or inspect detailed statistics.
              </p>
            </div>

            <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1px solid #e2ebe7' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                How fast is link redirection?
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Our edge network redirects requests in under 20 milliseconds worldwide for maximum performance.
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
          <FiGithub />
          <FiTwitter />
          <FiLinkedin />
          <FiGlobe />
        </div>
      </footer>
    </div>
  );
};

export default Contact;
