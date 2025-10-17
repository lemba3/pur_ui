import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPassword() {
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, isAuthenticating } = useAuth();
  const router = useRouter();

  const handleResetPassword = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (typeof token === 'string') {
      resetPassword(token, password);
    } else {
      alert('Invalid token');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{width: '100%'}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Image source={require('@/assets/images/pur.png')} style={styles.logo} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
            <TextInput
              style={styles.input} placeholder="Password"
              placeholderTextColor={Colors.dark.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
            <TextInput
              style={styles.input} placeholder="Confirm Password"
              placeholderTextColor={Colors.dark.icon}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            isLoading={isAuthenticating}
            textStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}
            style={{backgroundColor: Colors.dark.tint}}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.dark.background,
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
    color: Colors.dark.text,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
    color: Colors.dark.text,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    backgroundColor: Colors.dark.cardBackground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 18,
    paddingHorizontal: 18,
    borderColor: Colors.dark.icon,
    backgroundColor: Colors.dark.inputBackground,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.dark.text,
  },
});