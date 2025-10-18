import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Image, ActivityIndicator, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import api from '@/lib/api';
import { pusher } from '@/lib/pusher';
import { useRouter } from 'expo-router';
import Button from '@/components/ui/button';
import { z, ZodError } from 'zod';

import { useAuth } from '@/hooks/useAuth';
import { useConnectedBanks, useInvalidateBanks } from '@/hooks/bank';
import { useGenerateReport } from '@/hooks/report';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';

const reportSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  bankAccountName: z.string().min(1, 'Bank account name is required'),
  purpose: z.string().min(1, 'Purpose of verification is required'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  accountId: z.string().min(1, 'An account must be selected'),
});

export default function HomeScreen() {
  const { data: connectedBanks, isLoading: isFetchingBanks } = useConnectedBanks();
  const invalidateBanks = useInvalidateBanks();
  const { mutate: generateReport, isPending: isGeneratingReport } = useGenerateReport();
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{ plaidItemId: string; accountId: string } | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const allAccounts = useMemo(() => {
    if (!connectedBanks) return [];
    return connectedBanks.flatMap(bank =>
      bank.accounts.map(account => ({
        ...account,
        plaidItemId: bank.itemId,
        bankName: bank.institution.name,
        bankLogo: bank.institution.logo,
      }))
    );
  }, [connectedBanks]);

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
      params: { redirect: '/(tabs)' }
    });
  }, [router]);

  const handleGenerateReport = useCallback(() => {
    try {
      const validatedData = reportSchema.parse({
        fullName,
        bankAccountName,
        purpose,
        amount,
        accountId: selectedAccount?.accountId,
      });
      setErrors({});
      generateReport({
        amount: validatedData.amount,
        plaidItemId: selectedAccount!.plaidItemId, // Non-null assertion is safe here due to schema validation
        accountId: validatedData.accountId,
        fullName: validatedData.fullName,
        bankAccountName: validatedData.bankAccountName,
        purposeOfVerification: validatedData.purpose,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.flatten().fieldErrors;
        setErrors(formattedErrors);
        console.error("Validation errors:", formattedErrors);
      }
    }
  }, [generateReport, selectedAccount, fullName, bankAccountName, purpose, amount]);

  const renderAccountItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedAccount({ plaidItemId: item.plaidItemId, accountId: item.account_id })}
      style={[
        styles.accountItem,
        selectedAccount?.accountId === item.account_id && styles.selectedAccountItem
      ]}
    >
      <View style={styles.accountItemRow1}>
        {item.bankLogo ? (
          <Image
            source={{ uri: `data:image/png;base64,${item.bankLogo}` }}
            style={styles.bankLogo}
          />
        ) : (
          <MaterialCommunityIcons
            name="bank-outline"
            size={20}
            color={Colors.dark.cardText}
            style={{ marginRight: 8 }}
          />
        )}
        <ThemedText style={styles.bankName} numberOfLines={1}>{item.bankName}</ThemedText>
      </View>
      <ThemedText style={styles.accountSubtype}>{item.name || item.subtype}</ThemedText>
      <ThemedText style={styles.accountMask}>•••• {item.mask}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Create Verification Report</ThemedText>
            <ThemedText type="title" style={styles.headerSubtitle}>Please fill up form below</ThemedText>
          </View>
          <View style={styles.card}>
            <ThemedText style={[styles.inputLabel, { marginTop: 0 }]}>Full Name</ThemedText>
            <View style={[styles.inputContainer, focusedInput === 'fullName' && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedInput('fullName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            {errors.fullName && <ThemedText style={styles.errorText}>{errors.fullName[0]}</ThemedText>}

            <ThemedText style={styles.inputLabel}>Bank Account Name</ThemedText>
            <View style={[styles.inputContainer, focusedInput === 'bankAccountName' && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Enter account name as it appears in your bank records"
                value={bankAccountName}
                onChangeText={setBankAccountName}
                onFocus={() => setFocusedInput('bankAccountName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            {errors.bankAccountName && <ThemedText style={styles.errorText}>{errors.bankAccountName[0]}</ThemedText>}

            <ThemedText style={styles.inputLabel}>Purpose of Verification</ThemedText>
            <View style={[styles.inputContainer, focusedInput === 'purpose' && styles.inputContainerFocused]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Loan application, Employment verification, etc."
                value={purpose}
                onChangeText={setPurpose}
                onFocus={() => setFocusedInput('purpose')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            {errors.purpose && <ThemedText style={styles.errorText}>{errors.purpose[0]}</ThemedText>}

            <ThemedText style={styles.inputLabel}>Amount To Verify</ThemedText>
            <View style={[styles.inputContainer, styles.amountInputContainer, focusedInput === 'amount' && styles.inputContainerFocused]}>
              <ThemedText style={styles.dollarSign}>$</ThemedText>
              <TextInput
                style={styles.amountInput}
                placeholder="e.g. 5000"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                onFocus={() => setFocusedInput('amount')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            {errors.amount && <ThemedText style={styles.errorText}>{errors.amount[0]}</ThemedText>}

            <View style={styles.selectAccountHeader}>
              <ThemedText style={styles.selectAccountTitle}>Select Account to Verify</ThemedText>
              <Button
                onPress={handleAddBank}
                title="+ Add Bank"
                style={styles.addBankBtn}
                textStyle={styles.addBankBtnText}
              />
            </View>
            {errors.accountId && <ThemedText style={styles.errorText}>{errors.accountId[0]}</ThemedText>}

            {isFetchingBanks ? (
              <ActivityIndicator size="small" color={Colors.dark.tint} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                horizontal
                data={allAccounts}
                renderItem={renderAccountItem}
                keyExtractor={(item) => item.account_id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
                ListEmptyComponent={() => (
                  <ThemedText style={styles.emptyListText}>No banks connected. Please add one.</ThemedText>
                )}
              />
            )}

            <Button
              onPress={handleGenerateReport}
              title="Generate Report"
              isLoading={isGeneratingReport}
              disabled={isGeneratingReport}
              style={styles.generateButton}
              icon={<MaterialCommunityIcons name="file-chart-outline" size={24} color={Colors.dark.text} />}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
    color: Colors.dark.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.cardText,
    marginBottom: 8,
    fontWeight: '500',
    marginTop: 15,
  },
  inputContainer: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.inputBackground, // Default border
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: Colors.dark.tint, // Highlight color on focus
  },
  input: {
    flex: 1,
    color: Colors.dark.cardText,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  amountInputContainer: {
    paddingLeft: 15,
  },
  dollarSign: {
    color: Colors.dark.cardText,
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    color: Colors.dark.cardText,
    paddingLeft: 5,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  selectAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  selectAccountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.cardText,
  },
  addBankBtn: {
    backgroundColor: Colors.dark.text,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.dark.background,
    borderRadius: 20,
  },
  addBankBtnText: {
    color: Colors.dark.tint,
    fontWeight: 'bold',
  },
  accountItem: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    width: 160, // Wider to fit content
    height: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'space-around',
  },
  selectedAccountItem: {
    borderColor: Colors.dark.tint,
  },
  accountItemRow1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  bankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.cardText,
    flexShrink: 1,
  },
  accountSubtype: {
    fontSize: 13,
    color: Colors.dark.cardText,
    marginTop: 4,
  },
  accountMask: {
    fontSize: 13,
    color: Colors.dark.cardText,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyListText: {
    color: Colors.dark.cardText,
    alignSelf: 'center',
    marginVertical: 20,
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: Colors.dark.tint,
    height: 50,
    borderRadius: 12,
  },
});