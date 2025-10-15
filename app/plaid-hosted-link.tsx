import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser'; // Use WebBrowser for Hosted Link
import api from '@/lib/api';

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

        const result = await WebBrowser.openBrowserAsync(hosted_link_url);

        if (!isMounted) return;

        // Handle different WebBrowser results
        if (result.type === 'cancel') {
          // User explicitly cancelled
          router.back();
          return;
        }

        // Navigate back to tabs and prevent back navigation
        await router.replace('/(tabs)');
        await router.push('/(tabs)');
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