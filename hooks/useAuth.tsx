import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext<{
  signIn: (email, password) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => {},
  session: null,
  isLoading: false,
});

// This hook will protect the route access based on user authentication.
function useProtectedRoute(session) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !session &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/');
    }
  }, [session, segments, router]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await AsyncStorage.getItem('session');
      setSession(storedSession);
      setIsLoading(false);
    };
    loadSession();
  }, []);

  useProtectedRoute(session);

  const signIn = async (email, password) => {
    try {
      // NOTE: Replace with your actual backend URL
      const response = await axios.post('http://localhost:3000/api/auth/callback/credentials', {
        email,
        password,
        redirect: false,
      });
      
      // The actual session token is usually in a cookie handled by the browser.
      // For mobile, next-auth returns a session object. We'll just store a simple flag.
      const sessionValue = JSON.stringify(response.data);
      await AsyncStorage.setItem('session', sessionValue);
      setSession(sessionValue);

    } catch (e) {
      console.error("Sign in failed", e);
      alert("Sign in failed. Check console for details.");
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('session');
    setSession(null);
    // Also call the next-auth signout endpoint
    await axios.post('http://localhost:3000/api/auth/signout');
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
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
