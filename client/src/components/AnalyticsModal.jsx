import { useState, useEffect } from 'react';
import { urlAPI } from '../api';
import Loader from './Loader';
import { FiBarChart2, FiMousePointer, FiHash, FiExternalLink, FiX } from 'react-icons/fi';

const AnalyticsModal = ({ urlId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await urlAPI.analytics(urlId);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [urlId]);

  return (
    <div className="modal-overlay-clean" onClick={onClose}>
      <div className="modal-clean" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-clean" onClick={onClose}>
          <FiX />
        </button>

        {loading ? (
          <Loader />
        ) : error ? (
          <p style={{ color: '#d93838', textAlign: 'center' }}>{error}</p>
        ) : (
          <>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBarChart2 style={{ color: 'var(--brand-coral)' }} /> Link Statistics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '12px', border: '1px solid #e2ebe7' }}>
                <span style={{ fontSize: '0.8rem', color: '#74837f', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiMousePointer /> Total Clicks
                </span>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#e05638', fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                  {data.clicks}
                </h2>
              </div>
              <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '12px', border: '1px solid #e2ebe7' }}>
                <span style={{ fontSize: '0.8rem', color: '#74837f', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiHash /> Short Code
                </span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginTop: '8px', color: '#121619' }}>
                  {data.shortCode}
                </p>
              </div>
            </div>

            <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '12px', border: '1px solid #e2ebe7', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#74837f', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiExternalLink /> Destination URL
              </span>
              <p style={{ fontSize: '0.88rem', color: '#3d4946', wordBreak: 'break-all', marginTop: '6px' }}>
                {data.originalUrl}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
