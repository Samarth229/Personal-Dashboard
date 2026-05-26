import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useRiot } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import api from '../services/api';
import { SERVICE_COLORS } from '../utils/colors';
import { RiotScene } from '../components/Three/ServiceScenes';

const C = SERVICE_COLORS.riot;
const T = { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.4)' };

const TIER_COLORS = {
  IRON: '#8B8B8B', BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700',
  PLATINUM: '#00D4AA', EMERALD: '#50C878', DIAMOND: '#B9F2FF',
  MASTER: '#9B59B6', GRANDMASTER: '#E74C3C', CHALLENGER: '#F39C12',
};

const RiotPage = () => {
  const { data, isLoading, refetch } = useRiot();
  const qc = useQueryClient();
  const [summonerName, setSummonerName] = useState('');
  const [showConnect, setShowConnect] = useState(false);

  const connect = useMutation({
    mutationFn: (name) => api.post('/riot/connect', { summonerName: name }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['riot', 'data-sources'] });
      setShowConnect(false);
      setTimeout(() => refetch(), 4000);
    },
  });

  const retrySync = useMutation({
    mutationFn: () => api.post('/riot/sync').then((r) => r.data),
    onSuccess: () => refetch(),
    onError: () => refetch(),
  });

  const isDbConnected = data !== null && data !== undefined;
  const summoner = data?.summoner;
  const rankedStats = data?.rankedStats || [];
  const matchHistory = data?.matchHistory || [];
  const hasData = !!summoner;
  const syncStatus = data?.syncStatus;
  const syncError = data?.syncError;
  const isSyncing = isDbConnected && !hasData && syncStatus !== 'error';
  const isSyncError = isDbConnected && !hasData && syncStatus === 'error';

  useEffect(() => {
    if (!isSyncing) return;
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [isSyncing, refetch]);

  const soloQueue = rankedStats.find((e) => e.queueType === 'RANKED_SOLO_5x5');
  const flexQueue = rankedStats.find((e) => e.queueType === 'RANKED_FLEX_SR');
  const tierColor = soloQueue ? TIER_COLORS[soloQueue.tier] : C.text;
  const wins = matchHistory.filter((m) => m.win).length;

  return (
    <DashboardLayout scene={<RiotScene />}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: C.text }}>
            {hasData ? `${summoner?.gameName}#${summoner?.tagLine}` : 'League of Legends'}
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            Riot Games
          </h1>
        </div>
        {isDbConnected
          ? <span className="badge-connected">Connected</span>
          : <button onClick={() => setShowConnect(true)} className="btn-primary text-xs px-4 py-2">Connect</button>}
      </div>

      {/* Connect form — white card for usability */}
      {showConnect && (!isDbConnected || isSyncError) && (
        <div className="mb-4 card max-w-sm">
          <p className="text-sm font-medium mb-1" style={{ color: '#1d1d1f' }}>Enter your Riot ID</p>
          <p className="text-xs mb-3" style={{ color: '#aeaeb2' }}>Format: GameName#TAG (e.g. Shivannsh#SG2)</p>
          <div className="flex gap-2">
            <input className="input flex-1 text-sm" placeholder="GameName#TAG" value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && summonerName && connect.mutate(summonerName)} />
            <button className="btn-primary text-sm px-4"
              disabled={!summonerName || connect.isPending}
              onClick={() => summonerName && connect.mutate(summonerName)}>
              {connect.isPending ? '…' : 'Connect'}
            </button>
          </div>
          {connect.isError && (
            <p className="text-xs mt-2" style={{ color: '#ff3b30' }}>{connect.error?.response?.data?.message || 'Connection failed'}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
      ) : !isDbConnected && !showConnect ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect your Riot account to see your stats</p>
          <button className="btn-primary text-sm" onClick={() => setShowConnect(true)}>Connect Riot ID</button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Requires Riot API key in .env</p>
        </div>
      ) : isSyncError ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)' }}>
            <span style={{ color: '#ff3b30', fontSize: 18 }}>✕</span>
          </div>
          <p className="font-medium text-white">Riot sync failed</p>
          <p className="text-xs max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{syncError || 'Could not fetch Riot data. The API key may have expired or the Riot ID is invalid.'}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Riot dev API keys expire every 24 hours — you may need to generate a new one.</p>
          <button className="btn-primary text-sm mt-2" onClick={() => setShowConnect(true)}>Try again with new Riot ID</button>
        </div>
      ) : isSyncing ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: C.primary, borderTopColor: 'transparent' }} />
          <p className="font-medium text-white">Fetching your League data...</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Pulling match history and rank — this takes a few seconds.</p>
          <button className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }} onClick={() => refetch()}>Refresh now</button>
          <button className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}
            disabled={retrySync.isPending}
            onClick={() => retrySync.mutate()}>
            {retrySync.isPending ? 'Retrying...' : 'Force retry sync'}
          </button>
        </div>
      ) : hasData ? (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-glass float-1 text-center" style={{ padding: 20 }}>
              <p className="text-2xl font-bold" style={{ color: tierColor }}>
                {soloQueue ? soloQueue.tier.slice(0, 1) + soloQueue.tier.slice(1).toLowerCase() : 'Unranked'}
              </p>
              <p className="text-xs mt-1" style={{ color: T.muted }}>Solo/Duo rank</p>
            </div>
            {soloQueue && (
              <div className="card-glass float-2 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold" style={{ color: C.text }}>{soloQueue.leaguePoints} LP</p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>{soloQueue.rank}</p>
              </div>
            )}
            <div className="card-glass float-3 text-center" style={{ padding: 20 }}>
              <p className="text-2xl font-bold" style={{ color: T.primary }}>{summoner?.summonerLevel}</p>
              <p className="text-xs mt-1" style={{ color: T.muted }}>Level</p>
            </div>
            {matchHistory.length > 0 && (
              <div className="card-glass float-4 text-center" style={{ padding: 20 }}>
                <p className="text-2xl font-bold"
                  style={{ color: wins / matchHistory.length > 0.5 ? '#34c759' : '#ff3b30' }}>
                  {Math.round((wins / matchHistory.length) * 100)}%
                </p>
                <p className="text-xs mt-1" style={{ color: T.muted }}>Win rate</p>
              </div>
            )}
          </div>

          {(soloQueue || flexQueue) && (
            <div className="card-glass float-5">
              <p className="section-title">Ranked</p>
              <div className="space-y-3">
                {soloQueue && <RankedRow entry={soloQueue} label="Solo/Duo" tierColor={TIER_COLORS[soloQueue.tier]} />}
                {flexQueue && <RankedRow entry={flexQueue} label="Flex 5v5" tierColor={TIER_COLORS[flexQueue.tier]} />}
              </div>
            </div>
          )}

          {matchHistory.length > 0 && (
            <div className="card-glass float-6">
              <p className="section-title">Recent Matches</p>
              <div className="space-y-1">
                {matchHistory.map((m) => (
                  <div key={m.matchId} className="flex items-center gap-3 py-2 border-b last:border-0"
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ background: m.win ? '#34c759' : '#ff3b30' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: T.primary }}>{m.champion}</p>
                      <p className="text-xs" style={{ color: T.muted }}>{m.gameMode}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: T.primary }}>{m.kills}/{m.deaths}/{m.assists}</p>
                      <p className="text-xs" style={{ color: T.muted }}>{m.kda} KDA</p>
                    </div>
                    <span className="text-xs font-bold w-4 flex-shrink-0"
                      style={{ color: m.win ? '#34c759' : '#ff3b30' }}>
                      {m.win ? 'W' : 'L'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </DashboardLayout>
  );
};

const RankedRow = ({ entry, label, tierColor }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
      style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}30` }}>
      {entry.tier.slice(0, 1)}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>{entry.tier} {entry.rank} — {entry.leaguePoints} LP</p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label} · {entry.wins}W {entry.losses}L ({Math.round(entry.wins / (entry.wins + entry.losses) * 100)}%)</p>
    </div>
  </div>
);

export default RiotPage;
