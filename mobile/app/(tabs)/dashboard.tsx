import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Toggle';
import { Badge } from '../../components/ui/Badge';
import { LockCountdown } from '../../components/LockCountdown';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';
import * as donorService from '../../services/donor';
import * as requestsService from '../../services/requests';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { locale } = useLocaleStore(); // Subscribe for locale changes
  const [refreshing, setRefreshing] = useState(false);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const { width } = Dimensions.get('window');
  const SLIDE_WIDTH = width - 40;
  
  const slideImages = [
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=800&auto=format&fit=crop',
  ];

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!user?.isLocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [user?.isLocked, pulseAnim]);

  const loadRecentActivity = async () => {
    try {
      const result = await requestsService.getHistory('requester');
      setRecentRequests(result.data?.slice(0, 3) || []);
    } catch (err) {
      // Silently fail for recent activity
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentActivity();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecentActivity();
  }, []);

  // Manual toggle removed because eligibility is now automatic

  const bloodGroupDisplay = (user?.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('dashboard.greeting', { name: '' }).replace(' , ', '').replace(',', '')}</Text>
          <Text style={styles.userName}>{user?.name || 'Donor'} 👋</Text>
        </View>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodBadgeText}>{bloodGroupDisplay}</Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.slider}
        >
          {slideImages.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={[styles.slideImage, { width: SLIDE_WIDTH }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>

      {user?.isLocked ? (
        <View style={styles.lockedContainer}>
          <LockCountdown lockEndDate={user.lockEndDate!} />
        </View>
      ) : (
        <View style={[styles.eligibilityCard, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
          <View style={styles.statusRow}>
            <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }], backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.availabilityLabel, { color: '#4CAF50' }]}>
              {t('dashboard.available')}
            </Text>
          </View>
          <Text style={[styles.availabilityHint, { color: '#2E7D32' }]}>
            আপনি এখন রক্তদানের জন্য প্রস্তুত
          </Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{user?.donationCount || 0}</Text>
          <Text style={styles.statLabel}>{t('dashboard.donations')}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Badge type="HERO" size="small" />
          <Text style={styles.statLabel}>Hero</Text>
        </Card>
        <Card style={styles.statCard}>
          <Badge type="ORGANIZER" size="small" />
          <Text style={styles.statLabel}>Organizer</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentRequests.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No recent activity</Text>
          </Card>
        ) : (
          recentRequests.map((req: any) => (
            <TouchableOpacity
              key={req.id}
              onPress={() => router.push(`/request/${req.id}`)}
            >
              <Card style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <Text style={styles.activityBlood}>
                    {req.bloodGroup?.replace('_POS', '+').replace('_NEG', '−')}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityHospital}>
                      {req.hospitalName}
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          req.status === 'COMPLETED'
                            ? Colors.success + '22'
                            : req.status === 'PENDING'
                              ? Colors.warning + '22'
                              : Colors.info + '22',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            req.status === 'COMPLETED'
                              ? Colors.success
                              : req.status === 'PENDING'
                                ? Colors.warning
                                : Colors.info,
                        },
                      ]}
                    >
                      {req.status}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Button
        title={`🩸 ${t('dashboard.requestBlood')}`}
        onPress={() => router.push('/(tabs)/request')}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: Colors.textSecondary, fontSize: 15 },
  userName: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  bloodBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  bloodBadgeText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  availabilityCard: { marginBottom: 20 },
  eligibilityCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20, alignItems: 'center' },
  lockedContainer: { marginBottom: 20 },
  sliderContainer: { marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  slider: { borderRadius: 16 },
  slideImage: { height: 160, borderRadius: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  availabilityLabel: { fontSize: 18, fontWeight: '800' },
  availabilityHint: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { color: Colors.text, fontSize: 28, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  section: { gap: 10 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', paddingVertical: 8 },
  activityCard: { marginBottom: 8 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityBlood: { color: Colors.primary, fontSize: 18, fontWeight: '800', width: 40 },
  activityHospital: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  activityDate: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
