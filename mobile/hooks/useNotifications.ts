import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useNotificationStore } from '../stores/notificationStore';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const setIncomingAlert = useNotificationStore((s) => s.setIncomingAlert);

  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    const setup = async () => {
      try {
        // Expo Go SDK 53 throws error if expo-notifications is used.
        if (Constants.appOwnership === 'expo') {
          console.warn('[Notifications] Push notifications are not supported in Expo Go. Falling back to polling.');
          
          // Fallback polling for Expo Go
          const pollInterval = setInterval(async () => {
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
            } catch (err) {
              // Ignore network errors in background
            }
          }, 10000); // Check every 10 seconds
          
          // Expose interval to be cleared, though it's global for the app lifetime
          (global as any).__expoPolling = pollInterval;
          return;
        }

        const Device = await import('expo-device');
        if (!Device.isDevice) {
          console.warn('[Notifications] Push only works on physical devices');
          return;
        }

        const Notifications = await import('expo-notifications');
        const { updateFcmToken } = await import('../services/donor');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
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
