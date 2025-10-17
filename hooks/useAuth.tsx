import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios, { isAxiosError } from 'axios';
import { EXPO_PUBLIC_BASE_API_URL } from '@/constants/my-constants';
import api, { setOnTokenRefresh } from '@/lib/api'; // Import api and setOnTokenRefresh
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

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
  signOut: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  session?: Session | null;
  isLoading: boolean;
  isAuthenticating: boolean;
}>({
  signIn: () => Promise.resolve(),
  signInWithGoogle: () => Promise.resolve(),
  signOut: () => { },
  signUp: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  session: null,
  isLoading: false,
  isAuthenticating: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  // TODO: Replace with your own client IDs
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // This is your web client ID
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID, // This is your android client ID
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID, // This is your iOS client ID
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setIsAuthenticating(true);
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
    }
  };

  const signInWithGoogle = async () => {
    await promptAsync();
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('session');
    setSession(null);
    // Clear the default header
    delete api.defaults.headers.common['Authorization'];
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
        signOut,
        signUp,
        forgotPassword,
        resetPassword,
        session,
        isLoading,
        isAuthenticating,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
