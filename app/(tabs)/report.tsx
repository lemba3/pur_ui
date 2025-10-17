import React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useReports } from '@/hooks/report';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';

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
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons name="cash-multiple" size={20} color={Colors.dark.icon} />
          <View style={styles.reportDetailView}><ThemedText style={styles.reportKeyText} type="defaultSemiBold">Amount:</ThemedText></View>
          <ThemedText style={styles.reportDetailText}>${item.requestedAmount.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons
            name={item.sufficient ? "check-circle-outline" : "close-circle-outline"}
            size={20}
            color={item.sufficient ? 'green' : 'red'}
          />
          <View style={styles.reportDetailView}><ThemedText style={styles.reportKeyText} type="defaultSemiBold">Sufficient:</ThemedText></View>
          <ThemedText style={styles.reportDetailText}>{item.sufficient ? 'Yes' : 'No'}</ThemedText>
        </View>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons name="bank-outline" size={20} color={Colors.dark.icon} />
          <View style={styles.reportDetailView}><ThemedText style={styles.reportKeyText} type="defaultSemiBold">Bank:</ThemedText></View>
          <ThemedText style={styles.reportDetailText}>{item?.bankNames?.length > 0 ? item.bankNames[0] : 'N/A'}</ThemedText>
        </View>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons name="calendar-month-outline" size={20} color={Colors.dark.icon} />
          <View style={styles.reportDetailView}><ThemedText style={styles.reportKeyText} type="defaultSemiBold">Date:</ThemedText></View>
          <ThemedText style={styles.reportDetailText}>{new Date(item.createdAt).toLocaleDateString('en-US')}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  if (status === 'pending') {
    return (
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container_center} // reuse your container style for flex/padding
      >
        <ActivityIndicator size="large" color={Colors.dark.tint} />
        <ThemedText style={{ marginTop: 10, color: Colors.dark.text }}>Loading Reports...</ThemedText>
      </LinearGradient>
    );
  }

  if (status === 'error') {
    return (
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container_center} // reuse your container style for flex/padding
      >
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
        <ThemedText style={{ marginTop: 10, color: Colors.dark.text }}>Error: {error.message}</ThemedText>
      </LinearGradient>
    );
  }

  if (reports.length === 0 && status === 'success') {
    return (
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container_center} // reuse your container style for flex/padding
      >
        <MaterialCommunityIcons name="file-document-outline" size={50} color={Colors.dark.icon} />
        <ThemedText style={{ marginTop: 10, color: Colors.dark.text }}>No reports found.</ThemedText>
        <ThemedText style={{ opacity: 0.7, textAlign: 'center', marginTop: 5, color: Colors.dark.text }}>Start verifying to see your reports here.</ThemedText>
      </LinearGradient>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container} // reuse your container style for flex/padding
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Verification Reports</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Your financial verification history</ThemedText>
        </View>
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={Colors.dark.tint} style={{ marginVertical: 20 }} /> : null}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container_center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
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
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
    color: Colors.dark.text,
  },
  reportItemContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reportItem: {
    padding: 20,
    borderRadius: 15,
    gap: 10,
    backgroundColor: Colors.dark.cardBackground,
  },
  reportDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportDetailView: {
    width: 80,
  },
  reportKeyText: {
    fontSize: 16,
    color: Colors.dark.cardText,
  },
  reportDetailText: {
    fontSize: 16,
    color: Colors.dark.cardText,
  },
});
