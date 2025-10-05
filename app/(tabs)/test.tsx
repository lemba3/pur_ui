import React, { useState, useCallback } from 'react';
import { StyleSheet, Button, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { create, open, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';

export default function TestScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBank = useCallback(async () => {
    console.log('--- Test Screen: handleAddBank called ---');
    setIsLoading(true);
    try {
      console.log('--- Test Screen: Fetching link token... ---');
      const response = await api.post('http://localhost:3000/api/plaid/create-link-token');
      const linkToken = response.data.link_token;
      console.log('--- Test Screen: Link token received: ---', linkToken);

      if (!linkToken) {
        console.error('--- Test Screen: Link token is null or undefined ---');
        setIsLoading(false);
        return;
      }

      console.log('--- Test Screen: Calling create() with link token... ---');
      create({
        token: linkToken,
        noLoadingState: false,
      });
      console.log('--- Test Screen: create() called. ---');

      console.log('--- Test Screen: Calling open()... ---');
      open({
        onSuccess: (success: LinkSuccess) => {
          console.log('--- Test Screen: Plaid link success: ---', success);
          // Simplified: just log success
        },
        onExit: (exit: LinkExit) => {
          console.log('--- Test Screen: Plaid link exit: ---', exit);
          if (exit.error) {
            console.error("--- Test Screen: Plaid Link Exit Error: ---", JSON.stringify(exit.error));
          }
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.DEBUG,
      });
      console.log('--- Test Screen: open() called. ---');

    } catch (error: any) {
      console.error('--- Test Screen: Error in handleAddBank: ---', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Plaid Test</ThemedText>

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

        <View style={styles.buttonContainer}>
          <Button
            title="Start Plaid"
            onPress={handleAddBank}
            disabled={isLoading}
          />
        </View>
        <ThemedText>
          Click the button to start the Plaid Link flow. Check the console for logs.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
