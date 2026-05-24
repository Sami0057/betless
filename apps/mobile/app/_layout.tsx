import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../src/lib/theme';
import { useAuthStore } from '../src/store/auth.store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    async function init() {
      await fetchMe();
      await SplashScreen.hideAsync();
    }
    init();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.black} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.dark },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '900' },
          contentStyle: { backgroundColor: colors.black },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account', headerBackTitle: 'Back' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="badges" options={{ title: 'My Badges' }} />
        <Stack.Screen name="predictions" options={{ title: 'Prediction History' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      </Stack>
    </>
  );
}
