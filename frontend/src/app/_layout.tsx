import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('@find_scholar_token');
      } catch (e) {
        token = null;
      }

      const inAuth = segments[0] === 'login' || segments[0] === 'signup';

      if (!token && !inAuth) {
        router.replace('/login');
      } else if (token && inAuth) {
        router.replace('/(tabs)');
      }

      if (!ready) {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    };

    checkAuth();
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}