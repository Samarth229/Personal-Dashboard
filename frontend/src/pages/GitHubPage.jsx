import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useGitHub } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import PieChartComponent from '../components/Charts/PieChart';
import { fmtRelative } from '../utils/formatters';
import { SERVICE_COLORS } from '../utils/colors';
import { GitHubScene } from '../components/Three/ServiceScenes';

const C = SERVICE_COLORS.github;
const T = { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.4)' };

const GitHubPage = () => {
  const { data, isLoading } = useGitHub();

  const profile       = data?.profile;
  const contributions = data?.contributions;
  const languages     = data?.languages || {};
  const repos         = data?.repos || [];

  const rawLangs   = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const totalBytes = rawLangs.reduce((s, [, v]) => s + v, 0);
  const langData   = rawLangs.map(([name, value]) => ({ name, value: Math.round((value / totalBytes) * 100) }));
  const topRepos   = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 6);

  return (
    <DashboardLayout scene={<GitHubScene />}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: C.text }}>Code activity</p>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            GitHub
          </h1>
        </div>
        {profile
          ? <span className="badge-connected">Connected</span>
          : <Link to="/settings" className="btn-primary text-xs px-4 py-2">Connect</Link>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : !profile ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>GitHub not connected</p>
          <Link to="/settings" className="btn-primary text-sm">Connect in Settings →</Link>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">

          {/* Row 1: compact profile | 4 stats | recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Profile — compact */}
            <div className="card-glass float-1 flex flex-col items-center justify-center text-center gap-2" style={{ padding: '16px 12px' }}>
              {profile.avatar_url && (
                <img src={profile.avatar_url} className="w-12 h-12 rounded-full"
                  style={{ border: `2px solid ${C.border}` }} alt={profile.login} />
              )}
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: T.primary }}>{profile.name || profile.login}</p>
                <p className="text-xs" style={{ color: T.muted }}>@{profile.login}</p>
              </div>
            </div>

            {/* Stats — 2x2 grid */}
            <div className="card-glass float-2 lg:col-span-2">
              <p className="section-title">Stats</p>
              <div className="grid grid-cols-2 gap-2.5">
                <GlassStat label="Repos"     value={profile.public_repos ?? 0} />
                <GlassStat label="Followers" value={profile.followers ?? 0} />
                <GlassStat label="Following" value={profile.following ?? 0} />
                <GlassStat label="Commits"   value={contributions?.commitCount ?? 0} accent={C.text} />
              </div>
            </div>

            {/* Recent Activity — clean, compact */}
            <div className="card-glass float-3 lg:col-span-2">
              <p className="section-title">Recent Activity</p>
              <div className="space-y-2">
                {contributions?.events?.slice(0, 6).map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.text }} />
                    <p className="flex-1 text-xs truncate" style={{ color: T.secondary }}>
                      {(e.repo?.name || '').split('/')[1] || e.repo?.name}
                    </p>
                    <p className="text-xs flex-shrink-0" style={{ color: T.muted }}>{fmtRelative(e.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Big pie chart | Top repos (compact) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Languages — big pie, no legend, hover tooltip */}
            {langData.length > 0 && (
              <div className="card-glass float-4 lg:col-span-2">
                <p className="section-title">Languages</p>
                <p className="text-xs mb-2" style={{ color: T.muted }}>Hover to see details</p>
                <PieChartComponent data={langData} height={240} unit="%" hideLegend />
              </div>
            )}

            {/* Top repos — compact list */}
            {topRepos.length > 0 && (
              <div className="card-glass float-5 lg:col-span-3">
                <p className="section-title">Top Repositories</p>
                <div className="space-y-0">
                  {topRepos.map((repo) => (
                    <div key={repo.id} className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight" style={{ color: T.primary }}>{repo.name}</p>
                        {repo.description && (
                          <p className="text-xs truncate mt-0.5" style={{ color: T.muted }}>{repo.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {repo.language && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.08)', color: T.muted }}>
                            {repo.language}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: T.muted }}>⭐{repo.stargazers_count}</span>
                        <span className="text-xs" style={{ color: T.muted }}>{fmtRelative(repo.updated_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const GlassStat = ({ label, value, accent }) => (
  <div className="text-center py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
    <p className="text-lg font-bold" style={{ color: accent || 'rgba(255,255,255,0.92)' }}>{value}</p>
    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
  </div>
);

export default GitHubPage;
