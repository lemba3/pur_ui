import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { z } from 'zod';

// 1. Define Zod Schema
const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormData = z.infer<typeof LoginSchema>;

export default function Login() {
  // 2. Refactor state
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<z.ZodError['formErrors']['fieldErrors'] | null>(null);

  const { signIn, signInWithGoogle, isAuthenticating, authMethod } = useAuth();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for the field being edited
    if (errors && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 3. Create validation handler
  const handleSignIn = () => {
    const result = LoginSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.formErrors.fieldErrors);
    } else {
      setErrors(null);
      signIn(result.data.email, result.data.password);
    }
  };

  return (
    <LinearGradient
      colors={[myColors.gradient1, myColors.gradient2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Image source={require('@/assets/images/pur.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.card}>
          {/* 4. Update Inputs and add Error display */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
              <TextInput
                style={styles.input} placeholder="Email"
                placeholderTextColor={Colors.dark.icon}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {errors?.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
              <TextInput
                style={styles.input} placeholder="Password"
                placeholderTextColor={Colors.dark.icon}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
              />
            </View>
            {errors?.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}
          </View>

          <Button
            title="Sign In"
            onPress={handleSignIn} // Use new handler
            isLoading={isAuthenticating && authMethod === 'email'}
            textStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}
            style={{ backgroundColor: Colors.dark.tint, marginTop: 10 }}
          />

          <Link href="/forgot-password" style={styles.link}>
            <Text style={[styles.linkText, { color: Colors.dark.tint, textAlign: 'right', width: '100%', marginTop: -20, marginBottom: 10 }]}>
              Forgot Password?
            </Text>
          </Link>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <Button
            title="Sign In with Google"
            onPress={signInWithGoogle}
            isLoading={isAuthenticating && authMethod === 'google'}
            style={{ backgroundColor: '#FFFFFF', marginTop: 10 }}
            icon={<MaterialCommunityIcons name="google" size={20} color={Colors.dark.tint} style={{ marginRight: 10 }} />}
            textStyle={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark.tint }}
          />

          <Link href="/signup" style={styles.link}>
            <Text style={[styles.linkText, { color: Colors.dark.tint }]}>
              Don&apos;t have an account? Sign Up
            </Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>

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
  inputWrapper: {
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderRadius: 15,
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
    color: Colors.dark.cardText,
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
    backgroundColor: Colors.dark.icon,
  },
  separatorText: {
    marginHorizontal: 10,
    color: Colors.dark.icon,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: 5,
    marginLeft: 15,
    fontSize: 14,
  },
});