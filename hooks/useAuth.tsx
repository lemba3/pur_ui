import { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios, { isAxiosError } from 'axios';
import { EXPO_PUBLIC_BASE_API_URL } from '@/constants/my-constants';
import api, { setOnTokenRefresh } from '@/lib/api';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

// Configure Google Sign In
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  forceCodeForRefreshToken: true, // Forces account picker every time
  offlineAccess: true // Required for forceCodeForRefreshToken to work
});

interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: {
    accessToken: string;
    refreshToken: string;
  };
}

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  session?: Session | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  authMethod: 'email' | 'google' | 'apple' | null;
}>({
  signIn: () => Promise.resolve(),
  signInWithGoogle: () => Promise.resolve(),
  signInWithApple: () => Promise.resolve(),
  signOut: () => { },
  signUp: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  session: null,
  isLoading: false,
  isAuthenticating: false,
  authMethod: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'apple' | null>(null);
  const router = useRouter();

  // Debug log the configuration once
  useEffect(() => {
    console.log('Google Auth Configuration:', {
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID?.slice(0, 10) + '...',
      androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID?.slice(0, 10) + '...',
      platform: Platform.OS
    });
  }, []);

  const handleGoogleSignIn = async (idToken: string) => {
    setIsAuthenticating(true);
    setAuthMethod('google');
    try {
      const res = await axios.post(EXPO_PUBLIC_BASE_API_URL + '/auth/google', { idToken });
      const sessionValue: Session = res.data;
      await SecureStore.setItemAsync('session', JSON.stringify(sessionValue));
      setSession(sessionValue);
      if (sessionValue?.token?.accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${sessionValue.token.accessToken}`;
      }
    } catch (e) {
      console.error("Google Sign in failed", e);
      if (isAxiosError(e) && e.response) {
        alert(`Google Sign in failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Google Sign in failed. Check console for details.");
      }
    } finally {
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  const handleAppleSignIn = async (idToken: string) => {
    setIsAuthenticating(true);
    setAuthMethod('apple');
    try {
      const res = await axios.post(EXPO_PUBLIC_BASE_API_URL + '/auth/apple', { idToken });
      const sessionValue: Session = res.data;
      await SecureStore.setItemAsync('session', JSON.stringify(sessionValue));
      setSession(sessionValue);
      if (sessionValue?.token?.accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${sessionValue.token.accessToken}`;
      }
    } catch (e) {
      console.error("Apple Sign in failed", e);
      if (isAxiosError(e) && e.response) {
        alert(`Apple Sign in failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Apple Sign in failed. Check console for details.");
      }
    } finally {
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };


  useEffect(() => {
    // Set up the token refresh listener
    setOnTokenRefresh((newSession) => {
      setSession(newSession);
    });

    const loadSession = async () => {
      const storedSession = await SecureStore.getItemAsync('session');
      if (storedSession) {
        const sessionData: Session = JSON.parse(storedSession);
        setSession(sessionData);
        // Set the default header for the api instance
        if (sessionData?.token?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${sessionData.token.accessToken}`;
        }
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    setAuthMethod('email');
    try {
      const response = await axios.post(EXPO_PUBLIC_BASE_API_URL + '/auth/login', {
        email,
        password,
      });

      const sessionValue: Session = response.data;
      await SecureStore.setItemAsync('session', JSON.stringify(sessionValue));
      setSession(sessionValue);
      // Set the default header for the api instance
      if (sessionValue?.token?.accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${sessionValue.token.accessToken}`;
      }

    } catch (e) {
      console.error("Sign in failed", e);
      if (isAxiosError(e) && e.response) {
        alert(`Sign in failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Sign in failed. Check console for details.");
      }
    } finally {
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  const signInWithGoogle = async () => {
    setIsAuthenticating(true);
    setAuthMethod('google');
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const currentUser = GoogleSignin.getCurrentUser();
      if (!currentUser) {
        // throw new Error('User not signed in yet');
        setIsAuthenticating(false);
        setAuthMethod(null);
        return;
      }
      const tokens = await GoogleSignin.getTokens();

      if (tokens.idToken) {
        await handleGoogleSignIn(tokens.idToken);
      } else {
        throw new Error('No ID token received');
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('Play services not available');
      } else {
        // handle this later why this error ERROR  Google Sign In Error: {"code": "getTokens", "fullError": [Error: getTokens requires a user to be signed in], "message": "getTokens requires a user to be signed in"}
        // alert('Something went wrong: ' + error.message);
      }
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  const signInWithApple = async () => {
    setIsAuthenticating(true);
    setAuthMethod('apple');
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken } = appleAuthRequestResponse;

      if (identityToken) {
        await handleAppleSignIn(identityToken);
      } else {
        throw new Error('No Apple ID token received');
      }
    } catch (error: any) {
      console.error('Apple Sign In Error:', error);
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User cancelled the Apple Sign In flow');
      } else {
        alert('Apple Sign In failed: ' + error.message);
      }
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  const signOut = async () => {
    try {
      // Try to sign out from Google
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Ignore Google sign out errors
        console.log('Google sign out error (non-critical):', error);
      }
      // Clear local session
      await SecureStore.deleteItemAsync('session');
      setSession(null);
      // Clear the default header
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsAuthenticating(true);
    try {
      // NOTE: Replace with your actual backend URL
      await axios.post(EXPO_PUBLIC_BASE_API_URL + '/auth/signup', {
        email,
        password,
        name,
      });
      // Go to login page after successful sign up
      router.push('/login');
    } catch (e) {
      console.error("Sign up failed", e);
      if (isAxiosError(e) && e.response) {
        alert(`Sign up failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Sign up failed. Check console for details.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsAuthenticating(true);
    try {
      await axios.post(EXPO_PUBLIC_BASE_API_URL + '/auth/forgot-password', {
        email,
      });
      alert('A password reset link has been sent to your email.');
    } catch (e) {
      console.error("Forgot password failed", e);
      if (isAxiosError(e) && e.response) {
        alert(`Forgot password failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Forgot password failed. Check console for details.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsAuthenticating(true);
    try {
      await axios.post(EXPO_PUBLIC_BASE_API_URL + '/auth/reset-password', {
        token,
        password,
      });
      alert('Your password has been reset successfully.');
      router.push('/login');
    } catch (e) {
      console.error("Reset password failed", e);
      if (isAxiosError(e) && e.response) {
        alert(`Reset password failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Reset password failed. Check console for details.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        signUp,
        forgotPassword,
        resetPassword,
        session,
        isLoading,
        isAuthenticating,
        authMethod,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
