import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CardSkeleton } from '../Shared/Loading';

const GmailCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['gmail'],
    queryFn: () => api.get('/gmail/cached').then((r) => r.data.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (isLoading) return <CardSkeleton />;

  const stats = data?.stats;
  const topSenders = data?.topSenders || [];

  if (!stats) {
    return (
      <div className="card h-full flex flex-col">
        <CardHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <MailIcon className="w-6 h-6 text-red-500/30" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Gmail not connected</p>
            <p className="text-gray-600 text-xs mt-1">See your inbox stats and top senders</p>
          </div>
          <Link to="/settings" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            Connect in Settings →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-4">
      <CardHeader connected />

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-500/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.unreadCount?.toLocaleString() ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unread</p>
        </div>
        <div className="bg-gray-800/60 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.totalMessages?.toLocaleString() ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
      </div>

      {topSenders.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Top Senders</p>
          <div className="space-y-2">
            {topSenders.slice(0, 4).map((sender, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-400">{sender.email[0].toUpperCase()}</span>
                </div>
                <p className="text-xs text-gray-400 truncate flex-1">{sender.email}</p>
                <span className="text-xs text-gray-600 flex-shrink-0">{sender.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MailIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CardHeader = ({ connected }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
        <MailIcon className="w-4 h-4 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Gmail</p>
        <p className="text-xs text-gray-500">Email overview</p>
      </div>
    </div>
    {connected && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Connected</span>}
  </div>
);

export default GmailCard;
