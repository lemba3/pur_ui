import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios, { isAxiosError } from 'axios';
import { myConstants } from '@/constants/my-constants';
import api, { setOnTokenRefresh } from '@/lib/api'; // Import api and setOnTokenRefresh

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
  signOut: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  session?: Session | null;
  isLoading: boolean;
  isAuthenticating: boolean;
}>({ 
  signIn: () => Promise.resolve(),
  signOut: () => { },
  signUp: () => Promise.resolve(),
  session: null,
  isLoading: false,
  isAuthenticating: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

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
      const response = await axios.post(myConstants.BASE_API_URL + '/auth/login', {
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
      await axios.post(myConstants.BASE_API_URL + '/auth/signup', {
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

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        signUp,
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
