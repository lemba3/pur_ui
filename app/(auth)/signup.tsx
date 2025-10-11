import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Button from '@/components/ui/button';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signUp, isAuthenticating } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <Text style={[styles.title, { color: currentColors.text }]}>Sign Up</Text>

      <TextInput
        style={[styles.input, { borderColor: currentColors.icon, color: currentColors.text, backgroundColor: currentColors.background }]}
        placeholder="Name"
        placeholderTextColor={currentColors.icon}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={[styles.input, { borderColor: currentColors.icon, color: currentColors.text, backgroundColor: currentColors.background }]}
        placeholder="Email"
        placeholderTextColor={currentColors.icon}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { borderColor: currentColors.icon, color: currentColors.text, backgroundColor: currentColors.background }]}
        placeholder="Password"
        placeholderTextColor={currentColors.icon}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Sign Up"
        onPress={() => signUp(email, password, name)}
        isLoading={isAuthenticating}
        textStyle={{ fontSize: 18, fontWeight: 'bold' }}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={[styles.backText, { color: currentColors.tint }]}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  backButton: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
  },
});
