import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiLink, FiMousePointer, FiCopy, FiBarChart2, FiShare2, FiTrash2, FiMaximize } from 'react-icons/fi';
import { buildShortUrl } from '../api';

const UrlCard = ({ url, onDelete, onAnalytics, onQrCode }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const shortUrl = buildShortUrl(url.shortCode);

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `Link / ${url.shortCode}`,
        url: shortUrl,
      }).catch(() => { });
    } else {
      copyToClipboard(e, shortUrl);
    }
  };

  const isExpired = url.expiryDate && new Date(url.expiryDate) <= new Date();

  // Extract hostname from original URL for favicon
  let hostname = '';
  try {
    hostname = new URL(url.originalUrl).hostname;
  } catch (e) {
    // fallback if originalUrl is not a valid URL object
    hostname = url.originalUrl;
  }
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  return (
    <div
      className={`url-flip-container ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ opacity: isExpired ? 0.7 : 1 }}
    >
      <div className="url-flip-card">
        {/* FRONT OF CARD */}
        <div className="url-flip-front">
          <div style={{ color: '#ffd700', fontSize: '1.2rem', marginBottom: 'auto', display: 'flex', justifyContent: 'center', gap: '2px' }}>
            ★ ★ ★ ★ ★
          </div>
          
          <div style={{ width: '90px', height: '90px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={faviconUrl} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>
          
          <div style={{ marginTop: 'auto', textAlign: 'center', width: '100%', wordBreak: 'break-word' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>redirects to</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 800 }}>
              {hostname}
            </h3>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="url-flip-back">
          <div className="url-flip-back-header">
            <div className="url-flip-back-title">/{url.shortCode}</div>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="url-flip-back-subtitle"
              onClick={(e) => e.stopPropagation()}
            >
              {shortUrl}
            </a>
            {isExpired && <span style={{ color: '#d93838', fontSize: '0.75rem', marginTop: '4px' }}>(Expired)</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <FiMousePointer style={{ color: 'var(--brand-coral)' }} />
            <strong>{url.clicks || 0}</strong> clicks
          </div>

          <div className="url-flip-back-actions">
            <button
              onClick={(e) => copyToClipboard(e, shortUrl)}
              className="action-btn"
              title="Copy Link"
            >
              <FiCopy /> Copy
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onQrCode(url); }}
              className="action-btn"
              title="QR Code"
            >
              <FiMaximize /> QR Code
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onAnalytics(url._id); }}
              className="action-btn"
              title="View Statistics"
            >
              <FiBarChart2 /> Stats
            </button>

            <button
              onClick={handleShare}
              className="action-btn"
              title="Share Link"
            >
              <FiShare2 /> Share
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(url._id); }}
              className="action-btn delete"
              title="Delete Link"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlCard;
