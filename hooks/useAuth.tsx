import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

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
  signIn: (email, password) => Promise<void>;
  signOut: () => void;
  signUp: (email, password, name) => Promise<void>;
  session?: Session | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => { },
  signUp: () => Promise.resolve(),
  session: null,
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await SecureStore.getItemAsync('session');
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });

      const sessionValue = response.data;
      await SecureStore.setItemAsync('session', JSON.stringify(sessionValue));
      setSession(sessionValue);

    } catch (e) {
      console.error("Sign in failed", e);
      if (axios.isAxiosError(e) && e.response) {
        alert(`Sign in failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Sign in failed. Check console for details.");
      }
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('session');
    setSession(null);
    // You might want to call a backend endpoint to invalidate the token here
    // For now, we just clear the local session
  };

  const signUp = async (email, password, name) => {
    try {
      // NOTE: Replace with your actual backend URL
      await axios.post('http://localhost:3000/api/auth/signup', {
        email,
        password,
        name,
      });
      // Go to login page after successful sign up
      router.push('/login');
    } catch (e) {
      console.error("Sign up failed", e);
      if (axios.isAxiosError(e) && e.response) {
        alert(`Sign up failed: ${e.response.data.error || 'An error occurred'}`);
      } else {
        alert("Sign up failed. Check console for details.");
      }
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
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
