import React, { useState, useCallback } from 'react';
import { StyleSheet, Button, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';
import { create, open, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';

export default function TestScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBank = useCallback(async () => {
    console.log('handleAddBank called');
    setIsLoading(true);
    try {
      console.log('Fetching link token...');
      const response = await api.post('http://localhost:3000/api/plaid/create-link-token');
      const linkToken = response.data.link_token;
      console.log('Link token received:', linkToken);

      if (!linkToken) {
        console.error('Link token is null or undefined');
        console.error("Error: Failed to get link token.");
        setIsLoading(false);
        return;
      }

      console.log('Calling create() with link token...');
      create({ token: linkToken, noLoadingState: false });
      console.log('create() called.');

      console.log('Calling open()...');
      open({
        onSuccess: async (success: LinkSuccess) => {
          setTimeout(async () => {
            console.log('Plaid link success:', success);
            try {
              await api.post('http://localhost:3000/api/plaid/exchange-public-token', { public_token: success.publicToken });
              console.log("Success: Bank account linked successfully!");
            } catch (error: any) {
              console.error('Error exchanging public token:', error.response?.data || error.message);
              console.error("Error: Could not link bank account.", error.response?.data || error.message);
            }
          }, 500);
        },
        onExit: (exit: LinkExit) => {
          setTimeout(() => {
            console.log('Plaid link exit:', exit);
            if (exit.error) {
              console.error("Plaid Link Exit Error:", JSON.stringify(exit.error));
            }
          }, 500);
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.DEBUG, // log more for debugging
      });
      console.log('open() called.');

    } catch (error: any) {
      console.error('Error in handleAddBank:', error.response?.data || error.message);
      console.error("Error: An error occurred while adding the bank.", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <ThemedView style={styles.container}>

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

        <View style={styles.buttonContainer}>
          <Button
            title="Add Bank"
            onPress={handleAddBank}
            disabled={isLoading}
          />
        </View>
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
  },
  buttonContainer: {
    gap: 8,
  },
});