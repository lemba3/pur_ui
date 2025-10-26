import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';

export default function PlaidRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    // You can add logic here to check for success/failure parameters from Plaid if they add any to the URL

    // For now, we'll just show a success message and redirect to the home screen.
    setTimeout(() => {
      // router.replace('/(tabs)');
      router.back();
    }, 2000);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <ThemedText style={{ marginTop: 16 }}>Finalizing connection...</ThemedText>
    </View>
  );
}
