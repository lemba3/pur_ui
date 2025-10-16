import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps } from 'react';
import { myColors } from '@/constants/my-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SettingButton {
  title: string;
  icon: IconName;
  onPress: () => void;
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const currentColors = Colors['light'];

  const gradientColors: readonly [string, string, ...string[]] = [myColors.gradient1, myColors.gradient2]; // soft light gradient

  const myButtons: SettingButton[] = [
    { title: 'Profile', icon: 'account-outline', onPress: () => { /* Navigate to profile screen */ } },
    { title: 'Privacy Policy', icon: 'shield-outline', onPress: () => { /* Navigate to privacy policy */ } },
    { title: 'About', icon: 'information-outline', onPress: () => { /* Navigate to about screen */ } },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          {myButtons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.settingButton, { backgroundColor: currentColors.cardBackground }]}
              onPress={btn.onPress}
            >
              <MaterialCommunityIcons name={btn.icon} size={24} color={currentColors.icon} style={styles.settingButtonIcon} />
              <Text style={[styles.settingButtonText, { color: currentColors.text }]}>{btn.title}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={currentColors.icon} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: '#dc3545' }]} // Red color for sign out
            onPress={signOut}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#fff" style={styles.settingButtonIcon} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    gap: 10,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // Android shadow
  },
  settingButtonIcon: {
    marginRight: 15,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  signOutSection: {
    marginTop: 'auto',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // Android shadow
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});