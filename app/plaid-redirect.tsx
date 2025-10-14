import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
// import { useInvalidateBanks } from '@/hooks/bank';

export default function PlaidRedirectScreen() {
  const router = useRouter();
  // const invalidateBanks = useInvalidateBanks();

  useEffect(() => {
    // Invalidate banks to refetch the list after a successful Plaid flow
    // invalidateBanks();
    // Navigate back to the main screen
    router.replace('/(tabs)');
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
