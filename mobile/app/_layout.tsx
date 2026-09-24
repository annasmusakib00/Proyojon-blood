import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { useLocation } from '../hooks/useLocation';
import { DonorAlert } from '../components/DonorAlert';
import { ProxyForm } from '../components/ProxyForm';
import { useNotificationStore } from '../stores/notificationStore';
import { Colors } from '../constants/colors';
import * as requestsService from '../services/requests';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const { incomingAlert, clearAlert } = useNotificationStore();
  const [showProxyForm, setShowProxyForm] = useState(false);
  const [proxyLoading, setProxyLoading] = useState(false);

  // Initialize push notifications (gracefully degrades in Expo Go)
  useNotifications();

  // Initialize location tracking
  useLocation();

  // Load token on app launch
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Auth guard
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/register');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // DonorAlert actions
  const handleAcceptRequest = async () => {
    if (!incomingAlert) return;
    try {
      await requestsService.acceptRequest(incomingAlert.requestId);
      clearAlert();
      router.push(`/request/${incomingAlert.requestId}`);
    } catch (err) {
      console.error('[Accept] Error:', err);
    }
  };

  const handleProxySubmit = async (proxyName: string, proxyPhone: string) => {
    if (!incomingAlert) return;
    setProxyLoading(true);
    try {
      await requestsService.submitProxy(
        incomingAlert.requestId,
        proxyName,
        proxyPhone
      );
      setShowProxyForm(false);
      clearAlert();
    } catch (err) {
      console.error('[Proxy] Error:', err);
    } finally {
      setProxyLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!incomingAlert) return;
    try {
      await requestsService.declineRequest(incomingAlert.requestId);
    } catch (err) {
      console.error('[Decline] Error:', err);
    }
    clearAlert();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="request/[id]"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="request/complete"
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>

      {/* Full-screen DonorAlert overlay */}
      {incomingAlert && !showProxyForm && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
          <DonorAlert
            requestId={incomingAlert.requestId}
            bloodGroup={incomingAlert.bloodGroup}
            bagsNeeded={incomingAlert.bagsNeeded}
            hospitalName={incomingAlert.hospitalName}
            conveyanceAmount={incomingAlert.conveyanceAmount}
            onAccept={handleAcceptRequest}
            onProxy={() => setShowProxyForm(true)}
            onDecline={handleDeclineRequest}
          />
        </View>
      )}

      <ProxyForm
        visible={showProxyForm}
        onSubmit={handleProxySubmit}
        onClose={() => setShowProxyForm(false)}
        loading={proxyLoading}
      />
    </View>
  );
}
