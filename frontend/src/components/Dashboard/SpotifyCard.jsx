import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CardSkeleton } from '../Shared/Loading';

const SpotifyCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['spotify'],
    queryFn: () => api.get('/spotify/cached').then((r) => r.data.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (isLoading) return <CardSkeleton />;

  const topArtists = data?.topArtists || [];
  const topTracks = data?.topTracks || [];

  if (!topArtists.length) {
    return (
      <div className="card h-full flex flex-col">
        <CardHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <SpotifyIcon className="w-6 h-6 text-green-500/40" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Spotify not connected</p>
            <p className="text-gray-600 text-xs mt-1">See your top artists and tracks</p>
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

      {topArtists.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Top Artists</p>
          <div className="space-y-2">
            {topArtists.slice(0, 3).map((artist, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs w-4 text-center">{i + 1}</span>
                {artist.images?.[0]?.url ? (
                  <img src={artist.images[0].url} className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-700" alt={artist.name} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <SpotifyIcon className="w-4 h-4 text-green-500/50" />
                  </div>
                )}
                <p className="text-sm text-gray-200 truncate flex-1">{artist.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {topTracks[0] && (
        <div className="border-t border-gray-800 pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Now Trending</p>
          <div className="flex items-center gap-3">
            {topTracks[0].album?.images?.[0]?.url && (
              <img src={topTracks[0].album.images[0].url} className="w-10 h-10 rounded-lg object-cover" alt={topTracks[0].name} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">{topTracks[0].name}</p>
              <p className="text-xs text-gray-500 truncate">{topTracks[0].artists?.[0]?.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpotifyIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const CardHeader = ({ connected }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
        <SpotifyIcon className="w-4 h-4 text-green-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Spotify</p>
        <p className="text-xs text-gray-500">Music insights</p>
      </div>
    </div>
    {connected && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Connected</span>}
  </div>
);

export default SpotifyCard;
