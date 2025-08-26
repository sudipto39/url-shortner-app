import React, { useState } from 'react';

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminUrlsCount, setAdminUrlsCount] = useState(null);
  const [adminUrls, setAdminUrls] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/urls/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Something went wrong');
      } else {
        setShortUrl(data.shortUrl);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminMsg('');
    setAdminLoading(true);
    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminMsg(data.message || data.error || 'Login failed');
        setAdminToken('');
      } else {
        const token = data.token || '';
        setAdminToken(token);
        setAdminMsg('Logged in as admin.');
        // clear sensitive inputs after successful login
        setAdminEmail('');
        setAdminPassword('');
      }
    } catch (err) {
      setAdminMsg('Network error');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setAdminUrls([]);
    setAdminUrlsCount(null);
    setAdminMsg('Logged out.');
  };

  const handleFetchAdminUrls = async () => {
    setAdminMsg('');
    setAdminUrlsCount(null);
    setAdminUrls([]);
    const token = adminToken; // require explicit login in current session
    try {
      const res = await fetch('/api/v1/admin/urls', {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminMsg(data.message || data.error || 'Failed to fetch URLs');
      } else {
        const urls = (data.data && data.data.urls) || [];
        setAdminUrls(urls);
        const count = data.results || urls.length;
        setAdminUrlsCount(count);
        setAdminMsg(`Fetched ${count} URLs`);
      }
    } catch (err) {
      setAdminMsg('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter long URL (include http:// or https://)"
          value={originalUrl}
          onChange={e => setOriginalUrl(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
          required
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {shortUrl && (
        <div style={{ marginTop: 16 }}>
          <strong>Short URL:</strong> <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
        </div>
      )}

      <hr style={{ margin: '24px 0' }} />
      <button onClick={() => setShowAdmin(s => !s)} style={{ padding: 8 }}>
        {showAdmin ? 'Hide Admin' : 'Admin Login'}
      </button>

      {showAdmin && (
        <div style={{ marginTop: 16 }}>
          <h3>Admin</h3>
          <form onSubmit={handleAdminLogin}>
            <input
              type="email"
              placeholder="Admin email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
              required
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={adminLoading} style={{ flex: 1, padding: 10 }}>
                {adminLoading ? 'Logging in...' : 'Login as Admin'}
              </button>
              <button type="button" onClick={handleAdminLogout} style={{ padding: 10 }} disabled={!adminToken}>
                Logout
              </button>
            </div>
          </form>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleFetchAdminUrls} style={{ padding: 8 }} disabled={!adminToken}>
              View All URLs (Admin)
            </button>
            {adminUrlsCount !== null && (
              <div style={{ marginTop: 8 }}>
                URLs count: {adminUrlsCount}
              </div>
            )}
          </div>

          {adminUrls.length > 0 && (
            <div style={{ marginTop: 12, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Short URL</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Original URL</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px' }}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUrls.map((u) => {
                    const shortHref = `${window.location.protocol}//${window.location.host}/${u.shortCode}`;
                    return (
                      <tr key={u._id}>
                        <td style={{ borderBottom: '1px solid #f1f1f1', padding: '8px' }}>
                          <a href={shortHref} target="_blank" rel="noreferrer">{shortHref}</a>
                        </td>
                        <td style={{ borderBottom: '1px solid #f1f1f1', padding: '8px', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.originalUrl}>
                          {u.originalUrl}
                        </td>
                        <td style={{ borderBottom: '1px solid #f1f1f1', padding: '8px', textAlign: 'right' }}>{u.visitCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {adminMsg && <div style={{ marginTop: 12 }}>{adminMsg}</div>}
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
