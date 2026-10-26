import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { urlAPI } from '../api';
import CreateUrlForm from '../components/CreateUrlForm';
import UrlCard from '../components/UrlCard';
import AnalyticsModal from '../components/AnalyticsModal';
import InfoModal from '../components/InfoModal';
import QrModal from '../components/QrModal';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiArrowLeft,
  FiLink,
  FiMousePointer,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiLayers,
  FiX,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiGlobe,
} from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState({ totalUrls: 0, activeUrls: 0, expiredUrls: 0, totalClicks: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [analyticsId, setAnalyticsId] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Pagination & Search state matching server query parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const cardsRef = useRef([]);

  const fetchStats = async () => {
    try {
      const data = await urlAPI.getStats();
      setStats(data);
    } catch {
      // Fallback
    }
  };

  const fetchUrls = useCallback(async (page = 1, search = '') => {
    try {
      const data = await urlAPI.getAll(page, search);
      setUrls(data.urls || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch {
      setUrls([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUrls(1, searchTerm);
  }, [fetchUrls, searchTerm]);

  useEffect(() => {
    if (cardsRef.current[0]) {
      gsap.fromTo(
        cardsRef.current[0],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }

    if (cardsRef.current[1]) {
      gsap.fromTo(
        cardsRef.current[1],
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current[1],
            start: 'top 88%',
            once: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUrls(newPage, searchTerm);
    }
  };

  const handleCreated = () => {
    fetchStats();
    fetchUrls(1, searchTerm);
  };

  const handleDelete = async (id) => {
    try {
      await urlAPI.delete(id);
      toast.success('Link deleted successfully!');
      fetchStats();
      fetchUrls(currentPage, searchTerm);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="reveal-wrapper">
        {/* FRAME 1: Top Dashboard Section (Control & Metrics) */}
        <section
          className="reveal-card dashboard-hero-card"
          ref={(el) => (cardsRef.current[0] = el)}
        >
          {/* Top Bar: Navigation & Overview Badge */}
          <div className="dashboard-top-bar">
            <Link to="/" className="btn btn-outline btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiArrowLeft /> Back to Home
            </Link>
            <div
              className="landing-badge"
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <FiLayers /> Dashboard Overview
            </div>
          </div>

          {/* Compact Create URL Form */}
          <CreateUrlForm onCreated={handleCreated} />

          {/* Real Live Stat Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon"><FiLink /></div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalUrls || 0}</span>
                <span className="stat-label">Total Links</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiMousePointer /></div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalClicks || 0}</span>
                <span className="stat-label">Total Clicks</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiCheckCircle /></div>
              <div className="stat-content">
                <span className="stat-number">{stats.activeUrls || 0}</span>
                <span className="stat-label">Active Links</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiClock /></div>
              <div className="stat-content">
                <span className="stat-number">{stats.expiredUrls || 0}</span>
                <span className="stat-label">Expired Links</span>
              </div>
            </div>
          </div>
        </section>

        {/* FRAME 2: Dedicated Links Catalog Section (Below on the new section) */}
        <section
          className="reveal-card dashboard-links-card"
          ref={(el) => (cardsRef.current[1] = el)}
        >
          <div className="dashboard-links-header">
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
                  marginBottom: '8px',
                }}
              >
                <FiLink /> Link Management
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 6px' }}>
                Your Shortened Links
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
                Manage your vanity links, inspect live click analytics, and download high-resolution QR codes.
              </p>
            </div>

            <div className="dashboard-search-bar">
              <FiSearch style={{ color: 'var(--text-muted)', fontSize: '1.1rem', flexShrink: 0 }} />
              <input
                className="shortener-input"
                type="text"
                placeholder="Search by code or destination URL..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {/* URL List or Empty State */}
          {initialLoading ? (
            <Loader />
          ) : urls.length === 0 ? (
            <div className="empty-clean" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-input)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-coral)', fontSize: '1.8rem', marginBottom: '16px' }}>
                <FiLink />
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                No shortened links found
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '400px', margin: '0 auto' }}>
                {searchTerm ? 'No links match your search query. Try searching for a different keyword.' : 'Paste a long URL in the form above to generate your first trackable short link!'}
              </p>
            </div>
          ) : (
            <>
              <div className="urls-container">
                {urls.map((url) => (
                  <UrlCard
                    key={url._id}
                    url={url}
                    onDelete={handleDelete}
                    onAnalytics={setAnalyticsId}
                    onQrCode={setQrUrl}
                  />
                ))}
              </div>

              {/* Dynamic Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-wrapper" style={{ marginTop: '36px' }}>
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
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

      {analyticsId && (
        <AnalyticsModal urlId={analyticsId} onClose={() => setAnalyticsId(null)} />
      )}

      {qrUrl && (
        <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />
      )}

      {modalType && (
        <InfoModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
};

export default Dashboard;
