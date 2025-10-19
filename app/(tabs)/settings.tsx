import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
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
  isDestructive?: boolean;
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const mainButtons: SettingButton[] = [
    { title: 'Profile', icon: 'account-outline', onPress: () => router.push('/profile') },
    { title: 'Privacy Policy', icon: 'shield-outline', onPress: () => router.push('/privacy-policy') },
    { title: 'About', icon: 'information-outline', onPress: () => router.push('/about') },
  ];

  const accountActions: SettingButton[] = [
    { title: 'Sign Out', icon: 'logout', onPress: signOut, isDestructive: true },
  ];

  const renderButton = (btn: SettingButton, index: number) => {
    const color = btn.isDestructive ? Colors.dark.error : Colors.dark.cardText;
    const iconColor = btn.isDestructive ? Colors.dark.error : Colors.dark.icon;

    return (
      <TouchableOpacity
        key={index}
        style={styles.settingButton}
        onPress={btn.onPress}
      >
        <MaterialCommunityIcons name={btn.icon} size={24} color={iconColor} style={styles.settingButtonIcon} />
        <Text style={[styles.settingButtonText, { color }]}>{btn.title}</Text>
        {!btn.isDestructive && <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.dark.icon} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          {mainButtons.map(renderButton)}
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          {accountActions.map(renderButton)}
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
    paddingTop: 30,
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
    marginHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden', // Ensures the border radius is applied to children
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.dark.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingButtonIcon: {
    marginRight: 20,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  separator: {
    height: 20,
  },
});