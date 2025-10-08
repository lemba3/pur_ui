import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Button, View, FlatList, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';
import { create, open, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';
import { useRouter } from 'expo-router';
import InputModal from '@/components/ui/input-modal';

import { useAuth } from '@/hooks/useAuth';

interface ConnectedBank {
  itemId: string;
  institution: {
    name: string;
    logo?: string;
  };
}

export default function HomeScreen() {
  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const fetchConnectedBanks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('http://localhost:3000/api/plaid/items');
      setConnectedBanks(response.data);
    } catch (error: any) {
      console.error('Error fetching connected banks:', error.response?.data || error.message);
      console.error("Error: Could not fetch connected banks.", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { session, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && session) {
      fetchConnectedBanks();
    }
  }, [fetchConnectedBanks, isAuthLoading, session]);

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
          console.log("onSuccess of open function called")
          setTimeout(async () => {
            console.log('Plaid link success:', success);
            try {
              await api.post('http://localhost:3000/api/plaid/exchange-public-token', { public_token: success.publicToken });
              console.log("Success: Bank account linked successfully!"); fetchConnectedBanks(); // Refresh the list of banks
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
  }, [fetchConnectedBanks]);

  const handleGenerateReport = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleVerifyAmount = useCallback(async (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Error: Please enter a valid positive amount.");
      return;
    }

    setModalVisible(false);
    setIsLoading(true);
    try {
      const response = await api.post('http://localhost:3000/api/plaid/generate-report', { amount: numericAmount });
      const { accounts, requestIds, ...rest } = response.data;
      console.log("my requestIds", requestIds);
      router.push({
        pathname: '/verification-result',
        params: {
          ...rest,
          accounts: JSON.stringify(accounts),
          requestIds: JSON.stringify(requestIds),
        },
      });
    } catch (error: any) {
      console.error('Error verifying amount:', error.response?.data || error.message);
      console.error("Error: Could not verify amount.", error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const renderBankItem = ({ item }: { item: ConnectedBank }) => (
    <View style={styles.bankItemContainer}>
      {item.institution.logo && (
        <Image
          source={{ uri: `data:image/png;base64,${item.institution.logo}` }}
          style={styles.bankLogo}
        />
      )}
      <ThemedText>{item.institution.name}</ThemedText>
    </View>
  );

  return (
    <>
      <ThemedView style={styles.container}>

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

        {!isLoading && (
          <FlatList
            data={connectedBanks}
            renderItem={renderBankItem}
            keyExtractor={(item) => item.itemId}
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <ThemedText>No banks connected yet.</ThemedText>
              </View>
            )}
          />
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Add Bank"
            onPress={handleAddBank}
            disabled={isLoading}
          />
          <Button
            title="Verify Balance"
            onPress={handleGenerateReport}
            disabled={isLoading || connectedBanks.length === 0}
          />
        </View>
      </ThemedView>
      <InputModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleVerifyAmount}
        title="Verify Account Balance"
        inputLabel="Amount to Verify"
        submitButtonText="Verify"
      />
    </>
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
  },
  bankItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  bankLogo: {
    width: 40,
    height: 40,
    marginRight: 16,
    resizeMode: 'contain',
  },
  emptyListContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    gap: 8,
  },
});