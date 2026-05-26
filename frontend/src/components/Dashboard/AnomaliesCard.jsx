import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const severityStyles = {
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const AnomaliesCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.get('/insights').then((r) => r.data.insights),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;
  if (!data?.length) return null;

  return (
    <div className="card col-span-full">
      <h3 className="font-semibold text-white mb-3">Insights & Anomalies</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.slice(0, 6).map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-xl p-3 ${severityStyles[insight.severity] || severityStyles.info}`}
          >
            <p className="text-sm font-medium">{insight.title}</p>
            <p className="text-xs opacity-80 mt-1">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomaliesCard;
