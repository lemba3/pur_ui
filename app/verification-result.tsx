import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';

// Define a type for the account data for clarity
type Account = {
  name: string;
  mask: string;
  balance: number;
};

export default function VerificationResultScreen() {
  const params = useLocalSearchParams<{
    sufficient: string;
    totalBalance: string;
    requestedAmount: string;
    currency: string;
    accounts: string; // This will be a JSON string
    requestIds: string; // This will also be a JSON string
  }>();

  // Parse the parameters
  const sufficient = params.sufficient === 'true';
  const totalBalance = params.totalBalance ? parseFloat(params.totalBalance) : 0;
  const requestedAmount = params.requestedAmount ? parseFloat(params.requestedAmount) : 0;
  const currency = params.currency || 'USD';
  const accounts: Account[] = params.accounts ? JSON.parse(params.accounts) : [];
  const requestIds: string[] = params.requestIds ? JSON.parse(params.requestIds) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Verification Result' }} />

      <View style={styles.summaryContainer}>
        <Ionicons
          name={sufficient ? 'checkmark-circle' : 'close-circle'}
          size={80}
          color={sufficient ? '#28a745' : '#dc3545'}
        />
        <ThemedText style={[styles.statusText, { color: sufficient ? '#28a745' : '#dc3545' }]}>
          {sufficient ? 'Sufficient Funds' : 'Insufficient Funds'}
        </ThemedText>
        <ThemedText style={styles.summaryText}>
          Requested amount of {formatCurrency(requestedAmount)} was compared against a total available balance of {formatCurrency(totalBalance)}.
        </ThemedText>
        {requestIds.length > 0 && (
          <View style={styles.requestIdsContainer}>
            <ThemedText style={styles.requestIdsHeader}>Request IDs:</ThemedText>
            {requestIds.map((id, index) => (
              <ThemedText key={index} style={styles.requestIdText} selectable>{id}</ThemedText>
            ))}
          </View>
        )}
      </View>

      <ThemedText style={styles.detailsHeader}>Account Details:</ThemedText>
      <ScrollView style={styles.detailsContainer}>
        {accounts.map((account, index) => (
          <ThemedView key={index} style={styles.accountItem}>
            <View>
              <ThemedText style={styles.accountName}>{account.name}</ThemedText>
              <ThemedText style={styles.accountMask}>**** {account.mask}</ThemedText>
            </View>
            <ThemedText style={styles.accountBalance}>{formatCurrency(account.balance || 0)}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statusText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  detailsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountMask: {
    fontSize: 14,
    color: '#888',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestIdsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  requestIdsHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  requestIdText: {
    fontSize: 12,
    color: '#555',
  },
});
