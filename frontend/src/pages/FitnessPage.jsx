import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useFitness } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import BarChartComponent from '../components/Charts/BarChart';
import AreaChartComponent from '../components/Charts/AreaChart';
import { fmtNumber, fmtMinutes } from '../utils/formatters';
import { SERVICE_COLORS } from '../utils/colors';

const C = SERVICE_COLORS.fitness;

const FitnessPage = () => {
  const { data, isLoading } = useFitness();

  const steps = data?.steps || [];
  const sleep = data?.sleep;
  const heartRate = data?.heartRate;

  const connected = steps.length > 0 || !!sleep || !!heartRate;

  const stepsData = Array.isArray(steps)
    ? steps.map((s) => ({ date: s.dateTime?.slice(5), value: parseInt(s.value) || 0 }))
    : [];

  const todaySteps = stepsData[stepsData.length - 1]?.value ?? 0;
  const sleepHours = sleep?.totalMinutesAsleep ? (sleep.totalMinutesAsleep / 60).toFixed(1) : null;
  const avgSteps = stepsData.length
    ? Math.round(stepsData.reduce((s, d) => s + d.value, 0) / stepsData.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <span className="text-lg">❤️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Fitness</h1>
            <p className="text-xs text-gray-500">Health tracking</p>
          </div>
        </div>
        {connected
          ? <span className="badge-connected">Connected</span>
          : <Link to="/settings" className="badge-disconnected hover:text-white transition-colors">Connect →</Link>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6"><CardSkeleton /><CardSkeleton /></div>
      ) : !connected ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="text-gray-400 font-medium">Fitbit not connected</p>
          <Link to="/settings" className="btn-primary text-sm">Connect in Settings →</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {todaySteps > 0 && <BigStat label="Steps today" value={fmtNumber(todaySteps)} color={C.text} />}
            {avgSteps > 0 && <BigStat label="Avg steps" value={fmtNumber(avgSteps)} />}
            {sleepHours && <BigStat label="Last sleep" value={`${sleepHours}h`} color="#c084fc" />}
            {heartRate?.restingHeartRate && <BigStat label="Resting BPM" value={heartRate.restingHeartRate} color="#f87171" />}
          </div>

          {/* Charts */}
          {stepsData.length > 1 && (
            <div className="card">
              <p className="section-title">Steps — 7 days</p>
              <AreaChartComponent data={stepsData} dataKey="value" xKey="date" color={C.primary} height={160} />
            </div>
          )}

          {/* Sleep details */}
          {sleep && (
            <div className="card">
              <p className="section-title">Last Sleep</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sleep.totalMinutesAsleep && (
                  <div className="stat-box text-center">
                    <p className="text-lg font-bold text-purple-400">{fmtMinutes(sleep.totalMinutesAsleep)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Asleep</p>
                  </div>
                )}
                {sleep.minutesAwake !== undefined && (
                  <div className="stat-box text-center">
                    <p className="text-lg font-bold text-white">{sleep.minutesAwake}m</p>
                    <p className="text-xs text-gray-500 mt-0.5">Awake</p>
                  </div>
                )}
                {sleep.efficiency && (
                  <div className="stat-box text-center">
                    <p className="text-lg font-bold text-green-400">{sleep.efficiency}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Efficiency</p>
                  </div>
                )}
                {sleep.startTime && (
                  <div className="stat-box text-center">
                    <p className="text-lg font-bold text-white">
                      {new Date(sleep.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Bedtime</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

const BigStat = ({ label, value, color }) => (
  <div className="card text-center">
    <p className="text-2xl font-bold" style={{ color: color || 'white' }}>{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

export default FitnessPage;
