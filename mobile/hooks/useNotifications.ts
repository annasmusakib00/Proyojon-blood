import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('[Notifications] expo-notifications not available in this environment (likely Expo Go Android). Push notifications disabled.');
}

import { useNotificationStore } from '../stores/notificationStore';
import { updateFcmToken } from '../services/donor';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const setIncomingAlert = useNotificationStore((s) => s.setIncomingAlert);

  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    const setup = async () => {
      try {
        // Expo push notifications require backend Firebase setup that is not fully completed yet.
        // We will use polling everywhere for now so that testing in both Expo Go and built APK works perfectly.
        const pollInterval = setInterval(async () => {
          const { useAuthStore } = await import('../stores/authStore');
          if (!useAuthStore.getState().isAuthenticated) return;

          try {
            const api = (await import('../services/api')).default;
            const res = await api.get('/donor/pending-requests');
            if (res.data?.success && res.data?.data?.length > 0) {
              const reqData = res.data.data[0];
              setIncomingAlert({
                requestId: reqData.id,
                bloodGroup: reqData.bloodGroup,
                bagsNeeded: reqData.bagsNeeded,
                hospitalName: reqData.hospitalName,
                conveyanceAmount: reqData.conveyanceAmount,
              });
            }
          } catch (err: any) {
            console.warn('[Polling] Error fetching pending requests:', err?.response?.status || err?.message || err);
          }
        }, 10000); // Check every 10 seconds
        
        // Expose interval to be cleared, though it's global for the app lifetime
        (globalThis as any).__expoPolling = pollInterval;

        // Now proceeding to Expo Push Notification setup

        if (!Device.isDevice) {
          console.warn('[Notifications] Push only works on physical devices');
          return;
        }
        
        if (!Notifications) {
          console.warn('[Notifications] Not supported in this environment');
          return;
        }

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        setExpoPushToken(token);

        try {
          await updateFcmToken(token);
        } catch (e) {
          // Ignore backend network errors here to prevent crash
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('emergency_alerts', {
            name: 'Emergency Blood Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#DC2626',
            enableVibrate: true,
          });
        }

        notificationListener = Notifications.addNotificationReceivedListener(
          (notification) => {
            const data = notification.request.content.data;
            if (data?.type === 'emergency_request') {
              setIncomingAlert({
                requestId: data.requestId as string,
                bloodGroup: data.bloodGroup as string,
                bagsNeeded: Number(data.bagsNeeded) || 1,
                hospitalName: data.hospitalName as string,
                conveyanceAmount: Number(data.conveyanceAmount) || 200,
              });
            }
          }
        );

        responseListener = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data;
            if (data?.type === 'emergency_request' && data?.requestId) {
              router.push(`/request/${data.requestId}`);
            }
          }
        );
      } catch (error) {
        console.warn('[Notifications] Setup failed:', error);
      }
    };

    setup();

    return () => {
      if (notificationListener) notificationListener.remove();
      if (responseListener) responseListener.remove();
    };
  }, [setIncomingAlert]);

  return { expoPushToken };
}
