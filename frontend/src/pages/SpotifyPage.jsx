import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useSpotify } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import BarChartComponent from '../components/Charts/BarChart';
import { fmtDuration, truncate } from '../utils/formatters';
import { SERVICE_COLORS } from '../utils/colors';
import { SpotifyScene } from '../components/Three/ServiceScenes';

const C = SERVICE_COLORS.spotify;
const T = { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.4)', divider: 'rgba(255,255,255,0.08)', innerBg: 'rgba(255,255,255,0.06)' };

const SpotifyPage = () => {
  const { data, isLoading } = useSpotify();
  const [tab, setTab] = useState('artists');

  const topArtists     = data?.topArtists     || [];
  const topTracks      = data?.topTracks      || [];
  const recentlyPlayed = data?.recentlyPlayed || [];

  const genreData = (() => {
    const counts = {};
    topArtists.forEach((a) => a.genres?.slice(0, 2).forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: truncate(name, 18), value }));
  })();

  return (
    <DashboardLayout scene={<SpotifyScene />}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: C.text }}>Music</p>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            Spotify
          </h1>
        </div>
        {!!data?.topArtists
          ? <span className="badge-connected">Connected</span>
          : <Link to="/settings" className="btn-primary text-xs px-4 py-2">Connect</Link>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : !data?.topArtists ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Spotify not connected</p>
          <Link to="/settings" className="btn-primary text-sm">Connect in Settings →</Link>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-1 p-1 rounded-full w-fit" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {['artists', 'tracks', 'recent'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={tab === t
                  ? { background: 'rgba(255,255,255,0.9)', color: '#1d1d1f', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
                  : { color: 'rgba(255,255,255,0.55)' }}>
                {t === 'artists' ? 'Top Artists' : t === 'tracks' ? 'Top Tracks' : 'Recent'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card-glass float-1">
              {tab === 'artists' && (
                <div className="space-y-3">
                  <p className="section-title">Top Artists</p>
                  {topArtists.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="text-xs w-4 text-right flex-shrink-0" style={{ color: T.muted }}>{i + 1}</span>
                      {a.images?.[2]?.url
                        ? <img src={a.images[2].url} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt={a.name} />
                        : <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: C.bg }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: T.primary }}>{a.name}</p>
                        <p className="text-xs truncate" style={{ color: T.muted }}>{a.genres?.slice(0, 2).join(', ') || 'Artist'}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: T.muted }}>{a.popularity}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'tracks' && (
                <div className="space-y-3">
                  <p className="section-title">Top Tracks</p>
                  {topTracks.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="text-xs w-4 text-right flex-shrink-0" style={{ color: T.muted }}>{i + 1}</span>
                      {t.album?.images?.[2]?.url
                        ? <img src={t.album.images[2].url} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" alt={t.name} />
                        : <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ background: C.bg }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: T.primary }}>{t.name}</p>
                        <p className="text-xs truncate" style={{ color: T.muted }}>{t.artists?.map((a) => a.name).join(', ')}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: T.muted }}>{fmtDuration(t.duration_ms)}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'recent' && (
                <div className="space-y-3">
                  <p className="section-title">Recently Played</p>
                  {recentlyPlayed.slice(0, 15).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.track?.album?.images?.[2]?.url
                        ? <img src={item.track.album.images[2].url} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" alt={item.track.name} />
                        : <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ background: C.bg }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: T.primary }}>{item.track?.name}</p>
                        <p className="text-xs truncate" style={{ color: T.muted }}>{item.track?.artists?.map((a) => a.name).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="card-glass float-2">
                <p className="section-title">Stats</p>
                <div className="space-y-2">
                  <StatRow label="Top artists" value={topArtists.length} />
                  <StatRow label="Top tracks" value={topTracks.length} />
                  <StatRow label="Recent plays" value={recentlyPlayed.length} />
                  {topArtists[0]?.popularity != null && <StatRow label="Popularity" value={`${topArtists[0].popularity}/100`} />}
                </div>
              </div>
              {genreData.length > 0 && (
                <div className="card-glass float-3">
                  <p className="section-title">Top Genres</p>
                  <BarChartComponent data={genreData} dataKey="value" xKey="name" color={C.primary} height={140} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
    <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>{value}</span>
  </div>
);

export default SpotifyPage;
