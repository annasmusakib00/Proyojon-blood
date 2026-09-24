import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Constants.appOwnership === 'expo') {
      return null;
    }

    const Device = await import('expo-device');
    if (!Device.isDevice) {
      return null;
    }

    const Notifications = await import('expo-notifications');
    const { updateFcmToken } = await import('./donor');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    try {
      await updateFcmToken(token);
    } catch (error) {
      // Ignore backend network errors here
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

    return token;
  } catch (error) {
    return null;
  }
}

export async function configureForegroundNotifications(): Promise<void> {
  try {
    if (Constants.appOwnership === 'expo') return;
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    // Ignore
  }
}
