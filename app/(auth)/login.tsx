import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';

export default function Login() {
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('test');
  const { signIn, signInWithGoogle, isAuthenticating } = useAuth();
  const currentColors = Colors['light'];

  const gradientColors: readonly [string, string, ...string[]] = [myColors.gradient1, myColors.gradient2]; // soft light gradient

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Image source={require('@/assets/images/pur.png')} style={styles.logo} />
          <Text style={[styles.title, { color: currentColors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: currentColors.text }]}>Sign in to continue</Text>
        </View>

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground }]}>
          <View style={[styles.inputContainer, { borderColor: currentColors.icon, backgroundColor: currentColors.inputBackground }]}>
            <MaterialCommunityIcons name="email-outline" size={24} color={currentColors.icon} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: currentColors.text }]} placeholder="Email"
              placeholderTextColor={currentColors.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={[styles.inputContainer, { borderColor: currentColors.icon, backgroundColor: currentColors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={currentColors.icon} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: currentColors.text }]} placeholder="Password"
              placeholderTextColor={currentColors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title="Sign In"
            onPress={() => signIn(email, password)}
            isLoading={isAuthenticating}
            textStyle={{ fontSize: 18, fontWeight: 'bold' }}
          />

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <Button
            title="Sign In with Google"
            onPress={signInWithGoogle}
            isLoading={isAuthenticating}
            style={{ backgroundColor: '#4285F4', marginTop: 10 }}
            icon={<MaterialCommunityIcons name="google" size={20} color="white" style={{ marginRight: 10 }} />}
            textStyle={{ fontSize: 18, fontWeight: 'bold' }}
          />

          <Link href="/signup" style={styles.link}>
            <Text style={[styles.linkText, { color: currentColors.tint }]}>
              Don&apos;t have an account? Sign Up
            </Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 12,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8, // Android shadow
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 18,
    paddingHorizontal: 18,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
  },
  link: {
    alignSelf: 'center',
    marginTop: 25,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#888',
    fontWeight: '600',
  },
});