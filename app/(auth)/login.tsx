import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Button from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('test');
  const { signIn, isAuthenticating } = useAuth();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: currentColors.text }]}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
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
          title="Sign In"
          onPress={() => signIn(email, password)}
          isLoading={isAuthenticating}
          textStyle={{ fontSize: 18, fontWeight: 'bold' }}
        />
        <Link href="/signup" style={styles.link}>
          <Text style={[styles.linkText, { color: currentColors.tint }]}>
            Don&apos;t have an account? Sign Up
          </Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
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
  link: {
    alignSelf: 'center',
  },
  linkText: {
    fontSize: 14,
    marginTop: 8,
  },
});
