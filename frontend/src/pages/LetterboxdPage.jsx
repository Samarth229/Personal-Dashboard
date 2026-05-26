import { useState } from 'react';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useLetterboxd } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { SERVICE_COLORS } from '../utils/colors';
import { fmtDate } from '../utils/formatters';
import { LetterboxdScene } from '../components/Three/ServiceScenes';

const C = SERVICE_COLORS.letterboxd;
const T = { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.4)' };

const LetterboxdPage = () => {
  const { data, isLoading, refetch } = useLetterboxd();
  const qc = useQueryClient();
  const [username, setUsername] = useState('');
  const [showConnect, setShowConnect] = useState(false);

  const connect = useMutation({
    mutationFn: (u) => api.post('/letterboxd/connect', { username: u }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['letterboxd'] });
      setShowConnect(false);
      setTimeout(() => refetch(), 2000);
    },
  });

  const recentFilms = data?.recentFilms || [];
  const stats = data?.stats;
  const connected = !!data?.username;

  const ratingDist = stats?.ratingDistribution
    ? Object.entries(stats.ratingDistribution).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    : [];

  return (
    <DashboardLayout scene={<LetterboxdScene />}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: C.text }}>Movie diary</p>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            Letterboxd
          </h1>
        </div>
        {connected
          ? <span className="badge-connected">Connected</span>
          : <button onClick={() => setShowConnect(true)} className="btn-primary text-xs px-4 py-2">Connect</button>}
      </div>

      {/* Connect form — white card for input usability */}
      {showConnect && !connected && (
        <div className="mb-4 card max-w-sm">
          <p className="text-sm font-medium mb-3" style={{ color: '#1d1d1f' }}>Enter your Letterboxd username</p>
          <div className="flex gap-2">
            <input className="input flex-1 text-sm" placeholder="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && username && connect.mutate(username)} />
            <button className="btn-primary text-sm px-4"
              disabled={!username || connect.isPending}
              onClick={() => username && connect.mutate(username)}>
              {connect.isPending ? '…' : 'Connect'}
            </button>
          </div>
          {connect.isError && <p className="text-xs mt-2" style={{ color: '#ff3b30' }}>{connect.error?.response?.data?.message || 'Connection failed'}</p>}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
      ) : !connected && !showConnect ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect your Letterboxd to see your movie diary</p>
          <button className="btn-primary text-sm" onClick={() => setShowConnect(true)}>Connect Letterboxd</button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No API key required — uses your public RSS feed</p>
        </div>
      ) : connected ? (
        <div className="space-y-4 animate-fade-in">
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="card-glass float-1 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: C.text }}>{stats.recentCount}</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Recent films</p>
              </div>
              <div className="card-glass float-2 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: T.primary }}>{stats.averageRating || '—'}</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Avg rating</p>
              </div>
              <div className="card-glass float-3 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: T.primary }}>{ratingDist.length}</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Rating spread</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-glass float-4">
              <p className="section-title">Recent Films</p>
              <div className="space-y-3">
                {recentFilms.map((film, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-10 rounded flex-shrink-0 flex items-center justify-center text-xl"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>🎬</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: T.primary }}>{film.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {film.year && <span className="text-xs" style={{ color: T.muted }}>{film.year}</span>}
                        {film.watchedDate && <span className="text-xs" style={{ color: T.muted }}>{fmtDate(film.watchedDate)}</span>}
                      </div>
                    </div>
                    {film.rating && (
                      <span className="text-xs flex-shrink-0" style={{ color: C.text }}>
                        {'★'.repeat(Math.round(film.rating))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {ratingDist.length > 0 && (
              <div className="card-glass float-5">
                <p className="section-title">Rating Distribution</p>
                <div className="space-y-2">
                  {ratingDist.map(([rating, count]) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-xs w-6 flex-shrink-0" style={{ color: T.muted }}>{rating}★</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.round((count / ratingDist[0][1]) * 100)}%`, background: C.primary }} />
                      </div>
                      <span className="text-xs w-4 flex-shrink-0" style={{ color: T.muted }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default LetterboxdPage;
