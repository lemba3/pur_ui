import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';

export interface ConnectedBank {
  itemId: string;
  institution: {
    name: string;
    logo?: string;
  };
}

const fetchConnectedBanks = async ({ queryKey }: { queryKey: readonly (string | undefined)[] }): Promise<ConnectedBank[]> => {
  const [_key, token] = queryKey;
  if (!token) throw new Error("No token provided");

  const response = await api.get('/plaid/items', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const useConnectedBanks = () => {
  const { session } = useAuth();

  const queryInfo = useQuery({
    queryKey: ['connectedBanks', session?.token.accessToken],
    queryFn: fetchConnectedBanks,
    enabled: !!session?.token.accessToken,
  });

  return queryInfo;
};

export const useInvalidateBanks = () => {
    const queryClient = useQueryClient();
    const { session } = useAuth();
    return () => {
        queryClient.invalidateQueries({ queryKey: ['connectedBanks', session?.token.accessToken] });
    }
}
