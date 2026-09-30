import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';
import * as requestsService from '../../services/requests';
import { LockCountdown } from '../../components/LockCountdown';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locale } = useLocaleStore();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = Dimensions.get('window');
  const SLIDE_WIDTH = width - 32;

  const slideImages = [
    { uri: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800', text: 'আপনার এক ব্যাগ রক্ত\nবাঁচাতে পারে একটি প্রাণ' },
    { uri: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800', text: 'জরুরী মুহূর্তে রক্তদান করুন,\nমানবতার সেবায় এগিয়ে আসুন' },
    { uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800', text: 'রক্তের অভাবে যেন\nকোনো জীবন ঝরে না যায়' },
  ];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
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
    }, 5000);

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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [buttonScaleAnim]);

  const loadRecentActivity = async () => {
    try {
      const result = await requestsService.getHistory('requester');
      setRecentRequests(result.data?.slice(0, 1) || []);

      const api = (await import('../../services/api')).default;
      const profileRes = await api.get('/donor/me');
      if (profileRes.data?.success && profileRes.data.data) {
        useAuthStore.getState().setUser(profileRes.data.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const bloodGroupDisplay = (user?.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentActivity();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/header-bg.jpg')}
        style={styles.topHeader}
        imageStyle={{ opacity: 0.15, resizeMode: 'cover' }}
      >
        <View style={styles.headerInfo}>
          <Image 
            source={{ uri: user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random` }} 
            style={styles.profileAvatar} 
          />
          <View>
            <Text style={styles.greeting}>{t('dashboard.greeting', { name: '' }).replace(' , ', '').replace(',', '')}</Text>
            <Text style={styles.userName}>{user?.name || 'ব্যবহারকারী'} 👋</Text>
          </View>
        </View>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodBadgeText}>{bloodGroupDisplay}</Text>
        </View>
      </ImageBackground>

      <View style={styles.contentBgWrapper}>
        <ImageBackground 
          source={require('../../assets/images/body-bg.jpg')} 
          style={{ flex: 1 }} 
          imageStyle={{ opacity: 0.035, resizeMode: 'cover' }}
        >
          <ScrollView 
        style={styles.contentScroll} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
            colors={[Colors.primary]} 
          />
        }
      >
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
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                  style={styles.slideOverlay}
                >
                  <Text style={styles.slideText}>{slide.text}</Text>
                  <View style={styles.slideIndicatorRow}>
                    {slideImages.map((_, i) => (
                      <View key={i} style={[styles.slideIndicator, currentSlide === i && styles.slideIndicatorActive]} />
                    ))}
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {user?.isLocked ? (
          <View style={styles.lockedContainer}>
            <LockCountdown lockEndDate={user.lockEndDate!} />
          </View>
        ) : (
          <View style={styles.eligibilityCard}>
            <View style={styles.statusRow}>
              <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.availabilityLabel}>
                {t('dashboard.available')}
              </Text>
            </View>
            <Text style={styles.availabilityHint}>
              {t('dashboard.readyMessage')}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{user?.donationCount || 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.donations')}</Text>
          </Card>
          {user?.badges?.some((b: any) => b.badgeType === 'HERO') && (
            <Card style={styles.statCard}>
              <Badge type="HERO" size="small" />
              <Text style={styles.statLabel}>হিরো</Text>
            </Card>
          )}
          {user?.badges?.some((b: any) => b.badgeType === 'ORGANIZER') && (
            <Card style={styles.statCard}>
              <Badge type="ORGANIZER" size="small" />
              <Text style={styles.statLabel}>সংগঠক</Text>
            </Card>
          )}
          {(!user?.badges || user.badges.length === 0) && (
            <Card style={styles.statCard}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>🏅</Text>
              </View>
              <Text style={styles.statLabel}>শীঘ্রই আসছে</Text>
            </Card>
          )}
        </View>

        <View style={styles.actionContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(tabs)/request');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.requestButton}
              >
                <Feather name="search" size={52} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.requestButtonLabelText}>
            {t('dashboard.requestBlood')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
          {recentRequests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('dashboard.noActivity')}</Text>
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
                        {new Date(req.createdAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            req.status === 'EXPIRED'
                              ? Colors.surfaceLight
                              : req.status === 'COMPLETED'
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
                              req.status === 'EXPIRED'
                                ? Colors.textMuted
                                : req.status === 'COMPLETED'
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
      </ScrollView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  contentBgWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  contentScroll: { 
    flex: 1, 
  },
  contentContainer: { flexGrow: 1, padding: 16, paddingTop: 20, paddingBottom: 110 },
  topHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 54, // Adjust for status bar
    paddingBottom: 20, 
    backgroundColor: Colors.primary,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
  userName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  bloodBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  bloodBadgeText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },

  sliderContainer: { marginBottom: 12, borderRadius: 16, overflow: 'hidden', height: 160 },
  slider: { borderRadius: 16 },
  slideWrapper: { position: 'relative', height: 160 },
  slideImage: { width: '100%', height: '100%', borderRadius: 16 },
  slideOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%',
    justifyContent: 'flex-end', padding: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
  },
  slideText: {
    color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  slideIndicatorRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  slideIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  slideIndicatorActive: { width: 20, backgroundColor: '#fff' },

  eligibilityCard: {
    padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 12, alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: Colors.success,
  },
  lockedContainer: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  availabilityLabel: { fontSize: 16, fontWeight: '800', color: Colors.success },
  availabilityHint: { fontSize: 12, marginTop: 2, fontWeight: '500', color: Colors.success },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },

  section: { flex: 1 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyCard: { paddingVertical: 16 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', fontSize: 13 },
  activityCard: { marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityBlood: { color: Colors.primary, fontSize: 16, fontWeight: '800', width: 32 },
  activityHospital: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  activityDate: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '700' },

  actionContainer: { paddingVertical: 24, alignItems: 'center' },
  requestButton: {
    backgroundColor: Colors.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  requestButtonLabelText: {
    marginTop: 16,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
