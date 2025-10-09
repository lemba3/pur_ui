import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';
import { create, open, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';
import { useRouter } from 'expo-router';
import InputModal from '@/components/ui/input-modal';

import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { myConstants } from '@/constants/my-constants';

interface ConnectedBank {
  itemId: string;
  institution: {
    name: string;
    logo?: string;
  };
}

export default function HomeScreen() {
  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>([]);
  const [isFetchingBanks, setIsFetchingBanks] = useState(true);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  const fetchConnectedBanks = useCallback(async () => {
    setIsFetchingBanks(true);
    try {
      const response = await api.get('/plaid/items');
      // console.log('--- बैंक डेटा ---:\n', JSON.stringify(response.data, null, 2));
      setConnectedBanks(response.data);
    } catch (error: any) {
      console.error('Error fetching connected banks:', error.response?.data || error.message);
      console.error("Error: Could not fetch connected banks.", error.response?.data || error.message);
    } finally {
      setIsFetchingBanks(false);
    }
  }, []);

  const { session, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && session) {
      api.defaults.headers.common['Authorization'] = `Bearer ${session.token.accessToken}`;
      fetchConnectedBanks();
    } else if (!isAuthLoading && !session) {
      // Clear Authorization header if session is null (e.g., after signOut)
      delete api.defaults.headers.common['Authorization'];
    }
  }, [fetchConnectedBanks, isAuthLoading, session]);

  const handleAddBank = useCallback(async () => {
    console.log('handleAddBank called');
    setIsAddingBank(true);
    try {
      console.log('Fetching link token...');
      const response = await api.post('/plaid/create-link-token');
      const linkToken = response.data.link_token;
      console.log('Link token received:', linkToken);

      if (!linkToken) {
        console.error('Link token is null or undefined');
        console.error("Error: Failed to get link token.");
        setIsAddingBank(false);
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
              await api.post('/plaid/exchange-public-token', { public_token: success.publicToken });
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
      setIsAddingBank(false);
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
    setIsVerifying(true);
    try {
      const response = await api.post('/plaid/generate-report', { amount: numericAmount });
      const { accounts, requestIds, ...rest } = response.data;

      // const bankNames = [...new Set(connectedBanks.map(b => b.institution.name))];

      router.push({
        pathname: '/verification-result',
        params: {
          ...rest,
          bankNames: JSON.stringify(rest.bankNames),
        },
      });
    } catch (error: any) {
      console.error('Error verifying amount:', error.response?.data || error.message);
      console.error("Error: Could not verify amount.", error.response?.data?.error || error.message);
    } finally {
      setIsVerifying(false);
    }
  }, [router]);

  const renderBankItem = ({ item }: { item: ConnectedBank }) => (
    <View style={styles.bankItemContainer}>
      {item.institution.logo ? (
        <Image
          source={{ uri: `data:image/png;base64,${item.institution.logo}` }}
          style={styles.bankLogo}
        />
      ) : (
        <Image
          source={{ uri: `data:image/png;base64,${myConstants.BANKLOGO.default}` }}
          style={styles.bankLogo}
        />
      )}
      <ThemedText>{item.institution.name}</ThemedText>
    </View>
  );

  const isBusy = isAddingBank || isVerifying;

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={styles.bankListContainer}>
          {isFetchingBanks && <ActivityIndicator size="large" color="#0000ff" />}

          {!isFetchingBanks && (
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
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: currentColors.tint, opacity: isBusy ? 0.6 : 1 },
            ]}
            onPress={handleAddBank}
            disabled={isBusy}
          >
            {isAddingBank ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Add Bank</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: currentColors.tint, opacity: isBusy ? 0.6 : 1 },
            ]}
            onPress={handleGenerateReport}
            disabled={isBusy || connectedBanks.length === 0}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Balance</Text>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
      <InputModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleVerifyAmount}
        title="Verify Account Balance"
        inputLabel="Amount to Verify"
        submitButtonText="Verify"
        isLoading={isVerifying}
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
    flexDirection: 'row',
  },
  bankListContainer: {
    flex: 1,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});