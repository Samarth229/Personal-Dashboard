import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const useDashboard = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get('/dashboard/overview').then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  return {
    overview: data,
    isLoading,
    error,
    refetch,
    spotify: data?.spotify,
    github: data?.github,
    gmail: data?.gmail,
    fitness: data?.fitness,
    sources: data?.sources,
    lastSync: data?.lastSync,
  };
};

export default useDashboard;
