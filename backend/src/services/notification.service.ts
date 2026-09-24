const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (only once)
let firebaseInitialized = false;

function initFirebase(): void {
  if (firebaseInitialized) return;

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseInitialized = true;
    console.log('[Firebase] Admin SDK initialized');
  } catch (error) {
    console.error('[Firebase] Failed to initialize:', error);
  }
}

/**
 * Send a push notification to one or more FCM tokens.
 * Uses high-priority, loud alerts suitable for emergency notifications.
 */
export async function sendPushNotification(
  fcmTokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
): Promise<any | null> {
  // In development without Firebase credentials, just log
  if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
    console.log('\n──────────── PUSH NOTIFICATION ──────────────');
    console.log(`Tokens:  ${fcmTokens.length} recipients`);
    console.log(`Title:   ${title}`);
    console.log(`Body:    ${body}`);
    console.log(`Data:    ${JSON.stringify(data)}`);
    console.log('─────────────────────────────────────────────\n');
    return null;
  }

  initFirebase();

  const message: any = {
    tokens: fcmTokens,
    notification: { title, body },
    data,
    android: {
      priority: 'high',
      notification: {
        channelId: 'emergency_alerts',
        sound: 'emergency_alert',
        priority: 'max',
        visibility: 'public',
        defaultVibrateTimings: false,
        vibrateTimingsMillis: [0, 500, 200, 500],
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'emergency_alert.caf',
          'interruption-level': 'critical',
        },
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(
      `[FCM] Sent: ${response.successCount} success, ${response.failureCount} failed`
    );
    return response;
  } catch (error) {
    console.error('[FCM] Error sending notifications:', error);
    return null;
  }
}
