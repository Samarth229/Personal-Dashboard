import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const STALE = 60 * 1000;
const INTERVAL = 60 * 1000;

const fetcher = (path) => () => api.get(path).then((r) => r.data.data);

export const useSpotify = () =>
  useQuery({ queryKey: ['spotify'], queryFn: fetcher('/spotify/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useGitHub = () =>
  useQuery({ queryKey: ['github'], queryFn: fetcher('/github/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useGmail = () =>
  useQuery({ queryKey: ['gmail'], queryFn: fetcher('/gmail/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useFitness = () =>
  useQuery({ queryKey: ['fitness'], queryFn: fetcher('/fitness/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useLetterboxd = () =>
  useQuery({ queryKey: ['letterboxd'], queryFn: fetcher('/letterboxd/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useSteam = () =>
  useQuery({ queryKey: ['steam'], queryFn: fetcher('/steam/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useRiot = () =>
  useQuery({ queryKey: ['riot'], queryFn: fetcher('/riot/cached'), staleTime: STALE, refetchInterval: INTERVAL });

export const useDataSources = () =>
  useQuery({
    queryKey: ['data-sources'],
    queryFn: () => api.get('/data-sources').then((r) => r.data.sources || []),
    staleTime: 30 * 1000,
  });
