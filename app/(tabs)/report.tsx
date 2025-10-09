import React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useReports } from '@/hooks/report';
import { useRouter } from 'expo-router';

interface Report {
  id: string;
  sufficient: boolean;
  requestedAmount: number;
  bankNames: string[];
  createdAt: string;
}

export default function ReportScreen() {
  const {
    reports,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useReports();
  const router = useRouter();

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleViewReport = (reportId: string) => {
    router.push({
      pathname: '/verification-result',
      params: { reportId: reportId },
    });
  };

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity onPress={() => handleViewReport(item.id)} style={styles.reportItemContainer}>
      <ThemedView style={styles.reportItem}>
        <ThemedText><ThemedText type="defaultSemiBold">Amount:</ThemedText> ${item.requestedAmount.toFixed(2)}</ThemedText>
        <ThemedText><ThemedText type="defaultSemiBold">Sufficient:</ThemedText> {item.sufficient ? 'Yes' : 'No'}</ThemedText>
        <ThemedText><ThemedText type="defaultSemiBold">Banks:</ThemedText> {item.bankNames.join(', ')}</ThemedText>
        <ThemedText><ThemedText type="defaultSemiBold">Date:</ThemedText> {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  if (status === 'pending') {
    return (
      <ThemedView style={styles.container_center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (status === 'error') {
    return (
      <ThemedView style={styles.container_center}>
        <ThemedText>Error: {error.message}</ThemedText>
      </ThemedView>
    );
  }
  
  if (reports.length === 0 && status === 'success') {
      return (
          <ThemedView style={styles.container_center}>
              <ThemedText>No reports found.</ThemedText>
          </ThemedView>
      )
  }

  return (
    <ThemedView style={styles.container_list}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container_center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container_list: {
    flex: 1,
  },
  reportItemContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reportItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 4,
  },
});