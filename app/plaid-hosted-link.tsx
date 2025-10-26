import { View, ActivityIndicator, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

export default function PlaidHostedLinkScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const openPlaidLink = async () => {
      try {
        setIsLoading(true);
        const response = await api.post('/plaid/create-link-token');
        const { hosted_link_url } = response.data;

        if (!isMounted) return;

        // Open in the system browser, which handles universal links reliably.
        await Linking.openURL(hosted_link_url);

        // The user will be returned to the app via the universal link.
        // We can navigate back immediately so this screen isn't in the back stack.
        router.back();

      } catch (error: any) {
        if (!isMounted) return;
        console.error("Error: Failed to get link token.", error.response?.data || error.message);
        setError("Failed to initialize bank connection");
        setIsLoading(false);

        // Navigate back after showing error
        setTimeout(() => {
          if (isMounted) {
            router.back();
          }
        }, 1500);
      }
    };

    openPlaidLink();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoading && <ActivityIndicator size="large" />}
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
    </View>
  );
}