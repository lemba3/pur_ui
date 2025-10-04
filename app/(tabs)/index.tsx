import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Button, View, Text, Alert, FlatList, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { create, open, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';

import * as Application from 'expo-application';

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
  const [packageName, setPackageName] = useState<string | null>(null);

  useEffect(() => {
    const getPackageName = async () => {
      const androidPackageName = Application.applicationId;
      setPackageName(androidPackageName);
    };
    getPackageName();
  }, []);

  const fetchConnectedBanks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('http://localhost:3000/api/plaid/items');
      setConnectedBanks(response.data);
    } catch (error: any) {
      console.error('Error fetching connected banks:', error.response?.data || error.message);
      Alert.alert("Error", "Could not fetch connected banks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnectedBanks();
  }, [fetchConnectedBanks]);

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
        Alert.alert("Error", "Failed to get link token.");
        setIsLoading(false);
        return;
      }

      console.log('Calling create() with link token...');
      create({ token: linkToken });
      console.log('create() called.');

      console.log('Calling open()...');
      open({
        onSuccess: async (success: LinkSuccess) => {
          console.log('Plaid link success:', success);
          try {
            await api.post('http://localhost:3000/api/plaid/exchange-public-token', { public_token: success.publicToken });
            Alert.alert("Success", "Bank account linked successfully!");
            fetchConnectedBanks(); // Refresh the list of banks
          } catch (error: any) {
            console.error('Error exchanging public token:', error.response?.data || error.message);
            Alert.alert("Error", "Could not link bank account.");
          }
        },
        onExit: (exit: LinkExit) => {
          console.log('Plaid link exit:', exit);
          if (exit.error) {
            Alert.alert("Error", JSON.stringify(exit.error));
          }
        },
      });
      console.log('open() called.');

    } catch (error: any) {
      console.error('Error in handleAddBank:', error.response?.data || error.message);
      Alert.alert("Error", "An error occurred while adding the bank.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchConnectedBanks]);

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
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Connected Banks ({packageName})</ThemedText>

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

        <FlatList
          data={connectedBanks}
          renderItem={renderBankItem}
          keyExtractor={(item) => item.itemId}
          ListEmptyComponent={() => (
            !isLoading && (
              <View style={styles.emptyListContainer}>
                <ThemedText>No banks connected yet.</ThemedText>
              </View>
            )
          )}
        />

        <Button
          title="Add Bank"
          onPress={handleAddBank}
          disabled={isLoading}
        />
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
    // padding: 16,
    // gap: 16,
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
});