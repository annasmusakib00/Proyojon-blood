import axios from 'axios';

/**
 * Send a push notification to one or more Expo push tokens.
 * Uses high-priority, loud alerts suitable for emergency notifications.
 */
export async function sendPushNotification(
  fcmTokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
): Promise<any | null> {
  if (fcmTokens.length === 0) return null;

  const messages = fcmTokens.map(token => ({
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
    channelId: 'emergency_alerts',
  }));

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      }
    });
    console.log(`[Expo Push] Sent notification to ${fcmTokens.length} tokens`, response.data);
    return response.data;
  } catch (error) {
    console.error('[Expo Push] Error sending notifications:', error);
    return null;
  }
}
