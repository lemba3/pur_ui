import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser'; // Use WebBrowser for Hosted Link
import api from '@/lib/api';

export default function PlaidHostedLinkScreen() {
  const router = useRouter();
  const [plaidUrl, setPlaidUrl] = useState<string | null>(null);

  useEffect(() => {
    const openPlaidLink = async () => {
      try {
        const response = await api.post('/plaid/create-link-token');
        const { hosted_link_url } = response.data;
        setPlaidUrl(hosted_link_url); // Store the URL to display loading indicator
        const result = await WebBrowser.openBrowserAsync(hosted_link_url);

        // This will be called when the browser is dismissed by the user
        if (result.type === 'cancel' || result.type === 'dismiss') {
          router.back();
        }
      } catch (error: any) {
        console.error("Error: Failed to get link token.", error.response?.data || error.message);
        router.back();
      }
    };

    openPlaidLink();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}