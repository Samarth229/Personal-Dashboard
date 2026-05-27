const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em' }}>
      {title}
    </h2>
    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.8 }}>
      {children}
    </div>
  </div>
);

const PrivacyPolicyPage = () => {
  const lastUpdated = 'May 2026';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '60px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            ← Back to app
          </a>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <Section title="Overview">
          <p>
            Personal Dashboard ("the app") is a self-hosted personal productivity tool that connects to
            third-party services — including Spotify, Google, GitHub, Steam, Riot Games, and Letterboxd —
            to display your personal data in one place. This policy explains what data is collected,
            how it is used, and how it is stored.
          </p>
        </Section>

        <Section title="Who This App Is For">
          <p>
            Personal Dashboard is designed for individual personal use. Users sign in with their own
            Google account and connect their own third-party service accounts. The app does not collect,
            share, or sell data to any third parties.
          </p>
        </Section>

        <Section title="Data We Collect">
          <p style={{ marginBottom: 12 }}>When you use Personal Dashboard, the following data is collected and stored locally in the app's database:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>Google account:</strong> Your email address, first name, and last name — used to create and identify your account.</li>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>Gmail:</strong> Email metadata (sender, subject, date, unread status) — used to display your inbox summary. Message body is not stored.</li>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>Spotify:</strong> Top artists, top tracks, and recently played tracks from your Spotify account.</li>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>GitHub:</strong> Public repository data, commit activity, and contribution history from your GitHub profile.</li>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>Steam:</strong> Your Steam display name, game library, and recently played games.</li>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>Riot Games:</strong> Your summoner name and match history from Riot's public API.</li>
            <li><strong style={{ color: 'rgba(255,255,255,0.9)' }}>Letterboxd:</strong> Your recently logged films and ratings from your public Letterboxd profile.</li>
          </ul>
        </Section>

        <Section title="How We Use Your Data">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>To display your personal data on your dashboard</li>
            <li>To authenticate you via Google OAuth</li>
            <li>To sync and cache data from connected services so the dashboard loads quickly</li>
            <li>Your data is never sold, shared, or used for advertising</li>
            <li>Your data is never sent to any third party other than the services you explicitly connect</li>
          </ul>
        </Section>

        <Section title="Data Storage">
          <p>
            All data is stored in a local SQLite database on the server running Personal Dashboard.
            OAuth access tokens for connected services (Spotify, Gmail, GitHub) are stored encrypted
            and are only used to fetch your data from those services. Refresh tokens are stored
            securely and used only to renew access when tokens expire.
          </p>
        </Section>

        <Section title="Third-Party Services">
          <p style={{ marginBottom: 12 }}>
            Personal Dashboard connects to the following third-party APIs. By connecting a service,
            you agree to that service's own privacy policy:
          </p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Google Privacy Policy</a></li>
            <li><a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Spotify Privacy Policy</a></li>
            <li><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>GitHub Privacy Policy</a></li>
            <li><a href="https://store.steampowered.com/privacy_agreement/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Steam Privacy Policy</a></li>
            <li><a href="https://www.riotgames.com/en/privacy-notice" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Riot Games Privacy Policy</a></li>
            <li><a href="https://letterboxd.com/legal/privacy-policy/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Letterboxd Privacy Policy</a></li>
          </ul>
        </Section>

        <Section title="Data Deletion">
          <p>
            You can disconnect any service at any time from the Settings page, which removes
            the stored access tokens and cached data for that service. To delete your account
            and all associated data, contact the app administrator.
          </p>
        </Section>

        <Section title="Cookies & Tracking">
          <p>
            Personal Dashboard does not use cookies for tracking or advertising. A JWT token
            is stored in your browser's local storage solely to keep you signed in between sessions.
            No analytics, tracking pixels, or third-party scripts are used.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            This privacy policy may be updated from time to time. The "last updated" date at the
            top of this page will reflect any changes. Continued use of the app after changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have any questions about this privacy policy or how your data is handled,
            please contact: <a href="mailto:samarthk292@gmail.com" style={{ color: '#60a5fa' }}>samarthk292@gmail.com</a>
          </p>
        </Section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, marginTop: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center' }}>
            © {new Date().getFullYear()} Personal Dashboard. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
