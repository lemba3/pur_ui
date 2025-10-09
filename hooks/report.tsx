import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';

// The fetcher function for useInfiniteQuery
const fetchReports = async ({ pageParam = 1, queryKey }: { pageParam?: number, queryKey: readonly (string | undefined)[] }) => {
  const [_key, token] = queryKey;
  if (!token) throw new Error("No token provided");

  const response = await api.get('/report', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      page: pageParam,
      pageSize: 10,
    },
  });
  return response.data;
};

export const useReports = () => {
  const { session } = useAuth();

  const queryInfo = useInfiniteQuery({
    queryKey: ['reports', session?.token.accessToken],
    queryFn: fetchReports,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const currentPage = lastPage.pagination.page;
      const totalPages = lastPage.pagination.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!session?.token.accessToken,
  });

  return {
    ...queryInfo,
    // Flatten the pages for easier consumption in the component
    reports: queryInfo.data?.pages.flatMap(page => page.reports) ?? [],
  };
};
