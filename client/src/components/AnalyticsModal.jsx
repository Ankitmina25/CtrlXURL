import { useState, useEffect, useMemo, useCallback } from 'react';
import { urlAPI, buildShortUrl } from '../api';
import Loader from './Loader';
import toast from 'react-hot-toast';
import {
  FiBarChart2,
  FiMousePointer,
  FiHash,
  FiExternalLink,
  FiX,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiGlobe,
  FiCpu,
  FiClock,
  FiSearch,
  FiCopy,
  FiCheck,
  FiActivity,
  FiPieChart,
  FiLayers,
  FiRefreshCw,
} from 'react-icons/fi';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Unknown';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Unknown';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const getDistribution = (items, key, fallback = 'Unknown') => {
  if (!items || !items.length) return [];
  const counts = {};
  items.forEach((item) => {
    const rawVal = item[key];
    const val = rawVal && typeof rawVal === 'string' && rawVal.trim() ? rawVal.trim() : fallback;
    counts[val] = (counts[val] || 0) + 1;
  });
  const total = items.length;
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

const getDeviceIcon = (deviceStr) => {
  const d = (deviceStr || '').toLowerCase();
  if (d.includes('mobile') || d.includes('phone')) return <FiSmartphone />;
  if (d.includes('tablet') || d.includes('pad')) return <FiTablet />;
  return <FiMonitor />;
};

const getOsBadgeStyle = (osStr) => {
  const os = (osStr || '').toLowerCase();
  if (os.includes('mac') || os.includes('ios')) return { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' };
  if (os.includes('win')) return { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' };
  if (os.includes('android')) return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
  if (os.includes('linux')) return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
};

const getBrowserBadgeStyle = (browserStr) => {
  const b = (browserStr || '').toLowerCase();
  if (b.includes('chrome')) return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
  if (b.includes('safari')) return { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' };
  if (b.includes('firefox')) return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
  if (b.includes('edge')) return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  return { bg: '#faf5ff', text: '#6d28d9', border: '#e9d5ff' };
};

const AnalyticsModal = ({ urlId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'stream'
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all'); // 'all' | 'desktop' | 'mobile' | 'tablet'
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await urlAPI.analytics(urlId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load link statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [urlId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const shortUrl = data?.shortCode ? buildShortUrl(data.shortCode) : '';

  const handleCopyShortUrl = (e) => {
    e.stopPropagation();
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Short link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const clickHistory = useMemo(() => data?.clickHistory || [], [data?.clickHistory]);

  // Computed distributions
  const deviceDistribution = useMemo(() => getDistribution(clickHistory, 'device', 'Desktop'), [clickHistory]);
  const osDistribution = useMemo(() => getDistribution(clickHistory, 'os', 'Unknown OS'), [clickHistory]);
  const browserDistribution = useMemo(() => getDistribution(clickHistory, 'browser', 'Unknown Browser'), [clickHistory]);

  const latestClick = clickHistory.length > 0 ? clickHistory[0] : null;

  // Filtered click activity stream
  const filteredClicks = useMemo(() => {
    return clickHistory.filter((click) => {
      const deviceMatches =
        deviceFilter === 'all' ||
        (click.device || 'Desktop').toLowerCase().includes(deviceFilter);

      const term = searchTerm.trim().toLowerCase();
      if (!term) return deviceMatches;

      const ip = (click.ip || '').toLowerCase();
      const browser = (click.browser || '').toLowerCase();
      const os = (click.os || '').toLowerCase();
      const device = (click.device || '').toLowerCase();

      return deviceMatches && (ip.includes(term) || browser.includes(term) || os.includes(term) || device.includes(term));
    });
  }, [clickHistory, deviceFilter, searchTerm]);

  // Color palette for device multi-bar
  const deviceColors = ['#e05638', '#0284c7', '#10b981', '#8b5cf6'];

  return (
    <div className="modal-overlay-clean" onClick={onClose}>
      <div className="modal-clean modal-analytics" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-clean" onClick={onClose} aria-label="Close modal">
          <FiX />
        </button>

        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fetching live click analytics...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: '#d93838', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>{error}</p>
            <button className="btn btn-dark btn-sm btn-pill" onClick={() => fetchAnalytics(false)}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="modal-analytics-header">
              <div>
                <h3 className="modal-analytics-title">
                  <FiBarChart2 style={{ color: 'var(--brand-coral)' }} />
                  Link Analytics & Click Stream
                </h3>
                <p className="modal-analytics-subtitle">
                  Real-time device, browser, OS, and interaction intelligence
                </p>
              </div>

              <button
                onClick={() => fetchAnalytics(true)}
                className="btn btn-outline btn-sm btn-pill"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                title="Refresh analytics data"
                disabled={refreshing}
              >
                <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>

            {/* Destination URL Bar */}
            <div className="analytics-link-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <FiExternalLink style={{ color: 'var(--brand-coral)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                  Dest:
                </span>
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-dark)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={data.originalUrl}
                >
                  {data.originalUrl}
                </a>
              </div>

              <button
                onClick={handleCopyShortUrl}
                className="btn btn-coral btn-sm btn-pill"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '5px 12px', flexShrink: 0 }}
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? 'Copied' : `/${data.shortCode}`}
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="analytics-stat-grid">
              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  <FiMousePointer style={{ color: 'var(--brand-coral)' }} /> Total Clicks
                </span>
                <span className="analytics-stat-val" style={{ color: 'var(--brand-coral)' }}>
                  {data.clicks || 0}
                </span>
                <span className="analytics-stat-sub">Lifetime redirect hits</span>
              </div>

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  <FiHash style={{ color: '#0284c7' }} /> Short Code
                </span>
                <span className="analytics-stat-val" style={{ fontSize: '1.25rem' }}>
                  /{data.shortCode}
                </span>
                <span className="analytics-stat-sub">Vanity alias</span>
              </div>

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  <FiActivity style={{ color: '#10b981' }} /> Logged Visits
                </span>
                <span className="analytics-stat-val" style={{ color: '#10b981' }}>
                  {clickHistory.length}
                </span>
                <span className="analytics-stat-sub">Detailed stream records</span>
              </div>

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  <FiClock style={{ color: '#8b5cf6' }} /> Last Activity
                </span>
                <span className="analytics-stat-val" style={{ fontSize: '1.05rem', marginTop: '4px' }}>
                  {latestClick ? formatTimeAgo(latestClick.clickedAt) : 'No clicks'}
                </span>
                <span className="analytics-stat-sub">
                  {latestClick?.clickedAt ? new Date(latestClick.clickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting traffic'}
                </span>
              </div>
            </div>

            {/* View Tabs */}
            <div className="analytics-tabs">
              <button
                className={`analytics-tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                <FiPieChart /> Breakdown & Insights
              </button>

              <button
                className={`analytics-tab-btn ${activeTab === 'stream' ? 'active' : ''}`}
                onClick={() => setActiveTab('stream')}
              >
                <FiLayers /> Live Click Stream
                <span className="analytics-tab-count">{clickHistory.length}</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="analytics-body-scroll">
              {clickHistory.length === 0 ? (
                <div className="analytics-empty-state">
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--brand-coral-light)', color: 'var(--brand-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.5rem' }}>
                    <FiActivity />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    No Click Records Yet
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 16px' }}>
                    Share your short link to begin collecting real-time device, browser, operating system, and IP activity stream analytics!
                  </p>
                  <button onClick={handleCopyShortUrl} className="btn btn-coral btn-sm btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FiCopy /> Copy Short Link
                  </button>
                </div>
              ) : activeTab === 'insights' ? (
                /* Tab 1: Breakdown & Insights */
                <div className="distribution-grid">
                  {/* Device Breakdown */}
                  <div className="distribution-card distribution-card-full">
                    <div className="distribution-card-title">
                      <span>Device Types</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {clickHistory.length} total visits
                      </span>
                    </div>

                    {/* Multi-segmented bar */}
                    <div className="device-multi-bar">
                      {deviceDistribution.map((d, idx) => (
                        <div
                          key={d.name}
                          className="device-multi-segment"
                          style={{
                            width: `${d.percent}%`,
                            background: deviceColors[idx % deviceColors.length],
                          }}
                          title={`${d.name}: ${d.count} (${d.percent}%)`}
                        />
                      ))}
                    </div>

                    {/* Device distribution rows */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                      {deviceDistribution.map((d, idx) => (
                        <div
                          key={d.name}
                          style={{
                            background: '#ffffff',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: deviceColors[idx % deviceColors.length], fontSize: '1.1rem', display: 'flex' }}>
                              {getDeviceIcon(d.name)}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                              {d.name}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {d.percent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operating Systems Breakdown */}
                  <div className="distribution-card">
                    <div className="distribution-card-title">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCpu style={{ color: '#0284c7' }} /> Operating Systems
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {osDistribution.length} distinct
                      </span>
                    </div>

                    {osDistribution.map((os) => {
                      const badgeStyle = getOsBadgeStyle(os.name);
                      return (
                        <div key={os.name} style={{ marginBottom: '10px' }}>
                          <div className="distribution-item-row">
                            <span className="distribution-item-left">
                              <span
                                className="click-tag"
                                style={{ background: badgeStyle.bg, color: badgeStyle.text, borderColor: badgeStyle.border }}
                              >
                                {os.name}
                              </span>
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {os.count} ({os.percent}%)
                            </span>
                          </div>
                          <div className="distribution-bar-bg">
                            <div
                              className="distribution-bar-fill"
                              style={{ width: `${os.percent}%`, background: badgeStyle.text }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Browsers Breakdown */}
                  <div className="distribution-card">
                    <div className="distribution-card-title">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiGlobe style={{ color: '#ea580c' }} /> Browsers
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {browserDistribution.length} distinct
                      </span>
                    </div>

                    {browserDistribution.map((b) => {
                      const badgeStyle = getBrowserBadgeStyle(b.name);
                      return (
                        <div key={b.name} style={{ marginBottom: '10px' }}>
                          <div className="distribution-item-row">
                            <span className="distribution-item-left">
                              <span
                                className="click-tag"
                                style={{ background: badgeStyle.bg, color: badgeStyle.text, borderColor: badgeStyle.border }}
                              >
                                {b.name}
                              </span>
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {b.count} ({b.percent}%)
                            </span>
                          </div>
                          <div className="distribution-bar-bg">
                            <div
                              className="distribution-bar-fill"
                              style={{ width: `${b.percent}%`, background: badgeStyle.text }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Tab 2: Live Click Stream */
                <div>
                  {/* Stream Filter & Search Controls */}
                  <div className="stream-controls">
                    <div className="stream-search">
                      <FiSearch style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Filter by IP, browser, or OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                        >
                          <FiX />
                        </button>
                      )}
                    </div>

                    <div className="stream-filter-pills">
                      {['all', 'desktop', 'mobile', 'tablet'].map((dev) => (
                        <button
                          key={dev}
                          className={`stream-filter-btn ${deviceFilter === dev ? 'active' : ''}`}
                          onClick={() => setDeviceFilter(dev)}
                        >
                          {dev === 'all' ? 'All Devices' : dev.charAt(0).toUpperCase() + dev.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered list */}
                  {filteredClicks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No click records match your current filter.
                      <div style={{ marginTop: '10px' }}>
                        <button
                          className="btn btn-outline btn-sm btn-pill"
                          onClick={() => { setSearchTerm(''); setDeviceFilter('all'); }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="click-stream-list">
                      {filteredClicks.map((click, index) => {
                        const osStyle = getOsBadgeStyle(click.os);
                        const browserStyle = getBrowserBadgeStyle(click.browser);
                        const deviceName = click.device || 'Desktop';
                        const clickedTime = click.clickedAt ? new Date(click.clickedAt) : null;

                        return (
                          <div className="click-stream-item" key={click._id || index}>
                            <div className="click-stream-left">
                              <div className="click-device-avatar" title={`Device: ${deviceName}`}>
                                {getDeviceIcon(deviceName)}
                              </div>

                              <div className="click-details">
                                <div className="click-badges">
                                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                                    {deviceName}
                                  </span>

                                  <span
                                    className="click-tag"
                                    style={{ background: osStyle.bg, color: osStyle.text, borderColor: osStyle.border }}
                                  >
                                    <FiCpu /> {click.os || 'Unknown OS'}
                                  </span>

                                  <span
                                    className="click-tag"
                                    style={{ background: browserStyle.bg, color: browserStyle.text, borderColor: browserStyle.border }}
                                  >
                                    <FiGlobe /> {click.browser || 'Unknown'}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                  <span className="click-ip-text">IP: {click.ip || 'Unknown IP'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="click-stream-right">
                              <span className="click-relative-time">
                                {formatTimeAgo(click.clickedAt)}
                              </span>
                              <span className="click-exact-time">
                                {clickedTime ? clickedTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
