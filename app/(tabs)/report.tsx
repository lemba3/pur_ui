import React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useReports } from '@/hooks/report';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { myColors } from '@/constants/my-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  // const colorScheme = useColorScheme();
  // const currentColors = Colors[colorScheme ?? 'light'];
  // const colorScheme = 'light';
  const currentColors = Colors['light'];

  // const gradientColors: readonly [string, string, ...string[]] =
  //   colorScheme === 'dark'
  //     ? ['#0f2027', '#203a43', '#2c5364'] // deep teal-dark gradient
  //     : ['#f5f7fa', '#c3cfe2']; // soft light gradient

  const gradientColors: readonly [string, string, ...string[]] = [myColors.gradient1, myColors.gradient2]; // soft light gradient

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
      <ThemedView style={[styles.reportItem, { backgroundColor: currentColors.cardBackground }]}>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons name="cash-multiple" size={20} color={currentColors.icon} />
          <ThemedText style={styles.reportDetailText}><ThemedText type="defaultSemiBold">Amount:</ThemedText> ${item.requestedAmount.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons
            name={item.sufficient ? "check-circle-outline" : "close-circle-outline"}
            size={20}
            color={item.sufficient ? 'green' : 'red'}
          />
          <ThemedText style={styles.reportDetailText}><ThemedText type="defaultSemiBold">Sufficient:</ThemedText> {item.sufficient ? 'Yes' : 'No'}</ThemedText>
        </View>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons name="bank-outline" size={20} color={currentColors.icon} />
          <ThemedText style={styles.reportDetailText}><ThemedText type="defaultSemiBold">Bank:</ThemedText> {item?.bankNames?.length > 0 ? item.bankNames[0] : 'N/A'}</ThemedText>
        </View>
        <View style={styles.reportDetail}>
          <MaterialCommunityIcons name="calendar-month-outline" size={20} color={currentColors.icon} />
          <ThemedText style={styles.reportDetailText}><ThemedText type="defaultSemiBold">Date:</ThemedText> {new Date(item.createdAt).toLocaleDateString('en-US')}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  if (status === 'pending') {
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ThemedView style={styles.container_center}>
          <ActivityIndicator size="large" color={currentColors.tint} />
          <ThemedText style={{ marginTop: 10 }}>Loading Reports...</ThemedText>
        </ThemedView>
      </LinearGradient>
    );
  }

  if (status === 'error') {
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ThemedView style={styles.container_center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
          <ThemedText style={{ marginTop: 10 }}>Error: {error.message}</ThemedText>
        </ThemedView>
      </LinearGradient>
    );
  }

  if (reports.length === 0 && status === 'success') {
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ThemedView style={styles.container_center}>
          <MaterialCommunityIcons name="file-document-outline" size={50} color={currentColors.icon} />
          <ThemedText style={{ marginTop: 10 }}>No reports found.</ThemedText>
          <ThemedText style={{ opacity: 0.7, textAlign: 'center', marginTop: 5 }}>Start verifying to see your reports here.</ThemedText>
        </ThemedView>
      </LinearGradient>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
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
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={currentColors.tint} style={{ marginVertical: 20 }} /> : null}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container_center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure ThemedView background doesn't hide gradient
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
  reportItemContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reportItem: {
    padding: 20,
    borderRadius: 15,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 5, // Android shadow
  },
  reportDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportDetailText: {
    fontSize: 16,
  },
});