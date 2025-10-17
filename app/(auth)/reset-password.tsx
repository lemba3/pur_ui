
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPassword() {
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, isAuthenticating } = useAuth();
  const router = useRouter();
  const currentColors = Colors['light'];

  const gradientColors: readonly [string, string, ...string[]] = [myColors.gradient1, myColors.gradient2];

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
          <Text style={[styles.title, { color: currentColors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: currentColors.text }]}>Enter your new password</Text>
        </View>

        <View style={[styles.card, { backgroundColor: currentColors.cardBackground }]}>
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
          <View style={[styles.inputContainer, { borderColor: currentColors.icon, backgroundColor: currentColors.inputBackground }]}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={currentColors.icon} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: currentColors.text }]} placeholder="Confirm Password"
              placeholderTextColor={currentColors.icon}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            isLoading={isAuthenticating}
            textStyle={{ fontSize: 18, fontWeight: 'bold' }}
          />
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
});
