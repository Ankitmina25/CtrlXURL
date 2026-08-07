import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FiX, FiWifi, FiSmartphone, FiMaximize } from 'react-icons/fi';
import { buildShortUrl } from '../api';

const QrModal = ({ url, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // If the URL object already has a pre-generated qrCode (from create form), use it.
  // Otherwise, fallback to generating one on the fly using a public API.
  const shortUrl = buildShortUrl(url.shortCode);
  const [qrCodeSrc, setQrCodeSrc] = useState(url.qrCode || '');

  let brandName = '';
  try {
    const host = new URL(url.originalUrl).hostname.replace(/^www\./, '');
    const namePart = host.split('.')[0];
    brandName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  } catch (e) {
    brandName = 'Link';
  }

  useEffect(() => {
    if (!url.qrCode) {
      QRCode.toDataURL(shortUrl, { width: 160, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setQrCodeSrc(url))
        .catch(err => console.error(err));
    }
  }, [shortUrl, url.qrCode]);

  const handleScan = (e) => {
    e.stopPropagation();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      window.open(shortUrl, '_blank');
    }, 1500);
  };

  const handleNfc = (e) => {
    e.stopPropagation();
    // No QR laser animation for NFC, just open the link after a tiny delay
    setTimeout(() => {
      window.open(shortUrl, '_blank');
    }, 400);
  };

  return (
    <div className="modal-overlay-clean" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '280px', height: '400px' }}>
        <button 
          className="modal-close-clean" 
          onClick={onClose}
          style={{ position: 'absolute', top: '-40px', right: '0', background: '#fff', borderRadius: '50%', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FiX size={20} />
        </button>

        <div className={`qr-flip-container ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)} style={{ margin: 0, width: '100%', height: '100%' }}>
          <div className="qr-flip-card">
            <div className="qr-flip-front">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'auto', opacity: 0.5 }}>
                <FiWifi style={{ fontSize: '2rem' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', marginTop: '4px' }}>NFC</span>
              </div>
              
              <div className="stars" style={{ color: '#ffd700', fontSize: '1.6rem', letterSpacing: '6px', marginBottom: '30px' }}>★★★★★</div>
              
              <div className="logo-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                <img src={`https://www.google.com/s2/favicons?domain=${new URL(url.originalUrl).hostname}&sz=128`} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
              </div>
              
              <div className="cta-text" style={{ marginTop: 'auto', opacity: 0 }}>
                -
              </div>
            </div>
            
            <div className="qr-flip-back">
              <div style={{ color: 'var(--brand-coral)', fontWeight: 800, fontSize: '1.2rem', margin: '12px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brandName}</div>
              <div style={{ color: '#ffd700', fontSize: '0.9rem', marginBottom: '6px' }}>★★★★★</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>Scan to Open Link</h3>
              <p style={{ fontSize: '0.75rem', marginBottom: '16px' }}>Share yer link instantly</p>
              
              <div className="qr-code-wrapper">
                <img src={qrCodeSrc} alt="QR Code" />
                {isScanning && <div className="scan-laser"></div>}
              </div>
              
              <div className="scan-instructions">
                <div className="scan-item" onClick={handleNfc}>
                  <FiSmartphone style={{ fontSize: '1.4rem' }} />
                  <span>Tap NFC</span>
                </div>
                <div style={{ opacity: 0.3 }}>|</div>
                <div className="scan-item" onClick={handleScan}>
                  <FiMaximize style={{ fontSize: '1.4rem' }} />
                  <span>Scan QR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrModal;
