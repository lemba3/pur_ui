import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import api from '@/lib/api';
import { useInvalidateBanks } from '@/hooks/bank';

export default function PlaidWebviewScreen() {
  const router = useRouter();
  const invalidateBanks = useInvalidateBanks();
  const [plaidUrl, setPlaidUrl] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await api.post('/plaid/create-link-token');
        const token = response.data.link_token;
        setPlaidUrl(`https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${token}`);
      } catch (error: any) {
        console.error("Error: Failed to get link token.", error.response?.data || error.message);
        router.back();
      }
    };
    createLinkToken();
  }, []);

  const handleMessage = async (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.eventName === 'SUCCESS') {
      const publicToken = data.metadata.public_token;
      try {
        await api.post('/plaid/exchange-public-token', { public_token: publicToken });
        console.log("Success: Bank account linked successfully!");
        invalidateBanks();
      } catch (error: any) {
        console.error("Error: Could not exchange public token.", error.response?.data || error.message);
      } finally {
        router.back();
      }
    } else if (data.eventName === 'EXIT') {
      router.back();
    }
  };

  if (!plaidUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: plaidUrl }}
      onMessage={handleMessage}
    />
  );
}
