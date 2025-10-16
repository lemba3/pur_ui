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
import { useConnectedBanks, useInvalidateBanks } from '@/hooks/bank';
import { useGenerateReport } from '@/hooks/report';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { myColors } from '@/constants/my-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { data: connectedBanks, isLoading: isFetchingBanks } = useConnectedBanks();
  const invalidateBanks = useInvalidateBanks();
  const { mutate: generateReport, isPending: isVerifying } = useGenerateReport();
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedBankName, setSelectedBankName] = useState<string>('');

  const { session, isLoading: isAuthLoading } = useAuth();
  const currentColors = Colors['light'];

  const gradientColors: readonly [string, string, ...string[]] = [myColors.gradient1, myColors.gradient2]; // soft light gradient

  useEffect(() => {
    console.log('[Debug] Component effect running, auth loading:', isAuthLoading, 'has session:', !!session);

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

    if (isAuthLoading || !session) {
      if (!isAuthLoading && !session) {
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

    return () => {
      if (session?.user?.id) {
        cleanupPusherSubscription(session.user.id);
      }
    };
  }, [isAuthLoading, session, invalidateBanks]);

  const handleAddBank = useCallback(() => {
    router.push({
      pathname: '/plaid-hosted-link',
      params: {
        redirect: '/(tabs)'
      }
    });
  }, [router]);

  const handleVerifyAmount = useCallback((value: { amount: string }) => {
    const numericAmount = parseFloat(value.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Error: Please enter a valid positive amount.");
      return;
    }
    if (!selectedItemId) {
      console.error("No bank selected");
      return;
    }
    setModalVisible(false);
    generateReport({ amount: numericAmount, plaidItemId: selectedItemId });
    setSelectedItemId(null);
    setSelectedBankName('');
  }, [generateReport, selectedItemId]);

  const handleVerifyForBank = useCallback((itemId: string, bankName: string) => {
    setSelectedItemId(itemId);
    setSelectedBankName(bankName);
    setModalVisible(true);
  }, []);

  const renderBankItem = ({ item }: { item: any }) => (
    <ThemedView style={[styles.bankItemCard, { backgroundColor: currentColors.cardBackground, marginTop: 12, }]}>
      <View style={styles.bankItemHeader}>
        {item.institution.logo ? (
          <Image
            source={{ uri: `data:image/png;base64,${item.institution.logo}` }}
            style={styles.bankItemLogo}
          />
        ) : (
          <MaterialCommunityIcons
            name="bank-outline"
            size={32}
            color={currentColors.icon}
            style={styles.bankItemLogo}
          />
        )}
        <View style={styles.bankItemInfo}>
          <ThemedText style={styles.bankItemInstitutionName}>{item.institution.name}</ThemedText>
          <ThemedText style={styles.bankItemLastSyncText}>
            <MaterialCommunityIcons name="update" size={12} color={currentColors.icon} /> Last sync: {item.last_sync ? new Date(item.last_sync).toLocaleDateString() : 'N/A'}
          </ThemedText>
        </View>
      </View>
      {item.accounts && item.accounts.length > 0 && (
        <View style={styles.accountsContainer}>
          {item.accounts.map((account: any) => (
            <View key={account.account_id} style={styles.bankItemAccountItem}>
              <ThemedText style={styles.bankItemAccountName}>{account.name}</ThemedText>
              <View style={styles.bankItemAccountDetails}>
                <ThemedText style={styles.bankItemAccountSubtype}>{account.subtype}</ThemedText>
                <ThemedText style={styles.bankItemAccountMask}>•••• {account.mask}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
      <Button
        onPress={() => handleVerifyForBank(item.itemId, item.institution.name)}
        title="Report"
        isLoading={isVerifying && selectedItemId === item.itemId}
        disabled={isVerifying}
        style={[styles.verifyButton, { marginTop: 15 }]} // Added marginTop for spacing
        icon={<MaterialCommunityIcons name="file-chart-outline" size={24} color="#fff" />}
      />
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>My Banks</ThemedText>
          <ThemedText type="subtitle" style={styles.headerSubtitle}>Manage your connected financial institutions</ThemedText>
        </View>

        <View style={styles.bankListContainer}>
          {isFetchingBanks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentColors.tint} />
              <ThemedText style={{ marginTop: 10 }}>Loading Banks...</ThemedText>
            </View>
          ) : (
            <FlatList
              data={connectedBanks}
              renderItem={renderBankItem}
              keyExtractor={(item) => item.itemId}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }} // Added paddingTop
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <MaterialCommunityIcons name="bank-plus" size={50} color={currentColors.icon} />
                  <ThemedText style={styles.emptyListText}>No banks connected yet.</ThemedText>
                  <ThemedText style={{ opacity: 0.7, textAlign: 'center', marginTop: 5 }}>Tap &quot;Add Bank&quot; to get started.</ThemedText>
                </View>
              )}
            />
          )}
        </View>

        <View style={[styles.buttonContainer, { marginTop: 10 }]}>
          <Button
            onPress={handleAddBank}
            title="Add Bank"
            style={[styles.addBankButton, { backgroundColor: currentColors.tint }]}
            textStyle={styles.addBankButtonText}
            icon={<MaterialCommunityIcons name="plus-circle-outline" size={24} color="#fff" />} />
        </View>

        <InputModal
          visible={isModalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedItemId(null);
            setSelectedBankName('');
          }}
          onSubmit={handleVerifyAmount}
          title={`Verify Balance - ${selectedBankName}`}
          inputLabel="Amount to Verify"
          submitButtonText="Verify"
          isLoading={isVerifying}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 30, // Adjust for status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
  },
  bankListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankItemCard: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 5, // Android shadow
  },
  bankItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  bankItemInfo: {
    flex: 1,
    marginRight: 15,
  },
  bankItemInstitutionName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  bankItemLastSyncText: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  bankItemLogo: {
    width: 45,
    height: 45,
    marginRight: 15,
    resizeMode: 'contain',
  },
  accountsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)', // Subtle separator
    paddingTop: 10,
  },
  bankItemAccountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bankItemAccountName: {
    fontWeight: '500',
    fontSize: 15,
  },
  bankItemAccountDetails: {
    alignItems: 'flex-end',
  },
  bankItemAccountSubtype: {
    textTransform: 'capitalize',
    fontSize: 13,
    opacity: 0.7,
  },
  bankItemAccountMask: {
    fontSize: 13,
    opacity: 0.7,
  },
  verifyButton: {
    minWidth: 90,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  emptyListContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
  addBankButton: {
    height: 55,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 5,
    width: '80%',
    alignSelf: 'center',
  },
  addBankButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});