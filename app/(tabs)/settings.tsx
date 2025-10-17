import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SettingButton {
  title: string;
  icon: IconName;
  onPress: () => void;
}

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const myButtons: SettingButton[] = [
    { title: 'Profile', icon: 'account-outline', onPress: () => { /* Navigate to profile screen */ } },
    { title: 'Privacy Policy', icon: 'shield-outline', onPress: () => { /* Navigate to privacy policy */ } },
    { title: 'About', icon: 'information-outline', onPress: () => { /* Navigate to about screen */ } },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container} // reuse your container style for flex/padding
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          {myButtons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingButton}
              onPress={btn.onPress}
            >
              <MaterialCommunityIcons name={btn.icon} size={24} color={Colors.dark.icon} style={styles.settingButtonIcon} />
              <Text style={styles.settingButtonText}>{btn.title}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.dark.icon} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
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
  container: {
    flex: 1,
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
    backgroundColor: Colors.dark.cardBackground,
  },
  settingButtonIcon: {
    marginRight: 15,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: Colors.dark.cardText,
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
    backgroundColor: Colors.dark.error,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
