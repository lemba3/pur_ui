import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';

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

const generateReport = async ({
  amount,
  plaidItemId,
  accountId,
  fullName,
  bankAccountName,
  purposeOfVerification
}: {
  amount: number;
  plaidItemId: string;
  accountId: string;
  fullName: string;
  bankAccountName: string;
  purposeOfVerification: string;
}) => {
  const response = await api.post('/plaid/generate-report', {
    amount,
    itemId: plaidItemId,
    accountId,
    fullName,
    bankAccountName,
    purposeOfVerification
  });
  return response.data;
};

export const useGenerateReport = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: generateReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports', session?.token.accessToken] });
      queryClient.invalidateQueries({ queryKey: ['connectedBanks', session?.token.accessToken] });

      router.push({
        pathname: '/verification-result',
        params: {
          reportId: data.reportId,
          sufficient: String(data.sufficient),
          requestedAmount: String(data.requestedAmount),
          bankNames: data.bankNames.join(','),
          userName: data.fullName, // Use fullName from the form
          generatedAt: data.generatedAt,
          accounts: JSON.stringify(data.accounts),
          requestId: data.requestIds[0] || '',
          // Pass new fields
          fullName: data.fullName,
          bankAccountName: data.bankAccountName,
          purposeOfVerification: data.purposeOfVerification,
        },
      });
    },
    onError: (error: any) => {
      console.error("Error: Could not verify amount.", error.response?.data?.error || error.message);
    },
  });
};

// Fetcher for a single report by ID
const fetchReportById = async ({ queryKey }: { queryKey: readonly (string | undefined)[] }) => {
  const [_key, reportId, token] = queryKey;
  if (!token) throw new Error("No token provided");
  if (!reportId) throw new Error("Report ID not provided");

  const response = await api.get(`/report/${reportId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const useGetReport = (reportId: string | undefined) => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['getReport', reportId, session?.token.accessToken],
    queryFn: fetchReportById,
    enabled: !!reportId && !!session?.token.accessToken,
  });
};