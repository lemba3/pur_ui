import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchAboutContent = async () => {
  const response = await api.get('/about');
  return response.data.content;
};

const fetchPrivacyPolicyContent = async () => {
  const response = await api.get('/privacy-policy');
  return response.data.content;
};

export const useAboutContent = () => {
  return useQuery<string>({
    queryKey: ['aboutContent'],
    queryFn: fetchAboutContent,
  });
};

export const usePrivacyPolicyContent = () => {
  return useQuery<{ type: string; text: string }[]>({
    queryKey: ['privacyPolicyContent'],
    queryFn: fetchPrivacyPolicyContent,
  });
};
