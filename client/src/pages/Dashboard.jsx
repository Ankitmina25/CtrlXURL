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
import { FiArrowLeft, FiLink, FiMousePointer, FiCheckCircle, FiClock, FiSearch, FiGithub, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi';

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
  const dashboardRef = useRef(null);

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
    if (dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
      <main className="mint-wrapper" ref={dashboardRef}>
        {/* Back to Home Button & Dashboard Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px' }}>
          <Link to="/" className="btn btn-outline btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiArrowLeft /> Back to Home
          </Link>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            Dashboard Overview
          </span>
        </div>

        <CreateUrlForm onCreated={handleCreated} />

        {/* Real Live Stat Cards from Server API */}
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

        {/* Search bar for URLs */}
        <div style={{ maxWidth: '1000px', margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            Your Shortened Links
          </h3>

          <div className="shortener-input-group" style={{ maxWidth: '300px', padding: '8px 14px' }}>
            <FiSearch className="input-icon" />
            <input
              className="shortener-input"
              type="text"
              placeholder="Search by code or URL..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* URL List */}
        {initialLoading ? (
          <Loader />
        ) : urls.length === 0 ? (
          <div className="empty-clean">
            <h4>No shortened links found</h4>
            <p>{searchTerm ? 'No links match your search query.' : 'Paste a long URL in the form above to create your first short link!'}</p>
          </div>
        ) : (
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

            {/* Dynamic Pagination Controls from Server totalPages */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
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
          </div>
        )}
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
