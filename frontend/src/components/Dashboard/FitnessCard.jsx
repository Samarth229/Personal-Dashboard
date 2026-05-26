import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CardSkeleton } from '../Shared/Loading';
import BarChartComponent from '../Charts/BarChart';

const FitnessCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['fitness'],
    queryFn: () => api.get('/fitness/cached').then((r) => r.data.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (isLoading) return <CardSkeleton />;

  const steps = data?.steps || [];
  const sleep = data?.sleep;
  const heartRate = data?.heartRate;

  if (!steps.length && !sleep && !heartRate) {
    return (
      <div className="card h-full flex flex-col">
        <CardHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <HeartIcon className="w-6 h-6 text-blue-500/30" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Fitbit not connected</p>
            <p className="text-gray-600 text-xs mt-1">See your steps, sleep and heart rate</p>
          </div>
          <Link to="/settings" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            Connect in Settings →
          </Link>
        </div>
      </div>
    );
  }

  const stepsData = Array.isArray(steps)
    ? steps.map((s) => ({ date: s.dateTime?.slice(5), value: parseInt(s.value) || 0 }))
    : [];

  const todaySteps = stepsData[stepsData.length - 1]?.value ?? 0;
  const sleepHours = sleep?.totalMinutesAsleep ? (sleep.totalMinutesAsleep / 60).toFixed(1) : null;

  return (
    <div className="card flex flex-col gap-4">
      <CardHeader connected />

      <div className="grid grid-cols-2 gap-2">
        {todaySteps > 0 && (
          <div className="bg-blue-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{todaySteps.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Steps today</p>
          </div>
        )}
        {sleepHours && (
          <div className="bg-purple-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{sleepHours}h</p>
            <p className="text-xs text-gray-500 mt-0.5">Sleep</p>
          </div>
        )}
        {heartRate?.restingHeartRate && (
          <div className="bg-red-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{heartRate.restingHeartRate}</p>
            <p className="text-xs text-gray-500 mt-0.5">Resting BPM</p>
          </div>
        )}
      </div>

      {stepsData.length > 1 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Steps — 7 days</p>
          <BarChartComponent data={stepsData} dataKey="value" xKey="date" color="#60a5fa" height={120} />
        </div>
      )}
    </div>
  );
};

const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CardHeader = ({ connected }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
        <HeartIcon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Fitness</p>
        <p className="text-xs text-gray-500">Health tracking</p>
      </div>
    </div>
    {connected && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Connected</span>}
  </div>
);

export default FitnessCard;
