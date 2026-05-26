import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { fmtRelative } from '../../utils/formatters';

const SOURCE_META = {
  spotify: {
    label: 'Spotify',
    desc: 'Music — top artists, tracks, recently played',
    icon: (
      <svg className="w-5 h-5" style={{ color: '#1DB954' }} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
    iconBg: 'rgba(29,185,84,0.1)',
    iconBorder: 'rgba(29,185,84,0.2)',
    changeType: 'oauth',
  },
  github: {
    label: 'GitHub',
    desc: 'Code activity — repos, commits, languages',
    icon: (
      <svg className="w-5 h-5" style={{ color: '#6e40c9' }} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    iconBg: 'rgba(110,64,201,0.1)',
    iconBorder: 'rgba(110,64,201,0.2)',
  },
  gmail: {
    label: 'Gmail',
    desc: 'Email — unread count, inbox stats, top senders',
    icon: (
      <svg className="w-5 h-5" style={{ color: '#ea4335' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    iconBg: 'rgba(234,67,53,0.1)',
    iconBorder: 'rgba(234,67,53,0.2)',
  },
  letterboxd: {
    label: 'Letterboxd',
    desc: 'Movies — diary, ratings, recent watches',
    icon: <span className="text-lg leading-none">🎬</span>,
    iconBg: 'rgba(255,128,0,0.1)',
    iconBorder: 'rgba(255,128,0,0.2)',
    connectType: 'page',
    connectPath: '/letterboxd',
  },
  steam: {
    label: 'Steam',
    desc: 'Gaming — library, playtime, recent games',
    icon: <span className="text-lg leading-none">🎮</span>,
    iconBg: 'rgba(102,192,244,0.1)',
    iconBorder: 'rgba(102,192,244,0.2)',
    connectType: 'page',
    connectPath: '/steam',
    changeType: 'steamid',
    changePlaceholder: '76561198000000000',
    changeLabel: 'New Steam64 ID (17-digit number)',
  },
  riot: {
    label: 'Riot Games',
    desc: 'League of Legends — rank, match history, KDA',
    icon: <span className="text-lg leading-none">⚔️</span>,
    iconBg: 'rgba(200,155,60,0.1)',
    iconBorder: 'rgba(200,155,60,0.2)',
    connectType: 'page',
    connectPath: '/riot',
    changeType: 'riotid',
    changePlaceholder: 'GameName#TAG',
    changeLabel: 'New Riot ID (e.g. GameName#TAG)',
  },
};

const InlineChangePanel = ({ metaKey, meta, onClose, onSaved }) => {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (metaKey === 'spotify') return api.get('/spotify/auth?reauth=true').then(r => { window.location.href = r.data.url; });
      if (metaKey === 'steam')   return api.post('/steam/connect', { steamId: value });
      if (metaKey === 'riot')    return api.post('/riot/connect', { summonerName: value });
    },
    onSuccess: () => {
      if (metaKey !== 'spotify') {
        setSaved(true);
        onSaved();
        setTimeout(() => { setSaved(false); onClose(); }, 1800);
      }
    },
  });

  const isValid = metaKey === 'spotify' ? true
    : metaKey === 'steam' ? value.length === 17
    : value.includes('#') && value.length >= 3;

  return (
    <div style={{
      marginTop: 12,
      background: 'rgba(0,0,0,0.25)',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '14px 14px 12px',
    }}>
      {metaKey === 'spotify' && (
        <>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'rgba(29,185,84,0.2)',
              border: '1px solid rgba(29,185,84,0.4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#1DB954',
            }}>1</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, marginBottom: 3 }}>
                Log out of Spotify
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 }}>
                Required to switch to a different account
              </p>
              <a
                href="https://accounts.spotify.com/en/logout"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.25)',
                  borderRadius: 8, padding: '5px 10px', color: '#1DB954',
                  fontSize: 12, fontWeight: 500, textDecoration: 'none',
                }}
              >
                Open Spotify logout ↗
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,113,227,0.2)',
              border: '1px solid rgba(0,113,227,0.4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#0071e3',
            }}>2</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, marginBottom: 3 }}>
                Connect new account
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 }}>
                After logging out, sign in with the account you want
              </p>
              <div className="flex gap-2 items-center">
                <button
                  className="btn-primary text-xs px-4 py-1.5"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? '…' : 'Reconnect Spotify'}
                </button>
                <button onClick={onClose}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {(metaKey === 'steam' || metaKey === 'riot') && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>
            {meta.changeLabel}
          </p>
          <div className="flex gap-2">
            <input
              className="input flex-1 text-sm font-mono"
              placeholder={meta.changePlaceholder}
              value={value}
              autoFocus
              onChange={e => {
                const v = metaKey === 'steam'
                  ? e.target.value.replace(/\D/g, '').slice(0, 17)
                  : e.target.value;
                setValue(v);
              }}
              onKeyDown={e => e.key === 'Enter' && isValid && !mutation.isPending && mutation.mutate()}
              style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
            <button
              className="btn-primary text-xs px-4 flex-shrink-0"
              style={saved ? { background: '#34c759' } : {}}
              disabled={!isValid || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? '…' : saved ? 'Saved ✓' : 'Save'}
            </button>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
              Cancel
            </button>
          </div>
          {mutation.isError && (
            <p style={{ color: '#ff3b30', fontSize: 11, marginTop: 6 }}>
              {mutation.error?.response?.data?.error || 'Update failed'}
            </p>
          )}
        </>
      )}
    </div>
  );
};

const DataSources = () => {
  const qc = useQueryClient();
  const [errors, setErrors]         = useState({});
  const [editSource, setEditSource] = useState(null);

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => api.get('/data-sources').then((r) => r.data.sources || []),
  });

  const connectMutation = useMutation({
    mutationFn: (sourceName) => api.get(`/${sourceName}/auth`).then((r) => r.data.url),
    onSuccess: (url) => { window.location.href = url; },
    onError: (err, sourceName) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Connection failed';
      setErrors((prev) => ({ ...prev, [sourceName]: msg }));
      setTimeout(() => setErrors((prev) => { const n = { ...prev }; delete n[sourceName]; return n; }), 4000);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ sourceName, is_enabled }) => api.patch(`/data-sources/${sourceName}`, { is_enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['data-sources'] }),
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {Object.entries(SOURCE_META).map(([key, meta]) => {
        const source      = sources.find((s) => s.source_name === key);
        const isConnected = !!source?.access_token;
        const syncStatus  = source?.sync_status;
        const error       = errors[key];
        const isEditing   = editSource === key;

        return (
          <div key={key} className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>

            {/* Header row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.iconBg, border: `1px solid ${meta.iconBorder}` }}>
                  {meta.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>{meta.label}</p>
                    {isConnected && <span className="badge-connected text-xs">Connected</span>}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: error ? '#ff3b30' : 'rgba(255,255,255,0.4)' }}>
                    {error ? error : isConnected ? (
                      syncStatus === 'success' ? `Last synced ${source?.last_sync ? fmtRelative(source.last_sync) : 'recently'}` :
                      syncStatus === 'error'   ? 'Sync error — check your API key' :
                      syncStatus === 'syncing' ? 'Syncing…' : meta.desc
                    ) : meta.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Change button — inline panel for spotify/steam/riot, link for others */}
                {isConnected && (
                  meta.changeType ? (
                    <button
                      className="text-xs font-medium"
                      style={{ color: isEditing ? 'rgba(255,255,255,0.3)' : '#0071e3', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => setEditSource(isEditing ? null : key)}>
                      {isEditing ? 'Cancel' : 'Change'}
                    </button>
                  ) : meta.connectType === 'page' ? (
                    <Link to={meta.connectPath}
                      className="text-xs font-medium"
                      style={{ color: '#0071e3' }}>
                      Change
                    </Link>
                  ) : (
                    <button
                      className="text-xs font-medium"
                      style={{ color: '#0071e3', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => connectMutation.mutate(key)}
                      disabled={connectMutation.isPending}>
                      Change
                    </button>
                  )
                )}

                {/* Toggle / Connect */}
                {isConnected ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer"
                      checked={source?.is_enabled ?? false}
                      onChange={(e) => toggleMutation.mutate({ sourceName: key, is_enabled: e.target.checked })} />
                    <div className="w-9 h-5 rounded-full transition-all relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"
                      style={{ background: source?.is_enabled ? '#34c759' : '#d2d2d7' }} />
                  </label>
                ) : meta.connectType === 'page' ? (
                  <Link to={meta.connectPath} className="btn-primary text-xs px-4 py-1.5">
                    Connect
                  </Link>
                ) : (
                  <button
                    className="btn-primary text-xs px-4 py-1.5"
                    onClick={() => connectMutation.mutate(key)}
                    disabled={connectMutation.isPending}>
                    {connectMutation.isPending ? '…' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            {/* Inline change panel */}
            {isEditing && (
              <InlineChangePanel
                metaKey={key}
                meta={meta}
                onClose={() => setEditSource(null)}
                onSaved={() => qc.invalidateQueries({ queryKey: ['data-sources'] })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DataSources;
