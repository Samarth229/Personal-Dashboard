import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../services/authAPI';
import { SERVICE_COLORS } from '../../utils/colors';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: GridIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

const SERVICE_ITEMS = [
  { path: '/spotify',    label: 'Spotify',    icon: SpotifyIcon,  color: SERVICE_COLORS.spotify },
  { path: '/github',     label: 'GitHub',     icon: GitHubIcon,   color: SERVICE_COLORS.github },
  { path: '/gmail',      label: 'Gmail',      icon: MailIcon,     color: SERVICE_COLORS.gmail },
  { path: '/letterboxd', label: 'Letterboxd', icon: FilmIcon,     color: SERVICE_COLORS.letterboxd },
  { path: '/steam',      label: 'Steam',      icon: GamepadIcon,  color: SERVICE_COLORS.steam },
  { path: '/riot',       label: 'Riot Games', icon: SwordIcon,    color: SERVICE_COLORS.riot },
];

const Sidebar = ({ sources = [] }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout: logoutUser } = useAuth();

  const isActive    = (path) => location.pathname === path;
  const isConnected = (id)   => sources.find((s) => s.source_name === id)?.is_enabled;

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutUser();
    navigate('/login');
  };

  return (
    <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0071e3, #34aadc)', boxShadow: '0 4px 12px rgba(0,113,227,0.4)' }}>
          <GridIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
          Personal Hub
        </span>
      </div>

      <div className="px-3 flex-1">
        {/* Main nav */}
        <div className="mb-5">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path}
                className="flex items-center gap-3 px-4 py-2.5 mb-0.5 text-sm font-medium transition-all duration-150 cursor-pointer"
                style={{
                  borderRadius: 980,
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Services */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest px-4 mb-2"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Services
          </p>
          {SERVICE_ITEMS.map(({ path, label, icon: Icon, color }) => {
            const active    = isActive(path);
            const connected = isConnected(path.slice(1));
            return (
              <Link key={path} to={path}
                className="flex items-center gap-3 px-4 py-2.5 mb-0.5 text-sm font-medium transition-all duration-150 cursor-pointer"
                style={{
                  borderRadius: 980,
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: active ? color.bg : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${active ? color.border : 'transparent'}`,
                  }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: active ? color.text : 'rgba(255,255,255,0.4)' }} />
                </div>
                <span className="flex-1">{label}</span>
                {connected && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color.primary }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0071e3, #34aadc)' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Sign out" className="flex-shrink-0 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            <LogoutIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ─── Icons ─── */
function GridIcon({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>;
}
function SettingsIcon({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function SpotifyIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>;
}
function GitHubIcon({ className, style }) {
  return <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>;
}
function MailIcon({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function FilmIcon({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>;
}
function GamepadIcon({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V8a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1z" /></svg>;
}
function SwordIcon({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>;
}
function LogoutIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}

export default Sidebar;
