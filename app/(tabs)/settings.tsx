import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const myButtons = [
    { title: 'Profile', onPress: () => { } },
    { title: 'Privacy Policy', onPress: () => { } },
    { title: 'About', onPress: () => { } },
  ];

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={styles.section}>
          {myButtons.map((btn, index) => (
            <TouchableOpacity key={index} style={styles.button} onPress={btn.onPress}>
              <ThemedText style={styles.buttonText}>{btn.title}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.signOutSection}>
          <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={signOut}>
            <ThemedText style={[styles.buttonText, styles.signOutText]}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
    gap: 24,
  },
  section: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutSection: {
    marginTop: 'auto',
    // marginBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  signOutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
