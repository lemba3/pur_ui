import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';
import { pusher } from '@/lib/pusher';
import { useRouter } from 'expo-router';
import InputModal from '@/components/ui/input-modal';
import Button from '@/components/ui/button';

import { useAuth } from '@/hooks/useAuth';
import { myConstants } from '@/constants/my-constants';
import { useConnectedBanks, ConnectedBank, useInvalidateBanks } from '@/hooks/bank';
import { useGenerateReport } from '@/hooks/report';

export default function HomeScreen() {
  const { data: connectedBanks, isLoading: isFetchingBanks } = useConnectedBanks();
  const invalidateBanks = useInvalidateBanks();
  const { mutate: generateReport, isPending: isVerifying } = useGenerateReport();
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  const { session, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    console.log('[Debug] Component effect running, auth loading:', isAuthLoading, 'has session:', !!session);

    // Clean up function - extracted to be used both on unmount and when session becomes null
    const cleanupPusherSubscription = (userId: string) => {
      const channelName = `user-${userId}`;
      console.log('[Debug] Cleaning up Pusher subscription for channel:', channelName);
      const channel = pusher.channel(channelName);
      if (channel) {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
        console.log('[Debug] Successfully cleaned up Pusher subscription');
      }
    };

    // If we're loading or no session (including logout), cleanup and return
    if (isAuthLoading || !session) {
      if (!isAuthLoading && !session) {
        // This case specifically handles logout
        const channels = pusher.channels;
        for (const channelName in channels.channels) {
          if (channelName.startsWith('user-')) {
            const userId = channelName.replace('user-', '');
            cleanupPusherSubscription(userId);
          }
        }
      }
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${session.token.accessToken}`;

    const channelName = `user-${session.user.id}`;

    // Check if we're already subscribed
    const existingChannel = pusher.channel(channelName);
    if (existingChannel) {
      console.log('[Debug] Channel already exists, skipping subscription');
      return;
    }

    console.log('[Debug] Creating new Pusher subscription for channel:', channelName);
    const channel = pusher.subscribe(channelName);

    const handleItemAdded = () => {
      console.log('[Debug] Pusher event received: item-added');
      invalidateBanks();
    };

    channel.bind('item-added', handleItemAdded);

    // This cleanup runs on both unmount and when session changes/becomes null
    return () => {
      if (session?.user?.id) {
        cleanupPusherSubscription(session.user.id);
      }
    };
  }, [isAuthLoading, session, invalidateBanks]);

  const handleAddBank = useCallback(() => {
    router.push('/plaid-hosted-link');
  }, [router]);

  const handleGenerateReport = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleVerifyAmount = useCallback((amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Error: Please enter a valid positive amount.");
      return;
    }
    setModalVisible(false);
    generateReport(numericAmount);
  }, [generateReport]);

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

  const isBusy = isVerifying;

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
          <Button
            onPress={handleAddBank}
            title="Add Bank"
          />
          <Button
            onPress={handleGenerateReport}
            title="Verify Balance"
            isLoading={isVerifying}
            disabled={isBusy || !connectedBanks || connectedBanks.length === 0}
            style={{ flex: 1 }}
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
});