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
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bank Balance Verification Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: ${pageBackgroundColor}; }
        .page { padding: 20px; }
        .card { background-color: ${cardBackgroundColor}; border-radius: 12px; box-shadow: 0 3px 8px rgba(0,0,0,0.07); overflow: hidden; }
        .header { background-color: ${headerBackgroundColor}; padding: 24px 16px; text-align: center; color: #fff; }
        .header-title { font-size: 22px; font-weight: bold; margin: 0; }
        .header-subtitle { color: #e0e0e0; margin-top: 6px; font-size: 13px; }
        .badge { display:inline-block; margin:20px auto; border-radius:20px; padding:8px 20px; background-color:${sufficient ? successColor : errorColor}; color:#fff; font-weight:600; text-align:center; white-space:nowrap; }
        .amount-highlight { background-color: #f8f9fa; border-left: 4px solid ${sufficient ? successColor : errorColor}; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 16px; }
        .amount-label { font-size: 14px; font-weight: 600; color: ${sufficient ? successColor : errorColor}; }
        .amount-text { font-size: 26px; font-weight: bold; color: #111; margin: 6px 0; }
        .amount-sub { color: #666; font-size: 13px; }
        .section-header { font-size: 17px; font-weight: bold; color: ${labelColor}; margin: 20px 16px 8px 16px; text-align: left; }
        .details-box { background-color: #f8f9fa; border-radius: 8px; margin: 0 16px 14px 16px; border: 1px solid #e5e7eb; }
        .details-row { display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .info-label { color: ${labelColor}; font-weight: 600; font-size: 13px; }
        .info-value { color: ${textColor}; font-size: 14px; text-align: right; }
        .footer { border-top: 1px solid #eee; margin-top: 30px; padding: 16px; color: #666; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card">
          <div class="header">
            <p class="header-title">Bank Balance Verification Report</p>
            <p class="header-subtitle">Official verification document generated on ${new Date(generatedAt).toLocaleDateString("en-US")}</p>
          </div>
          <div style="text-align: center;">
            <div class="badge">
              ${sufficient ? '&#10003;' : '&#10007;'} ${sufficient ? 'VERIFIED' : 'INSUFFICIENT'}
            </div>
          </div>
          <div class="amount-highlight">
            <div class="amount-label">Verification Amount</div>
            <div class="amount-text">${formatCurrency(requestedAmount)}</div>
            <div class="amount-sub">As of ${new Date(generatedAt).toLocaleDateString("en-US")}</div>
          </div>

          <div class="section-header">Verification Details</div>
          <div class="details-box">
            <div class="details-row">
              <span class="info-label">Full Name</span>
              <span class="info-value">${fullName || '-'}</span>
            </div>
            <div class="details-row">
              <span class="info-label">Purpose</span>
              <span class="info-value">${purposeOfVerification || '-'}</span>
            </div>
          </div>

          <div class="section-header">Verified Account</div>
          <div class="details-box">
            <div class="details-row">
              <span class="info-label">Bank</span>
              <span class="info-value">${verifiedAccount.bankName || '-'}</span>
            </div>
            <div class="details-row">
              <span class="info-label">Account Name</span>
              <span class="info-value">${bankAccountName || '-'}</span>
            </div>
            <div class="details-row">
              <span class="info-label">Account Type</span>
              <span class="info-value">${verifiedAccount.subtype || verifiedAccount.type || '-'}</span>
            </div>
            <div class="details-row" style="border-bottom: none;">
              <span class="info-label">Account Number</span>
              <span class="info-value">&#8226;&#8226;&#8226;&#8226; ${verifiedAccount.maskedNumber || '-'}</span>
            </div>
          </div>

          <div class="section-header">Report Information</div>
          <div class="details-box">
            <div class="details-row">
              <span class="info-label">Report ID</span>
              <span class="info-value">${reportId || '-'}</span>
            </div>
            <div class="details-row" style="border-bottom: none;">
              <span class="info-label">Generated</span>
              <span class="info-value">${generatedAt ? new Date(generatedAt).toLocaleString() : '-'}</span>
            </div>
          </div>

          <div class="footer">
            This report was automatically generated by the Banking Verification System.
          </div>
        </div>
      </div>
    </body>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top', 'left', 'right']}>
      <View style={styles.pageContainer}>
        <ScrollView style={styles.page}>
          <Stack.Screen options={{ title: 'Verification Report' }} />
          <View style={styles.card}>
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>Bank Balance Verification Report</ThemedText>
            </View>
            <View style={[styles.badge, { backgroundColor: reportData.sufficient ? '#10B981' : '#EF4444' }]}>
              <ThemedText style={styles.badgeText}>
                {reportData.sufficient ? '✓ VERIFIED' : '✕ INSUFFICIENT'}
              </ThemedText>
            </View>

            <View style={[styles.amountHighlight, { borderLeftColor: reportData.sufficient ? '#10B981' : '#EF4444' }]}>
              <ThemedText style={styles.amountLabel}>Verification Amount</ThemedText>
              <ThemedText style={styles.amountText}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportData.requestedAmount)}
              </ThemedText>
            </View>

            <ThemedText style={styles.sectionHeader}>Verification Details</ThemedText>
            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}>
                <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
                <ThemedText style={styles.infoValue}>{reportData.fullName || '-'}</ThemedText>
              </View>
              <View style={[styles.detailsRow, { borderBottomWidth: 0 }]}>
                <ThemedText style={styles.infoLabel}>Purpose</ThemedText>
                <ThemedText style={styles.infoValue}>{reportData.purposeOfVerification || '-'}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.sectionHeader}>Verified Account</ThemedText>
            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}>
                <ThemedText style={styles.infoLabel}>Bank</ThemedText>
                <ThemedText style={styles.infoValue}>{verifiedAccount.bankName || '-'}</ThemedText>
              </View>
              <View style={styles.detailsRow}>
                <ThemedText style={styles.infoLabel}>Account Name</ThemedText>
                <ThemedText style={styles.infoValue}>{reportData.bankAccountName || '-'}</ThemedText>
              </View>
              <View style={styles.detailsRow}>
                <ThemedText style={styles.infoLabel}>Account Type</ThemedText>
                <ThemedText style={styles.infoValue}>{verifiedAccount.subtype || verifiedAccount.type || '-'}</ThemedText>
              </View>
              <View style={[styles.detailsRow, { borderBottomWidth: 0 }]}>
                <ThemedText style={styles.infoLabel}>Account Number</ThemedText>
                <ThemedText style={styles.infoValue}>•••• {verifiedAccount.maskedNumber || '-'}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.sectionHeader}>Report Information</ThemedText>
            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}>
                <ThemedText style={styles.infoLabel}>Report ID</ThemedText>
                <ThemedText style={styles.infoValue} selectable>{reportData.reportId || '-'}</ThemedText>
              </View>
              <View style={[styles.detailsRow, { borderBottomWidth: 0 }]}>
                <ThemedText style={styles.infoLabel}>Generated</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : '-'}
                </ThemedText>
              </View>
            </View>
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={handleDownloadReport}>
          <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1 },
  pageContainer_center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  page: { flex: 1, backgroundColor: '#eaeef3', paddingVertical: 20, paddingHorizontal: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3 },
  header: { backgroundColor: '#1E3A8A', paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  badge: { alignSelf: 'center', marginTop: 20, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  badgeText: { color: '#fff', fontWeight: '600' },
  amountHighlight: { backgroundColor: '#f8f9fa', borderLeftWidth: 4, padding: 18, borderRadius: 8, alignItems: 'center', marginHorizontal: 16, marginVertical: 20 },
  amountLabel: { fontSize: 14, fontWeight: '600' },
  amountText: { fontSize: 26, fontWeight: 'bold', color: '#111', marginVertical: 6 },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', color: '#1E3A8A', marginHorizontal: 16, marginBottom: 8, marginTop: 10 },
  detailsBox: { backgroundColor: '#f8f9fa', borderRadius: 8, marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { color: '#1E3A8A', fontWeight: '600', fontSize: 13 },
  infoValue: { color: '#333', fontSize: 14, flex: 1, textAlign: 'right' },
  fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 60, backgroundColor: '#1E3A8A', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 5 },
});
