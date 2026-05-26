import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CardSkeleton } from '../Shared/Loading';
import PieChartComponent from '../Charts/PieChart';

const GitHubCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['github'],
    queryFn: () => api.get('/github/cached').then((r) => r.data.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (isLoading) return <CardSkeleton />;

  const profile = data?.profile;
  const contributions = data?.contributions;
  const languages = data?.languages || {};

  const rawLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalBytes = rawLangs.reduce((s, [, v]) => s + v, 0);
  const langData = rawLangs.map(([name, value]) => ({
    name,
    value: Math.round((value / totalBytes) * 100),
    label: `${Math.round((value / totalBytes) * 100)}%`,
  }));

  const NotConnected = () => (
    <div className="card h-full flex flex-col">
      <CardHeader />
      <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center">
          <GHIcon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium">GitHub not connected</p>
          <p className="text-gray-600 text-xs mt-1">See your repos and commit activity</p>
        </div>
        <Link to="/settings" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          Connect in Settings →
        </Link>
      </div>
    </div>
  );

  if (!profile) return <NotConnected />;

  return (
    <div className="card flex flex-col gap-4">
      <CardHeader profile={profile} />

      <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
        {profile.avatar_url && (
          <img src={profile.avatar_url} className="w-10 h-10 rounded-full ring-2 ring-gray-700" alt={profile.login} />
        )}
        <div>
          <p className="text-sm font-semibold text-white">{profile.name || profile.login}</p>
          <p className="text-xs text-gray-500">{profile.public_repos} repos · {profile.followers} followers</p>
        </div>
      </div>

      {contributions && (
        <div className="grid grid-cols-2 gap-2">
          <StatBox value={contributions.commitCount} label="Commits" highlight={contributions.commitCount > 0} />
          <StatBox value={contributions.events?.length ?? 0} label="Push events" />
        </div>
      )}

      {langData.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Top Languages</p>
          <PieChartComponent data={langData} height={150} />
        </div>
      )}
    </div>
  );
};

const GHIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const CardHeader = ({ profile }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
        <GHIcon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">GitHub</p>
        <p className="text-xs text-gray-500">Code activity</p>
      </div>
    </div>
    {profile && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Connected</span>}
  </div>
);

const StatBox = ({ value, label, highlight }) => (
  <div className="bg-gray-800/60 rounded-xl p-3 text-center">
    <p className={`text-2xl font-bold ${highlight ? 'text-primary-400' : 'text-white'}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

export default GitHubCard;
