import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Stack } from 'expo-router';

export default function ReportScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Report' }} />
      <ThemedView style={styles.container}>
        {/* Screen is intentionally blank as per requirement */}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 8,
  },
});
