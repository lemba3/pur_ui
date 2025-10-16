import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const { signUp, isAuthenticating } = useAuth();
  const router = useRouter();
  const currentColors = Colors['light'];

  const gradientColors: readonly [string, string, ...string[]] = [myColors.gradient1, myColors.gradient2]; // soft light gradient

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please make sure your passwords match.");
      return;
    }
    if (!email || !password || !name) {
      Alert.alert("Missing fields", "Please fill all the fields.");
      return;
    }
    signUp(email, password, name);
  };

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
          <Text style={[styles.title, { color: currentColors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: currentColors.text }]}>Sign up to get started</Text>
        </View>

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground }]}>
          <View style={[styles.inputContainer, { borderColor: currentColors.icon, backgroundColor: currentColors.inputBackground }]}>
            <MaterialCommunityIcons name="account-outline" size={24} color={currentColors.icon} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Name"
              placeholderTextColor={currentColors.icon}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: currentColors.icon, backgroundColor: currentColors.inputBackground }]}>
            <MaterialCommunityIcons name="email-outline" size={24} color={currentColors.icon} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Email"
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
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Password"
              placeholderTextColor={currentColors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: currentColors.icon, backgroundColor: currentColors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-check-outline" size={24} color={currentColors.icon} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={currentColors.icon}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Button
            title="Sign Up"
            onPress={handleSignUp}
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
  backButton: {
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
  },
});