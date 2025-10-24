import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { z } from 'zod';

// 1. Define Zod Schema
const SignUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof SignUpSchema>;

export default function SignUp() {
  // 2. Refactor state
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<z.ZodError['formErrors']['fieldErrors'] | null>(null);

  const { signUp, isAuthenticating } = useAuth();
  const router = useRouter();

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
  const handleSignUp = () => {
    const result = SignUpSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.formErrors.fieldErrors);
    } else {
      setErrors(null);
      signUp(result.data.email, result.data.password, result.data.name);
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
          <Image source={require('@/assets/images/fv-logo.png')} style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.card}>
          {/* 4. Update Inputs and add Error display */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={Colors.dark.icon}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                autoCapitalize="words"
              />
            </View>
            {errors?.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
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
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.dark.icon}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
              />
            </View>
            {errors?.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-check-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.dark.icon}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry
              />
            </View>
            {errors?.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword[0]}</Text>}
          </View>

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            isLoading={isAuthenticating}
            textStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}
            style={{ backgroundColor: Colors.dark.tint, marginTop: 10 }}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, { color: Colors.dark.tint }]}>Back to Login</Text>
          </TouchableOpacity>
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
  backButton: {
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: 5,
    marginLeft: 15,
    fontSize: 14,
  },
});