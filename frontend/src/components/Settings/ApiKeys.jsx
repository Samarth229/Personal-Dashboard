import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const DarkCard = ({ children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderTopColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    padding: 20,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  }}>
    {children}
  </div>
);

const InstructionBox = ({ children, accent }) => (
  <div style={{
    background: accent ? `rgba(${accent},0.07)` : 'rgba(255,255,255,0.05)',
    border: `1px solid ${accent ? `rgba(${accent},0.2)` : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 14,
    padding: '12px 14px',
  }}>
    {children}
  </div>
);

const ApiKeys = () => {
  const qc = useQueryClient();
  const [riotInput, setRiotInput] = useState('');
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/settings/api-keys').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (riotApiKey) => api.post('/settings/api-keys', { riotApiKey }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setRiotInput('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── Steam ── */}
      <DarkCard>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(102,192,244,0.1)', border: '1px solid rgba(102,192,244,0.2)' }}>
            <span className="text-lg">🎮</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>Steam Setup</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Requires a Steam API key in your server .env and your Steam64 ID
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <InstructionBox>
            <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.82)' }}>
              Step 1 — Get your Steam API Key
            </p>
            <ol className="space-y-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <li>1. Go to{' '}
                <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noreferrer"
                  className="font-medium" style={{ color: '#60a5fa' }}>
                  steamcommunity.com/dev/apikey
                </a>
              </li>
              <li>2. Log in with your Steam account</li>
              <li>3. Enter any domain name (e.g.{' '}
                <span className="font-mono px-1 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>localhost</span>)
              </li>
              <li>4. Copy the generated 32-character API key</li>
              <li>5. Add it to your server <span className="font-mono px-1 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>.env</span> file:</li>
            </ol>
            <div className="mt-2 px-3 py-2 rounded-lg font-mono text-xs"
              style={{ background: 'rgba(0,0,0,0.4)', color: '#66C0F4', border: '1px solid rgba(102,192,244,0.2)' }}>
              STEAM_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
            </div>
          </InstructionBox>

          <InstructionBox>
            <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.82)' }}>
              Step 2 — Find your Steam64 ID (17-digit number)
            </p>
            <ol className="space-y-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <li><span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Option A:</span> Visit{' '}
                <a href="https://steamcommunity.com/id" target="_blank" rel="noreferrer"
                  className="font-medium" style={{ color: '#60a5fa' }}>
                  steamcommunity.com/id/[your-username]
                </a>
                {' '}and look at the URL — the number is your Steam64 ID
              </li>
              <li><span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Option B:</span> Use{' '}
                <a href="https://www.steamidfinder.com" target="_blank" rel="noreferrer"
                  className="font-medium" style={{ color: '#60a5fa' }}>
                  steamidfinder.com
                </a>
              </li>
            </ol>
            <div className="mt-2 px-3 py-2 rounded-lg font-mono text-xs text-center"
              style={{ background: 'rgba(102,192,244,0.08)', border: '1px solid rgba(102,192,244,0.2)', color: '#66C0F4' }}>
              Example: 76561198000000000
            </div>
          </InstructionBox>
        </div>
      </DarkCard>

      {/* ── Riot Games ── */}
      <DarkCard>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(200,155,60,0.1)', border: '1px solid rgba(200,155,60,0.2)' }}>
            <span className="text-lg">⚔️</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>Riot Games API Key</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Dev keys expire every 24 hours — update here without restarting the server
            </p>
          </div>
          {data?.hasRiotKey && (
            <span className="badge-connected text-xs flex-shrink-0">Active</span>
          )}
        </div>

        <InstructionBox accent="251,191,36">
          <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.82)' }}>
            How to get a Riot API Key
          </p>
          <ol className="space-y-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <li>1. Go to{' '}
              <a href="https://developer.riotgames.com" target="_blank" rel="noreferrer"
                className="font-medium" style={{ color: '#60a5fa' }}>
                developer.riotgames.com
              </a>
            </li>
            <li>2. Log in with your Riot account</li>
            <li>3. Your development API key is shown on the dashboard</li>
            <li>4. Click <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Regenerate API Key</span> if it has expired</li>
            <li>5. Paste the key below — it takes effect immediately</li>
          </ol>
          <div className="mt-2 rounded-lg px-3 py-2 text-xs"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.85)' }}>
            Dev keys expire every 24 hours. Personal/production keys last longer but require an application.
          </div>
        </InstructionBox>

        {data?.hasRiotKey && (
          <div className="my-3 px-3 py-2 rounded-xl font-mono text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {data.riotApiKey}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <input
            className="input flex-1 text-sm font-mono"
            placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            value={riotInput}
            onChange={(e) => setRiotInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && riotInput && saveMutation.mutate(riotInput)}
          />
          <button
            className="btn-primary text-xs px-4 flex-shrink-0"
            style={saved ? { background: '#34c759' } : {}}
            disabled={!riotInput || saveMutation.isPending}
            onClick={() => riotInput && saveMutation.mutate(riotInput)}>
            {saveMutation.isPending ? '…' : saved ? 'Saved ✓' : data?.hasRiotKey ? 'Update' : 'Save'}
          </button>
        </div>

        {saveMutation.isError && (
          <p className="text-xs mt-2" style={{ color: '#ff3b30' }}>{saveMutation.error?.response?.data?.error || 'Failed to save'}</p>
        )}
      </DarkCard>

      <div className="rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          API keys saved here are stored per-account and override the server's .env file.
          Updating a key here takes effect immediately — no server restart needed.
        </p>
      </div>
    </div>
  );
};

export default ApiKeys;
