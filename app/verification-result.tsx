import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Helper to generate the HTML report
const generateReportHtml = (data: any) => {
  const {
    sufficient, requestedAmount, currency, bankNames,
    reportId, generatedAt, accountHolderName
  } = data;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

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
        .card { background-color: ${cardBackgroundColor}; border-radius: 12px; box-shadow: 0 3px 8px rgba(0,0,0,0.07); overflow: hidden; text-align: center; }
        .header { background-color: ${headerBackgroundColor}; padding: 24px 16px; text-align: center; color: #fff; }
        .header-title { font-size: 22px; font-weight: bold; margin: 0; }
        .header-subtitle { color: #e0e0e0; margin-top: 6px; font-size: 13px; }
        .badge { display:inline-block; margin:20px auto; border-radius:20px; padding:8px 20px; background-color:${sufficient ? successColor : errorColor}; color:#fff; font-weight:600; text-align:center; white-space:nowrap; }
        .amount-highlight { background-color: #f8f9fa; border-left: 4px solid ${sufficient ? successColor : errorColor}; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 16px; }
        .amount-label { font-size: 14px; font-weight: 600; color: ${sufficient ? successColor : errorColor}; }
        .amount-text { font-size: 26px; font-weight: bold; color: #111; margin: 6px 0; }
        .amount-sub { color: #666; font-size: 13px; }
        .section-header { font-size: 17px; font-weight: bold; color: ${labelColor}; margin: 20px 16px 8px 16px; }
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
            <p class="header-subtitle">Official verification document generated on ${new Date().toLocaleDateString("en-US")}</p>
          </div>
          <div class="badge">
            ${sufficient ? '&#10003;' : '&#10007;'} ${sufficient ? 'VERIFIED' : 'INSUFFICIENT'}
          </div>
          <div class="amount-highlight">
            <div class="amount-label">Verification Amount</div>
            <div class="amount-text">${formatCurrency(requestedAmount)}</div>
            <div class="amount-sub">Compared across ${bankNames.length} ${bankNames.length === 1 ? 'bank' : 'banks'}</div>
          </div>
          <div class="section-header">Account Details</div>
          <div class="details-box">
            <div class="details-row">
              <span class="info-label">Account Holder</span>
              <span class="info-value">${accountHolderName || '-'}</span>
            </div>
            <div class="details-row">
              <span class="info-label">Banks</span>
              <span class="info-value">${bankNames.join(', ')}</span>
            </div>
          </div>
          <div class="section-header">Verification Details</div>
          <div class="details-box">
            <div class="details-row">
              <span class="info-label">Report ID</span>
              <span class="info-value">${reportId || '-'}</span>
            </div>
            <div class="details-row">
              <span class="info-label">Generated</span>
              <span class="info-value">${generatedAt ? new Date(generatedAt).toLocaleString() : '-'}</span>
            </div>
            <div class="details-row">
              <span class="info-label">Status</span>
              <span class="info-value" style="color: ${sufficient ? successColor : errorColor}; font-weight: bold;">${sufficient ? 'Verified' : 'Rejected'}</span>
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
    sufficient: string;
    requestedAmount: string;
    currency: string;
    bankNames?: string;
    reportId?: string;
    generatedAt?: string;
  }>();

  const { session } = useAuth();

  const sufficient = params.sufficient === 'true';
  const requestedAmount = params.requestedAmount ? parseFloat(params.requestedAmount) : 0;
  const currency = params.currency || 'USD';
  const bankNames: string[] = params.bankNames ? JSON.parse(params.bankNames) : [];
  const reportId = params.reportId;
  const generatedAt = params.generatedAt;

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const handleDownloadReport = async () => {
    try {
      const htmlContent = generateReportHtml({
        sufficient,
        requestedAmount,
        currency,
        bankNames,
        reportId,
        generatedAt,
        accountHolderName: session?.user?.name,
      });

      const fileUri = (FileSystem.documentDirectory ?? '') + 'verification-report.html';

      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: 'utf8',
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Download Verification Report',
      });
    } catch (error) {
      console.error('Error generating or sharing report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.page}>
        <Stack.Screen options={{ title: 'Bank Balance Verification Report' }} />

        {/* Single unified card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Bank Balance Verification Report</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Official verification document generated on {new Date().toLocaleDateString("en-US")}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          {/* Status Badge */}
          <View style={[styles.badge, { backgroundColor: sufficient ? '#10B981' : '#EF4444' }]}>
            <ThemedText style={styles.badgeText}>
              {sufficient ? '✓ VERIFIED' : '✕ INSUFFICIENT'}
            </ThemedText>
          </View>

          {/* Summary Section */}
          <View
            style={[
              styles.amountHighlight,
              { borderLeftColor: sufficient ? '#10B981' : '#EF4444' },
            ]}
          >
            <Ionicons
              name={sufficient ? 'checkmark-circle' : 'alert-circle'}
              size={28}
              color={sufficient ? '#10B981' : '#EF4444'}
              style={{ marginBottom: 6 }}
            />
            <ThemedText
              style={[
                styles.amountLabel,
                { color: sufficient ? '#10B981' : '#EF4444' },
              ]}
            >
              Verification Amount
            </ThemedText>

            <ThemedText style={styles.amountText}>
              {formatCurrency(requestedAmount)}
            </ThemedText>

            <ThemedText style={styles.amountSub}>
              Compared across {bankNames.length}{' '}
              Bank{bankNames.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>

          {/* Account Details Section */}
          <ThemedText style={styles.sectionHeader}>Account Details</ThemedText>
          {bankNames.length === 0 ? (
            <ThemedText style={styles.emptyText}>No Bank data available.</ThemedText>
          ) : (
            <View style={styles.accountBox}>
              <View style={styles.accountRow}>
                <ThemedText style={styles.infoLabel}>Account Holder</ThemedText>
                <ThemedText style={styles.infoValue}>{session?.user?.name || '-'}</ThemedText>
              </View>
              <View style={[styles.accountRow, { borderBottomWidth: 0 }]}>
                <ThemedText style={styles.infoLabel}>Banks</ThemedText>
                <ThemedText style={styles.infoValue} selectable>
                  {bankNames.join(', ')}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Verification Details Section */}
          <ThemedText style={styles.sectionHeader}>Verification Details</ThemedText>
          <View style={styles.accountBox}>
            <View style={styles.accountRow}>
              <ThemedText style={styles.infoLabel}>Report ID</ThemedText>
              <ThemedText style={styles.infoValue} selectable>{reportId || '-'}</ThemedText>
            </View>
            <View style={styles.accountRow}>
              <ThemedText style={styles.infoLabel}>Generated</ThemedText>
              <ThemedText style={styles.infoValue}>
                {generatedAt ? new Date(generatedAt).toLocaleString() : '-'}
              </ThemedText>
            </View>
            <View style={[styles.accountRow, { borderBottomWidth: 0 }]}>
              <ThemedText style={styles.infoLabel}>Status</ThemedText>
              <ThemedText style={{ color: sufficient ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                {sufficient ? 'Verified' : 'Rejected'}
              </ThemedText>
            </View>
          </View>

          {/* Summary Note */}
          <View style={styles.noteBox}>
            <Ionicons
              name={sufficient ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color={sufficient ? '#10B981' : '#EF4444'}
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.noteText}>
              {sufficient
                ? `This report confirms sufficient total funds across ${bankNames.length} linked bank${bankNames.length !== 1 ? 's' : ''
                }.`
                : `Funds across ${bankNames.length} bank${bankNames.length !== 1 ? 's' : ''
                } are insufficient for the requested amount.`}
            </ThemedText>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              This report was automatically generated by the Banking Verification System.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={handleDownloadReport}>
        <Ionicons name="download-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#eaeef3', // subtle gray background for "PDF paper" look
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: '#e0e0e0', marginTop: 6, fontSize: 13 },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  badge: {
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  badgeText: { color: '#fff', fontWeight: '600' },

  /** Neutral summary box **/
  amountHighlight: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
  },
  amountLabel: { fontSize: 14, fontWeight: '600' },
  amountText: { fontSize: 26, fontWeight: 'bold', color: '#111', marginVertical: 6 },
  amountSub: { color: '#666', fontSize: 13, textAlign: 'center' },

  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 10, // Add some space above sections
  },
  emptyText: { textAlign: 'center', color: '#777', marginVertical: 12 },
  accountBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: { color: '#1E3A8A', fontWeight: '600', fontSize: 13 },
  infoValue: { color: '#333', fontSize: 14, flex: 1, textAlign: 'right' }, // Make value text align right
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 20,
  },
  noteText: { flex: 1, fontSize: 13.5, color: '#333' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 30,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerText: { color: '#666', fontSize: 12, textAlign: 'center' },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 60,
    backgroundColor: '#1E3A8A',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
});
