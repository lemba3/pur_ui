import React, { useState } from 'react';
import { StyleSheet, Button, View, Text, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/lib/api';

export default function HomeScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSandboxAccessToken = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/plaid/create-sandbox-access-token');
      const { access_token } = response.data;
      setAccessToken(access_token);
      Alert.alert("Success", "Sandbox access token obtained successfully!");
    } catch (error: any) {
      console.error('Error getting access token:', error.response?.data || error.message);
      Alert.alert("Error", "Could not obtain access token. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!accessToken) {
      Alert.alert("Error", "You must obtain an access token first.");
      return;
    }
    setIsLoading(true);
    setReport(null);
    try {
      const response = await api.post('/plaid/generate-report', {
        access_token: accessToken,
        amount: 100, // Example amount
        buyerName: "Test Buyer",
        reason: "Verification for loan application"
      });
      setReport(response.data);
      Alert.alert("Report Generated", "The verification report has been successfully generated.");
    } catch (error: any) { // Added missing brace here
      console.error('Error generating report:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.displayMessage || error.response?.data?.message || "Could not generate report. See console for details.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Plaid Verification</ThemedText>
        
        <View style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 1: Get Sandbox Access Token</ThemedText>
          <ThemedText>This will create a sandbox user and get an access token.</ThemedText>
          <Button
            title="Get Sandbox Token"
            onPress={getSandboxAccessToken}
            disabled={isLoading}
          />
          {accessToken && <ThemedText style={styles.successText}>Access Token obtained.</ThemedText>}
        </View>

        <View style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 2: Generate Report</ThemedText>
          <Button
            title="Generate Verification Report"
            onPress={generateReport}
            disabled={!accessToken || isLoading}
          />
        </View>

        {isLoading && <Text>Loading...</Text>}

        {report && (
          <View style={styles.reportContainer}>
            <ThemedText type="subtitle">Report Details</ThemedText>
            <ThemedText>Report ID: {report.verificationReport.reportId}</ThemedText>
            <ThemedText>Status: {report.verificationReport.status}</ThemedText>
            <ThemedText>Buyer: {report.verificationReport.details.buyerName}</ThemedText>
            <ThemedText>Amount: ${report.verificationReport.details.amount}</ThemedText>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  successText: {
    color: 'green',
    fontWeight: 'bold',
  },
  reportContainer: {
    marginTop: 16,
    gap: 8,
    padding: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  }
});