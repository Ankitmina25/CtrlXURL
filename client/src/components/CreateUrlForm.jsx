import { useState } from 'react';
import { urlAPI } from '../api';
import toast from 'react-hot-toast';
import { FiLink, FiEdit3, FiScissors, FiCopy, FiDownload, FiCalendar, FiChevronDown, FiChevronUp, FiWifi, FiSmartphone, FiMaximize } from 'react-icons/fi';

const CreateUrlForm = ({ onCreated }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    if (customCode.trim()) {
      const code = customCode.trim().toLowerCase();
      if (code.length < 3 || code.length > 10) {
        return toast.error('Custom code must be between 3 and 10 characters');
      }
      if (!/^[a-z0-9-]{3,10}$/.test(code)) {
        return toast.error('Custom code can only contain lowercase letters, numbers, and hyphens');
      }
    }

    setLoading(true);
    try {
      const res = await urlAPI.create({
        originalUrl: originalUrl.trim(),
        customCode: customCode.trim() || undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      });

      setResult({
        shortUrl: res.shortUrl,
        qrCode: res.qrCode,
        originalUrl: res.data?.originalUrl || originalUrl,
        shortCode: res.data?.shortCode,
      });

      setOriginalUrl('');
      setCustomCode('');
      setExpiryDate('');
      toast.success('Short URL created successfully!');
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleScan = (e) => {
    e.stopPropagation();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      window.open(result.shortUrl, '_blank');
    }, 1500);
  };

  return (
    <div className="hero-card">
      <h1 className="hero-title">
        Create Your <span className="highlight-box">Short</span> Link
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="shortener-box">
          <div className="shortener-input-group">
            <FiLink className="input-icon" />
            <input
              className="shortener-input"
              type="url"
              placeholder="Paste long url to shorten it"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          <div className="shortener-input-group" style={{ flex: '0.5' }}>
            <FiEdit3 className="input-icon" />
            <input
              className="shortener-input"
              type="text"
              placeholder="Custom Code (3-10 chars)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>

          <button className="btn btn-dark btn-pill" type="submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiScissors /> {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiCalendar /> {showAdvanced ? 'Hide Expiry Date Option' : '+ Add Expiration Date'} {showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: '12px', maxWidth: '320px', margin: '12px auto 0' }}>
            <div className="form-group-clean">
              <label className="form-label-clean" style={{ fontSize: '0.8rem' }}>Expiry Date & Time</label>
              <input
                className="form-input-clean"
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        )}
      </form>

      {result && (
        <>
          <div className="shortened-result">
            <div className="result-info">
              <span className="result-title">Code: {result.shortCode}</span>
              <span className="result-url">Destination: {result.originalUrl}</span>
              <span className="result-short-link">{result.shortUrl}</span>
            </div>

            <div className="result-actions">
              <button
                onClick={() => copyToClipboard(result.shortUrl)}
                className="action-btn"
              >
                <FiCopy /> Copy
              </button>
              {result.qrCode && (
                <a
                  href={result.qrCode}
                  download={`qr-${result.shortCode}.png`}
                  className="action-btn"
                >
                  <FiDownload /> Save QR
                </a>
              )}
            </div>
          </div>

          {result.qrCode && (
            <div className={`qr-flip-container ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
              <div className="qr-flip-card">
                <div className="qr-flip-front">
                  <FiWifi style={{ fontSize: '2rem', opacity: 0.5, marginBottom: 'auto' }} />
                  <div className="stars">★★★★★</div>
                  <div className="logo-area" style={{ color: 'var(--brand-coral)' }}>
                    CtrlXURL
                  </div>
                  <div className="cta-text" style={{ marginTop: 'auto' }}>
                    Share your short link<br />in a snap
                  </div>
                </div>

                <div className="qr-flip-back">
                  <div style={{ color: 'var(--brand-coral)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px' }}>CtrlXURL</div>
                  <div style={{ color: '#ffd700', fontSize: '0.9rem', marginBottom: '6px' }}>★★★★★</div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>Scan to Open Link</h3>
                  <p style={{ fontSize: '0.75rem', marginBottom: '16px' }}>Share yer link instantly</p>

                  <div className="qr-code-wrapper">
                    <img src={result.qrCode} alt="QR Code" />
                    {isScanning && <div className="scan-laser"></div>}
                  </div>

                  <div className="scan-instructions">
                    <div className="scan-item" onClick={handleScan}>
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
          )}
        </>
      )}
    </div>
  );
};

export default CreateUrlForm;
