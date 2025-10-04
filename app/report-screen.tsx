import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import api from '@/lib/api';

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLS = 20; // Poll for a maximum of 60 seconds

export default function ReportScreen() {
  const { asset_report_token } = useLocalSearchParams<{ asset_report_token: string }>();
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!asset_report_token) {
      setError('No report token provided.');
      return;
    }

    const intervalId = setInterval(async () => {
      if (pollCount >= MAX_POLLS) {
        clearInterval(intervalId);
        setError('Report generation timed out. Please try again.');
        return;
      }

      try {
        const response = await api.post('http://localhost:3000/api/plaid/get-report', { asset_report_token });
        setReport(response.data);
        clearInterval(intervalId); // Stop polling on success
      } catch (e: any) {
        if (e.response?.status === 202 && e.response?.data?.status === 'NOT_READY') {
          // It's not ready yet, just continue polling
          setPollCount(prev => prev + 1);
        } else {
          // A real error occurred
          clearInterval(intervalId);
          setError(e.response?.data?.error || 'An error occurred while fetching the report.');
          console.error('Error fetching report:', e.response?.data || e.message);
        }
      }
    }, POLLING_INTERVAL);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [asset_report_token, pollCount]);

  const renderContent = () => {
    if (error) {
      return <ThemedText style={styles.errorText}>Error: {error}</ThemedText>;
    }

    if (!report) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>
            Generating report... This may take a moment.
          </ThemedText>
          <ThemedText style={styles.loadingSubText}>
            (Attempt {pollCount + 1} of {MAX_POLLS})
          </ThemedText>
        </View>
      );
    }

    // For now, just display the raw JSON.
    // In a real app, you would format this nicely.
    return (
      <ScrollView>
        <ThemedText style={styles.jsonText}>
          {JSON.stringify(report, null, 2)}
        </ThemedText>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Asset Report' }} />
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  loadingSubText: {
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  jsonText: {
    fontFamily: 'monospace', // Use a monospace font for JSON
  },
});
