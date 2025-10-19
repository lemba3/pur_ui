import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useGetReport } from '@/hooks/report';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

interface AccountDetails {
  plaidAccountId: string;
  name: string;
  bankName: string;
  type: string;
  subtype: string;
  maskedNumber: string;
}

const generateReportHtml = (data: any) => {
  const {
    sufficient, requestedAmount, currency, reportId, generatedAt,
    fullName, bankAccountName, purposeOfVerification, accounts = []
  } = data;

  const verifiedAccount = accounts[0] || {};
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);

  const headerBackgroundColor = '#1E3A8A';
  const successColor = '#10B981';
  const errorColor = '#EF4444';
  const pageBackgroundColor = '#eaeef3';
  const cardBackgroundColor = '#fff';
  const textColor = '#333';
  const labelColor = '#1E3A8A';

  return `
    <!DOCTYPE html>
    <html>
    </html>
  `;
};

export default function VerificationResultScreen() {
  const params = useLocalSearchParams<{
    reportId?: string;
    sufficient?: string;
    requestedAmount?: string;
    userName?: string;
    generatedAt?: string;
    accounts?: string;
    fullName?: string;
    bankAccountName?: string;
    purposeOfVerification?: string;
  }>();

  const { session } = useAuth();

  const hasAllDataInParams = !!(params.sufficient && params.requestedAmount && params.generatedAt && params.accounts);

  const parsedData = hasAllDataInParams
    ? {
      sufficient: params.sufficient === 'true',
      requestedAmount: Number(params.requestedAmount),
      userName: params.userName || session?.user?.name,
      generatedAt: params.generatedAt,
      reportId: params.reportId,
      accounts: JSON.parse(params.accounts!),
      fullName: params.fullName,
      bankAccountName: params.bankAccountName,
      purposeOfVerification: params.purposeOfVerification,
    }
    : undefined;

  const { data: fetchedReportData, isLoading, isError, error } = useGetReport(
    parsedData ? undefined : params.reportId
  );

  const reportData = parsedData || fetchedReportData;
  const verifiedAccount = reportData?.accounts?.[0] || {};

  const handleDownloadReport = async () => {
    if (!reportData) {
      Alert.alert('Error', 'Report data not available for download.');
      return;
    }
    try {
      const htmlContent = generateReportHtml(reportData);
      const fileUri = (FileSystem.documentDirectory || '') + `verification-report-${reportData.reportId}.html`;
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, { encoding: 'utf8' });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this device');
        return;
      }
      await Sharing.shareAsync(fileUri, { mimeType: 'text/html', dialogTitle: 'Download Verification Report' });
    } catch (e) {
      console.error('Error generating or sharing report:', e);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  if (isLoading && !parsedData) {
    return <View style={styles.pageContainer_center}><ActivityIndicator size="large" /></View>;
  }

  if (isError && !parsedData) {
    return <View style={styles.pageContainer_center}><ThemedText>Error loading report: {error?.message}</ThemedText></View>;
  }

  if (!reportData) {
    return <View style={styles.pageContainer_center}><ThemedText>Report not found.</ThemedText></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stack.Screen options={{ title: 'Verification Report' }} />

        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Bank Account Verification Report</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Official verification document generated on{' '}
            {reportData.generatedAt
              ? new Date(reportData.generatedAt).toLocaleDateString()
              : '-'}
          </ThemedText>
        </View>

        {/* Card Content */}
        <View style={styles.card}>
          <View
            style={[
              styles.verificationBadge,
              { backgroundColor: reportData.sufficient ? '#10B981' : '#EF4444' },
            ]}
          >
            <ThemedText style={styles.verificationBadgeText}>
              {reportData.sufficient ? '✓ VERIFIED' : '✕ INSUFFICIENT'}
            </ThemedText>
          </View>

          <ThemedText style={styles.sectionHeader}>Account Holder Information</ThemedText>

          <View style={styles.infoGrid}>
            {[
              { label: 'Account Holder Name', value: reportData.fullName },
              { label: 'Bank Account Name', value: reportData.bankAccountName },
              { label: 'Bank', value: verifiedAccount.bankName },
              {
                label: 'Account Type',
                value: verifiedAccount.subtype || verifiedAccount.type,
              },
              {
                label: 'Account Number (Last 4)',
                value: `****${verifiedAccount.maskedNumber || '-'}`,
              },
              {
                label: 'Purpose of Verification',
                value: reportData.purposeOfVerification,
              },
            ].map((item, idx) => (
              <View key={idx} style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>{item.label}</ThemedText>
                <ThemedText style={styles.infoValue}>{item.value || '-'}</ThemedText>
              </View>
            ))}
          </View>

          {/* Amount Highlight */}
          <View
            style={[
              styles.amountHighlight,
              {
                backgroundColor: reportData.sufficient ? '#10B981' : '#EF4444',
              },
            ]}
          >
            <ThemedText style={styles.amountLabel}>Verified Amount</ThemedText>
            <ThemedText style={styles.amountValue}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                reportData.requestedAmount
              )}
            </ThemedText>
            <ThemedText style={styles.amountDate}>
              As of{' '}
              {reportData.generatedAt
                ? new Date(reportData.generatedAt).toLocaleDateString()
                : '-'}
            </ThemedText>
          </View>

          {/* Report Details */}
          <ThemedText style={styles.sectionHeader}>Verification Details</ThemedText>
          <View style={styles.detailBox}>
            <ThemedText style={styles.detailText}>
              <ThemedText style={styles.bold}>Report ID:</ThemedText> {reportData.reportId}
            </ThemedText>
            <ThemedText style={styles.detailText}>
              <ThemedText style={styles.bold}>Generated:</ThemedText>{' '}
              {reportData.generatedAt
                ? new Date(reportData.generatedAt).toLocaleString()
                : '-'}
            </ThemedText>
            <ThemedText style={styles.detailText}>
              <ThemedText style={styles.bold}>Status:</ThemedText>{' '}
              <ThemedText style={{ color: reportData.sufficient ? '#10B981' : '#EF4444' }}>
                {reportData.sufficient ? 'VERIFIED' : 'INSUFFICIENT'}
              </ThemedText>
            </ThemedText>
          </View>

          {/* Note Box */}
          <View style={styles.noteBox}>
            <ThemedText style={styles.noteText}>
              <ThemedText style={styles.bold}>Note:</ThemedText>{' '}
              This verification report confirms that{' '}
              {reportData.fullName || 'the account holder'}{' '}
              {reportData.sufficient
                ? 'has verified funds of'
                : 'does not have sufficient balance for'}{' '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                reportData.requestedAmount
              )}{' '}
              in their {verifiedAccount.subtype || verifiedAccount.type || 'account'} ending in{' '}
              {verifiedAccount.maskedNumber || '----'} at{' '}
              {verifiedAccount.bankName || 'the bank'}. This verification was requested for:{' '}
              {reportData.purposeOfVerification || '-'}.
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            This document was automatically generated by the Banking Verification System.
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Report ID: {reportData.reportId} | Generated:{' '}
            {reportData.generatedAt
              ? new Date(reportData.generatedAt).toLocaleString()
              : '-'}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Floating Download Button */}
      <TouchableOpacity style={styles.fab} onPress={handleDownloadReport}>
        <Ionicons name="download-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderRadius: 10,
    margin: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0e7ff',
    fontSize: 13,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  verificationBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
    marginBottom: 14,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#1E3A8A',
    fontSize: 13,
  },
  infoValue: {
    color: '#333',
    fontSize: 15,
    marginTop: 4,
  },
  amountHighlight: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 6,
  },
  amountDate: {
    color: '#f0fdf4',
  },
  detailBox: {
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#111111',
  },
  noteBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  noteText: {
    color: '#333',
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#1E3A8A',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pageContainer_center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});
