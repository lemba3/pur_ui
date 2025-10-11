import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';

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
            <Button
              key={index}
              title={btn.title}
              onPress={btn.onPress}
              color="#f2f2f2"
              textStyle={{ color: Colors.light.text, fontWeight: '500' }}
            />
          ))}
        </View>

        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={signOut}
            color="#dc3545"
            textStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
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
  signOutSection: {
    marginTop: 'auto',
  },
});
