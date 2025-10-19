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
import * as Print from 'expo-print';
import QRCode from 'react-native-qrcode-svg';

const generateReportHtml = (data: any, qrCodeDataUrl: string) => {
  const {
    sufficient, requestedAmount, reportId, generatedAt,
    fullName, bankAccountName, purposeOfVerification, accounts = [],
    requestId,
  } = data;

  const verifiedAccount = accounts[0] || {};
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const generatedDate = generatedAt ? new Date(generatedAt) : new Date();

  const headerBackgroundColor = '#1E3A8A';
  const successColor = '#10B981';
  const errorColor = '#EF4444';
  const pageBackgroundColor = '#f9f9f9';
  const cardBackgroundColor = '#ffffff';
  const textColor = '#333';
  const labelColor = '#1E3A8A';
  const infoBoxBg = '#f8f9fa';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: ${pageBackgroundColor};
          margin: 0;
          padding: 20px;
        }
        .header {
          background-color: ${headerBackgroundColor};
          padding: 30px 16px;
          border-radius: 10px;
          text-align: center;
          color: white;
        }
        .header-title {
          font-size: 24px;
          font-weight: bold;
        }
        .header-subtitle {
          font-size: 13px;
          margin-top: 6px;
          color: #e0e7ff;
        }
        .card {
          background-color: ${cardBackgroundColor};
          margin-top: 16px;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .badge {
          align-self: flex-start;
          border-radius: 20px;
          padding: 6px 14px;
          margin-bottom: 20px;
          color: white;
          font-weight: bold;
          font-size: 14px;
          background-color: ${sufficient ? successColor : errorColor};
          display: inline-block;
        }
        .section-header {
          font-size: 18px;
          font-weight: bold;
          color: ${labelColor};
          margin-bottom: 10px;
        }
        .info-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .info-item {
          width: 48%;
          background-color: ${infoBoxBg};
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid ${labelColor};
          margin-bottom: 14px;
          box-sizing: border-box;
        }
        .info-label {
          font-weight: bold;
          color: ${labelColor};
          font-size: 13px;
        }
        .info-value {
          color: ${textColor};
          font-size: 15px;
          margin-top: 4px;
        }
        .amount-highlight {
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          background-color: ${sufficient ? successColor : errorColor};
          color: white;
        }
        .amount-label {
          font-size: 15px;
          font-weight: 600;
        }
        .amount-value {
          font-size: 32px;
          font-weight: bold;
          margin: 6px 0;
        }
        .amount-date {
          color: #f0fdf4;
        }
        .details-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .detail-box {
          font-size: 14px;
          color: ${textColor};
        }
        .detail-box p {
          margin: 4px 0;
        }
        .bold {
          font-weight: bold;
          color: #111;
        }
        .qr-code {
          text-align: center;
        }
        .qr-code img {
          width: 90px;
          height: 90px;
        }
        .qr-code-text {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        .note-box {
          background-color: #f0f9ff;
          border-left: 4px solid #3B82F6;
          padding: 12px;
          border-radius: 8px;
          margin-top: 20px;
          font-size: 14px;
          color: ${textColor};
        }
        .footer {
          margin-top: 20px;
          padding: 20px 16px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-title">Bank Account Verification Report</div>
        <div class="header-subtitle">Official verification document generated on ${generatedDate.toLocaleDateString()}</div>
      </div>
      <div class="card">
        <div class="badge">${sufficient ? '✓ VERIFIED' : '✕ INSUFFICIENT'}</div>
        <div class="section-header">Account Holder Information</div>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Account Holder Name</div><div class="info-value">${fullName || '-'}</div></div>
          <div class="info-item"><div class="info-label">Bank Account Name</div><div class="info-value">${bankAccountName || '-'}</div></div>
          <div class="info-item"><div class="info-label">Bank</div><div class="info-value">${verifiedAccount.bankName || '-'}</div></div>
          <div class="info-item"><div class="info-label">Account Type</div><div class="info-value">${verifiedAccount.subtype || verifiedAccount.type || '-'}</div></div>
          <div class="info-item"><div class="info-label">Account Number (Last 4)</div><div class="info-value">**** ${verifiedAccount.maskedNumber || '-'}</div></div>
          <div class="info-item"><div class="info-label">Purpose of Verification</div><div class="info-value">${purposeOfVerification || '-'}</div></div>
        </div>
        <div class="amount-highlight">
          <div class="amount-label">Verified Amount</div>
          <div class="amount-value">${formatCurrency(requestedAmount)}</div>
          <div class="amount-date">As of ${generatedDate.toLocaleDateString()}</div>
        </div>
        <div class="section-header">Verification Details</div>
        <div class="details-section">
          <div class="detail-box">
            <p><span class="bold">Report ID:</span> ${reportId || '-'}</p>
            <p><span class="bold">Request ID:</span> ${requestId || '-'}</p>
            <p><span class="bold">Generated:</span> ${generatedDate.toLocaleString()}</p>
            <p><span class="bold">Status:</span> <span style="color: ${sufficient ? successColor : errorColor};">${sufficient ? 'VERIFIED' : 'INSUFFICIENT'}</span></p>
          </div>
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 90px; height: 90px; display: block; margin: 0 auto;" />
            <div class="qr-code-text">Scan to verify</div>
          </div>
        </div>
        <div class="note-box">
          <span class="bold">Note:</span> This verification report confirms that ${fullName || 'the account holder'} ${sufficient ? 'has verified funds of' : 'does not have sufficient balance for'} ${formatCurrency(requestedAmount)} in their ${verifiedAccount.subtype || verifiedAccount.type || 'account'} ending in ${verifiedAccount.maskedNumber || '----'} at ${verifiedAccount.bankName || 'the bank'}. This verification was requested for: ${purposeOfVerification || '-'}.
        </div>
      </div>
      <div class="footer">
        <p>This document was automatically generated by the Banking Verification System.</p>
        <p>Report ID: ${reportId || '-'} | Generated: ${generatedDate.toLocaleString()}</p>
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
    requestId?: string;
  }>();

  const { session } = useAuth();
  let qrCodeRef: any;

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
      requestId: params.requestId || '',
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
    if (!qrCodeRef) {
      Alert.alert('Error', 'QR code reference not available.');
      return;
    }

    qrCodeRef.toDataURL(async (base64QrCode: string) => {
      try {
        // Convert the base64 string to a data URL if it isn't already
        const qrCodeDataUrl = base64QrCode.startsWith('data:')
          ? base64QrCode
          : `data:image/png;base64,${base64QrCode}`;

        const htmlContent = generateReportHtml(reportData, qrCodeDataUrl);
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        const pdfName = `verification-report-${reportData.reportId}.pdf`;
        const pdfUri = FileSystem.documentDirectory + pdfName;
        await FileSystem.moveAsync({ from: uri, to: pdfUri });

        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert('Sharing is not available on this device');
          return;
        }
        await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Download Verification Report' });
      } catch (e) {
        console.error('Error generating or sharing report:', e);
        Alert.alert('Error', 'Failed to generate report. Please try again.');
      }
    });
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
          <View style={styles.detailsSection}>
            <View style={styles.detailBox}>
              <ThemedText style={styles.detailText}>
                <ThemedText style={styles.bold}>Report ID:</ThemedText> {reportData.reportId}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                <ThemedText style={styles.bold}>Request ID:</ThemedText> {reportData.requestId}
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
            {/* <View style={styles.qrCodeContainer}>
              <QRCode
                value={reportData.requestId || 'no-request-id'}
                size={90}
                getRef={(c) => (qrCodeRef = c)}
              />
              <ThemedText style={styles.qrCodeText}>Scan to verify</ThemedText>
            </View> */}
          </View>

          <View style={[styles.qrCodeContainer, { marginTop: 20 }]}>
            <QRCode
              value={reportData.requestId || 'no-request-id'}
              size={90}
              getRef={(c) => (qrCodeRef = c)}
            />
            <ThemedText style={styles.qrCodeText}>Scan to verify</ThemedText>
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
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  detailBox: {
    // styles for the text details box
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
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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