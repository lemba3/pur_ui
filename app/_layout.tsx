import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef, useCallback } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

const prefix = Linking.createURL('/');

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
  linking: {
    enabled: true,
    prefixes: [
      `${process.env.EXPO_PUBLIC_SCHEME}://`,
      'https://forward-lungeous-manie.ngrok-free.dev',
      'http://forward-lungeous-manie.ngrok-free.dev'
    ],
    config: {
      screens: {
        '(auth)': {
          screens: {
            'reset-password': 'reset-password',
          },
        },
        'plaid-redirect': {
          path: 'plaid-redirect/:status?',
          parse: {
            status: (status: string) => status,
          },
        },
        'plaid-hosted-link': 'plaid-hosted-link',
      },
    },
  },
};

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    text: Colors.light.text,
    primary: Colors.light.tint,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    text: Colors.dark.text,
    primary: Colors.dark.tint,
  },
};

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = 'dark';
  const [hasHandledInitialDeepLink, setHasHandledInitialDeepLink] = useState(false);
  const [lastHandledToken, setLastHandledToken] = useState<string | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);

  // Debounced navigation function
  const navigateToResetPassword = useCallback((token: string) => {
    if (token === lastHandledToken) {
      console.log('Ignoring duplicate token navigation');
      return;
    }

    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Set a small delay to prevent multiple rapid navigations
    navigationTimeoutRef.current = setTimeout(() => {
      console.log('Navigating to reset password with token');
      setLastHandledToken(token);
      setHasHandledInitialDeepLink(true);
      router.replace({
        pathname: '/(auth)/reset-password',
        params: { token }
      });
    }, 100);
  }, [router, lastHandledToken]);

  // Handle deep links when app is in background
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (!hasHandledInitialDeepLink && event.url.includes('reset-password')) {
        const token = new URL(event.url).searchParams.get('token');
        if (token) {
          console.log('Received deep link with token');
          navigateToResetPassword(token);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      subscription.remove();
    };
  }, [navigateToResetPassword, hasHandledInitialDeepLink]);
  // const colorScheme = useColorScheme();
  // const colorScheme = 'dark';

  useEffect(() => {
    if (isLoading) return;

    const checkInitialLink = async () => {
      try {
        // Only check initial link if we haven't handled it yet
        if (!hasHandledInitialDeepLink) {
          const url = await Linking.getInitialURL();
          if (url?.includes('reset-password')) {
            const token = new URL(url).searchParams.get('token');
            if (token) {
              console.log('Found initial deep link token');
              navigateToResetPassword(token);
              return true;
            }
          }
        }
        return false;
      } catch (e) {
        console.log('Error checking initial link:', e);
        return false;
      }
    };

    const handleNavigation = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inResetPassword = segments[1] === 'reset-password';
      const hasResetToken = await checkInitialLink();

      // If we found and handled a reset token, don't do any other navigation
      if (hasResetToken) {
        SplashScreen.hideAsync();
        return;
      }

      // Normal navigation logic
      if (!session && !inAuthGroup && !inResetPassword) {
        router.replace('/login');
      } else if (session && inAuthGroup && !inResetPassword) {
        router.replace('/');
      }
      SplashScreen.hideAsync();
    };

    handleNavigation();
  }, [isLoading, session, segments, router, hasHandledInitialDeepLink, navigateToResetPassword]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}