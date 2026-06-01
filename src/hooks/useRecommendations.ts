import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchRecommendations } from '@store/slices/analytics.slice';
import { Recommendation } from '@/types/health.types';

export const useRecommendations = () => {
  const dispatch = useAppDispatch();
  const { recommendations, isLoading } = useAppSelector((s) => s.analytics);

  const load = useCallback(() => dispatch(fetchRecommendations()), [dispatch]);

  useEffect(() => {
    if (recommendations.length === 0) load();
  }, []);

  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const byType = (type: Recommendation['type']) => recommendations.filter((r) => r.type === type);

  return {
    recommendations,
    highPriority,
    isLoading,
    load,
    byType,
  };
};
