import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Account deletion initiated (dummy)") }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Profile', headerBackTitle: 'Settings' }} />
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="account-circle-outline" size={24} color={Colors.dark.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="email-outline" size={24} color={Colors.dark.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dangerZone}>
          {/* <MaterialCommunityIcons
            name="alert-circle-outline"
            size={28}
            color={Colors.dark.error}
            style={{ marginBottom: 10 }}
          /> */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <MaterialCommunityIcons name="delete-forever-outline" size={24} color={Colors.dark.error} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: myColors.gradient1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.dark.tint,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.dark.text,
    opacity: 0.7,
    marginTop: 4,
  },
  infoSection: {
    marginTop: 20,
    marginHorizontal: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    padding: 20,
    borderRadius: 15,
  },
  infoTextContainer: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.cardText,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 18,
    color: Colors.dark.cardText,
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: 40,
    marginHorizontal: 16,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.error,
    marginBottom: 10,
    marginLeft: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 15,
    borderRadius: 15,
  },
  deleteButtonText: {
    color: Colors.dark.error,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
