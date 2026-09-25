import React, { useEffect, useState, useRef } from 'react';
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
import { Badge } from '../../components/ui/Badge';
import { LockCountdown } from '../../components/LockCountdown';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';
import * as requestsService from '../../services/requests';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locale } = useLocaleStore(); 
  const [refreshing, setRefreshing] = useState(false);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const { width } = Dimensions.get('window');
  const SLIDE_WIDTH = width - 32; // 16 padding on each side
  
  const slideImages = [
    { uri: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800', text: 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি মুমূর্ষু প্রাণ' },
    { uri: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800', text: 'জরুরী মুহূর্তে রক্তদান করুন, মানবতার সেবায় এগিয়ে আসুন' },
    { uri: 'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=800', text: 'রক্তের অভাবে যেন কোনো জীবন ঝরে না যায়' },
  ];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextSlide = currentSlide + 1;
      if (nextSlide >= slideImages.length) {
        nextSlide = 0;
      }
      scrollViewRef.current?.scrollTo({ x: nextSlide * SLIDE_WIDTH, animated: true });
      setCurrentSlide(nextSlide);
    }, 1500); // 1.5 seconds slide
    
    return () => clearInterval(timer);
  }, [currentSlide]);

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
      // Limit to 1 for fitting into the screen
      setRecentRequests(result.data?.slice(0, 1) || []);
    } catch (err) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentActivity();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const bloodGroupDisplay = (user?.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
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
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={styles.slider}
          >
            {slideImages.map((slide, index) => (
              <View key={index} style={[styles.slideWrapper, { width: SLIDE_WIDTH }]}>
                <Image
                  source={{ uri: slide.uri }}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
                <View style={styles.slideOverlay}>
                  <Text style={styles.slideText}>{slide.text}</Text>
                </View>
              </View>
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
            <Card style={styles.emptyCard}>
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

        <View style={styles.footerContainer}>
          <Button
            title={`🩸 ${t('dashboard.requestBlood')}`}
            onPress={() => router.push('/(tabs)/request')}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greeting: { color: Colors.textSecondary, fontSize: 13 },
  userName: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  bloodBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  bloodBadgeText: { color: Colors.primary, fontSize: 15, fontWeight: '800' },
  
  sliderContainer: { marginBottom: 12, borderRadius: 12, overflow: 'hidden', height: 110 },
  slider: { borderRadius: 12 },
  slideWrapper: { position: 'relative', height: 110 },
  slideImage: { width: '100%', height: '100%', borderRadius: 12 },
  slideOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  slideText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  eligibilityCard: { padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  lockedContainer: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  availabilityLabel: { fontSize: 16, fontWeight: '800' },
  availabilityHint: { fontSize: 12, marginTop: 2, fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 10, marginTop: 2 },

  section: { flex: 1 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyCard: { paddingVertical: 16 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', fontSize: 13 },
  activityCard: { marginBottom: 8, paddingVertical: 10, paddingHorizontal: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityBlood: { color: Colors.primary, fontSize: 16, fontWeight: '800', width: 32 },
  activityHospital: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  activityDate: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '700' },

  footerContainer: { marginTop: 'auto', paddingTop: 8, paddingBottom: 16 },
  actionButton: { height: 48 },
});
