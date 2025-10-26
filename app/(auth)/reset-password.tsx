import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Platform, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Button from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof ResetPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<z.ZodError['formErrors']['fieldErrors'] | null>(null);
  const { resetPassword, isAuthenticating } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      const url = new URL(event.url);
      const token = url.searchParams.get('token');
      if (token) {
        console.log('Token found:', token);
        setToken(token);
      }
    };

    // Handle deep link if app was opened with one
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    // Handle deep links when app is in background
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Also check URL params for token (handles normal navigation)
  const params = useLocalSearchParams<{ token: string }>();
  useEffect(() => {
    if (params.token && !token) {
      console.log('Token from params:', params.token);
      setToken(params.token);
    }
  }, [params.token]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleResetPassword = () => {
    const result = ResetPasswordSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.formErrors.fieldErrors);
    } else {
      setErrors(null);
      if (token) {
        resetPassword(token, result.data.password);
      } else {
        alert('No reset token found. Please try clicking the reset link again.');
      }
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
          <Image source={require('@/assets/images/fv-crop.png')} style={styles.logo} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password</Text>
        </View>

        <View style={styles.card}>
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
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={24} color={Colors.dark.icon} style={styles.icon} />
              <TextInput
                style={styles.input} placeholder="Confirm Password"
                placeholderTextColor={Colors.dark.icon}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry
              />
            </View>
            {errors?.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword[0]}</Text>}
          </View>

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            isLoading={isAuthenticating}
            textStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}
            style={{ backgroundColor: Colors.dark.tint, marginTop: 10 }}
          />
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
  errorText: {
    color: Colors.dark.error,
    marginTop: 5,
    marginLeft: 15,
    fontSize: 14,
  },
});