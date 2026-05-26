import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useSteam } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import api from '../services/api';
import { fmtNumber, fmtHours } from '../utils/formatters';
import { SERVICE_COLORS } from '../utils/colors';
import { SteamScene } from '../components/Three/ServiceScenes';

const C = SERVICE_COLORS.steam;
const T = { primary: 'rgba(255,255,255,0.92)', muted: 'rgba(255,255,255,0.4)' };

const BOX_W = 150;
const BOX_H = 80;

const rand = (min, max) => Math.random() * (max - min) + min;

const AsteroidField = ({ games }) => {
  const containerRef = useRef(null);
  const boxRefs = useRef([]);
  const state = useRef(null);
  const rafRef = useRef(null);

  const items = games.slice(0, 8);

  const initState = useCallback((containerW, containerH) => {
    return items.map((_, i) => {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.4, 1.0);
      return {
        x: rand(0, containerW - BOX_W),
        y: rand(0, containerH - BOX_H),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    });
  }, [items.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    state.current = initState(cW, cH);

    const tick = () => {
      const boxes = state.current;
      const W = container.clientWidth;
      const H = container.clientHeight;

      // Move each box
      for (let i = 0; i < boxes.length; i++) {
        boxes[i].x += boxes[i].vx;
        boxes[i].y += boxes[i].vy;

        // Wall bounce
        if (boxes[i].x <= 0) { boxes[i].x = 0; boxes[i].vx = Math.abs(boxes[i].vx); }
        if (boxes[i].x >= W - BOX_W) { boxes[i].x = W - BOX_W; boxes[i].vx = -Math.abs(boxes[i].vx); }
        if (boxes[i].y <= 0) { boxes[i].y = 0; boxes[i].vy = Math.abs(boxes[i].vy); }
        if (boxes[i].y >= H - BOX_H) { boxes[i].y = H - BOX_H; boxes[i].vy = -Math.abs(boxes[i].vy); }
      }

      // AABB collision detection and elastic response
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], b = boxes[j];
          const overlapX = (a.x + BOX_W) - b.x;
          const overlapY = (a.y + BOX_H) - b.y;
          const overlapX2 = (b.x + BOX_W) - a.x;
          const overlapY2 = (b.y + BOX_H) - a.y;

          if (overlapX > 0 && overlapX2 > 0 && overlapY > 0 && overlapY2 > 0) {
            // Collision detected — find minimum separation axis
            const minX = Math.min(overlapX, overlapX2);
            const minY = Math.min(overlapY, overlapY2);

            if (minX < minY) {
              // Separate along X, swap X velocities
              const sep = minX / 2 + 1;
              if (a.x < b.x) { a.x -= sep; b.x += sep; } else { a.x += sep; b.x -= sep; }
              const tmpVx = a.vx; a.vx = b.vx; b.vx = tmpVx;
            } else {
              // Separate along Y, swap Y velocities
              const sep = minY / 2 + 1;
              if (a.y < b.y) { a.y -= sep; b.y += sep; } else { a.y += sep; b.y -= sep; }
              const tmpVy = a.vy; a.vy = b.vy; b.vy = tmpVy;
            }
          }
        }
      }

      // Apply positions via direct DOM manipulation
      for (let i = 0; i < boxes.length; i++) {
        const el = boxRefs.current[i];
        if (el) el.style.transform = `translate(${boxes[i].x}px, ${boxes[i].y}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items.length, initState]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 480 }}>
      <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: 10, position: 'relative', zIndex: 1 }}>
        Most played — drifting through the asteroid belt
      </p>
      {items.map((game, i) => (
        <div
          key={game.appid ?? i}
          ref={el => boxRefs.current[i] = el}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: BOX_W,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(102,192,244,0.25)',
            borderRadius: 16,
            padding: '10px 14px',
            cursor: 'default',
            userSelect: 'none',
            willChange: 'transform',
          }}>
          {game.appid && game.img_icon_url && (
            <img
              src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
              className="w-8 h-8 rounded-lg mb-2 object-cover"
              alt={game.name}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <p className="text-xs font-semibold leading-tight" style={{ color: T.primary }} title={game.name}>
            {game.name?.length > 18 ? game.name.slice(0, 16) + '…' : game.name}
          </p>
          <p className="text-xs mt-1 font-bold" style={{ color: C.text }}>
            {game.playtime_hours ?? 0}h
          </p>
        </div>
      ))}
    </div>
  );
};

const SteamPage = () => {
  const { data, isLoading, refetch } = useSteam();
  const qc = useQueryClient();
  const [steamId, setSteamId] = useState('');
  const [showConnect, setShowConnect] = useState(false);

  const connect = useMutation({
    mutationFn: (id) => api.post('/steam/connect', { steamId: id }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['steam', 'data-sources'] });
      setShowConnect(false);
      setTimeout(() => refetch(), 3000);
    },
  });

  const retrySync = useMutation({
    mutationFn: () => api.post('/steam/sync').then((r) => r.data),
    onSuccess: () => refetch(),
    onError: () => refetch(),
  });

  const isDbConnected = data !== null && data !== undefined;
  const profile = data?.profile;
  const topGames = data?.topGames || [];
  const stats = data?.stats;
  const hasData = !!profile;
  const syncStatus = data?.syncStatus;
  const syncError = data?.syncError;
  const isSyncing = isDbConnected && !hasData && syncStatus !== 'error';
  const isSyncError = isDbConnected && !hasData && syncStatus === 'error';

  useEffect(() => {
    if (!isSyncing) return;
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [isSyncing, refetch]);

  return (
    <DashboardLayout scene={<SteamScene />}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: C.text }}>
            {hasData ? profile?.personaname : 'Gaming stats'}
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            Steam
          </h1>
        </div>
        {isDbConnected
          ? <span className="badge-connected">Connected</span>
          : <button onClick={() => setShowConnect(true)} className="btn-primary text-xs px-4 py-2">Connect</button>}
      </div>

      {/* Connect form */}
      {showConnect && (!isDbConnected || isSyncError) && (
        <div className="mb-4 card max-w-sm">
          <p className="text-sm font-medium mb-1" style={{ color: '#1d1d1f' }}>Enter your Steam ID (17-digit number)</p>
          <p className="text-xs mb-3" style={{ color: '#aeaeb2' }}>Find it at steamcommunity.com/id/yourusername</p>
          <div className="flex gap-2">
            <input className="input flex-1 text-sm" placeholder="76561198000000000" value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && steamId && connect.mutate(steamId)} />
            <button className="btn-primary text-sm px-4"
              disabled={!steamId || connect.isPending}
              onClick={() => steamId && connect.mutate(steamId)}>
              {connect.isPending ? '…' : 'Connect'}
            </button>
          </div>
          {connect.isError && <p className="text-xs mt-2" style={{ color: '#ff3b30' }}>{connect.error?.response?.data?.message || 'Connection failed'}</p>}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
      ) : !isDbConnected && !showConnect ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect Steam to see your gaming stats</p>
          <button className="btn-primary text-sm" onClick={() => setShowConnect(true)}>Connect Steam</button>
        </div>
      ) : isSyncError ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)' }}>
            <span style={{ color: '#ff3b30', fontSize: 18 }}>✕</span>
          </div>
          <p className="font-medium text-white">Steam sync failed</p>
          <p className="text-xs max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{syncError || 'Check that your profile is public and Steam ID is correct.'}</p>
          <button className="btn-primary text-sm mt-2" onClick={() => setShowConnect(true)}>Try a different Steam ID</button>
        </div>
      ) : isSyncing ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.primary, borderTopColor: 'transparent' }} />
          <p className="font-medium text-white">Syncing your Steam data...</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>The page will update automatically.</p>
          <button className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}
            disabled={retrySync.isPending} onClick={() => retrySync.mutate()}>
            {retrySync.isPending ? 'Retrying...' : 'Force retry'}
          </button>
        </div>
      ) : hasData ? (
        <div className="space-y-6 animate-fade-in">
          {/* Stat cards */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="card-glass float-1 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: C.text }}>{fmtNumber(stats.totalGames)}</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Games owned</p>
              </div>
              <div className="card-glass float-2 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: T.primary }}>{fmtHours(stats.totalPlaytimeHours)}</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Total playtime</p>
              </div>
              <div className="card-glass float-3 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: T.primary }}>{stats.recentGamesCount}</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Recent games</p>
              </div>
            </div>
          )}

          {/* Asteroid field with physics */}
          {topGames.length > 0 && <AsteroidField games={topGames} />}
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default SteamPage;
