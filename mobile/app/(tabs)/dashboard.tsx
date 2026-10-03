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
  Modal,
  Pressable
} from 'react-native';
import { CustomRefreshScrollView } from '../../components/CustomRefreshScrollView';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';
import * as requestsService from '../../services/requests';
import { getPosts, Post } from '../../services/post';
import { LockCountdown } from '../../components/LockCountdown';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locale, toggleLocale } = useLocaleStore();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = Dimensions.get('window');
  const SLIDE_WIDTH = width - 32;

  const slideImages = [
    require('../../assets/images/slider1.png'),
    require('../../assets/images/slider2.png'),
    require('../../assets/images/slider3.png'),
    require('../../assets/images/slider4.png'),
    require('../../assets/images/slider5.png'),
  ];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-width * 0.8)).current;

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSidebarOpen(false));
  };

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

      const recentPosts = await getPosts();
      setPosts(recentPosts || []);
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
          <TouchableOpacity onPress={openSidebar} activeOpacity={0.8}>
            <Image 
              source={{ uri: user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random` }} 
              style={styles.profileAvatar} 
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t('dashboard.greeting', { name: '' }).replace(' , ', '').replace(',', '')}</Text>
            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'ব্যবহারকারী'} 👋</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/donors')}
            style={styles.headerSearchIcon}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{bloodGroupDisplay}</Text>
          </View>
        </View>
      </ImageBackground>

      <CustomRefreshScrollView
        outerStyle={{ flex: 1 }}
        innerStyle={[styles.contentBgWrapper, { marginTop: -26 }]}
        imageBackgroundSource={require('../../assets/images/body-bg.jpg')}
        imageBackgroundStyle={{ opacity: 0.05, resizeMode: 'cover' }}
        style={styles.contentScroll} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View style={styles.headerHandleBar} />
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
              setCurrentSlide(slideIndex);
            }}
            style={styles.slider}
          >
            {slideImages.map((slide, index) => (
              <View key={index} style={[styles.slideWrapper, { width: SLIDE_WIDTH, height: '100%' }]}>
                <Image
                  source={slide}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
                <View style={styles.slideIndicatorRow}>
                  {slideImages.map((_, i) => (
                    <View key={i} style={[styles.slideIndicator, currentSlide === i && styles.slideIndicatorActive]} />
                  ))}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.statValue}>{user?.donationCount || 0}</Text>
              <Ionicons name="water" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>{t('dashboard.donations')}</Text>
          </Card>
          {user?.badges?.some((b: any) => b.badgeType === 'HERO') && (
            <Card style={styles.statCard}>
              <Badge type="HERO" size="small" />
              <Text style={styles.statLabel}>{t('dashboard.hero')}</Text>
            </Card>
          )}
          {user?.badges?.some((b: any) => b.badgeType === 'ORGANIZER') && (
            <Card style={styles.statCard}>
              <Badge type="ORGANIZER" size="small" />
              <Text style={styles.statLabel}>{t('dashboard.organizer')}</Text>
            </Card>
          )}
          {(!user?.badges || user.badges.length === 0) && (
            <Card style={styles.statCard}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>🏅</Text>
              </View>
              <Text style={styles.statLabel}>{t('dashboard.comingSoon')}</Text>
            </Card>
          )}
        </View>

        {/* Action Buttons: History and Post */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' }]}>
            <TouchableOpacity 
              style={{ flex: 1, width: '100%', paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }} 
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/history')}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(138, 3, 3, 0.08)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="time" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>ইতিহাস</Text>
            </TouchableOpacity>
          </Card>

          <Card style={[styles.statCard, { paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' }]}>
            <TouchableOpacity 
              style={{ flex: 1, width: '100%', paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }} 
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/create-post')}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(138, 3, 3, 0.08)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="create" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>পোস্ট করুন</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
          {recentRequests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('dashboard.noActivity')}</Text>
            </Card>
          ) : (
            recentRequests.map((item: any) => (
              <TouchableOpacity
                key={item.id || item._id}
                onPress={() => router.push(`/request/${item.id || item._id}`)}
              >
                <Card style={styles.activityCard}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityBlood}>
                      {item.bloodGroup?.replace('_POS', '+').replace('_NEG', '−')}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityHospital}>
                        {item.hospitalName}
                      </Text>
                      <Text style={styles.activityDate}>
                        {new Date(item.createdAt).toLocaleDateString('bn-BD', {
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
                            item.status === 'EXPIRED'
                              ? Colors.surfaceLight
                              : item.status === 'COMPLETED'
                                ? Colors.success + '22'
                                : item.status === 'PENDING'
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
                              item.status === 'EXPIRED'
                                ? Colors.textMuted
                                : item.status === 'COMPLETED'
                                  ? Colors.success
                                  : item.status === 'PENDING'
                                    ? Colors.warning
                                    : Colors.info,
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Community Posts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>কমিউনিটি পোস্ট</Text>
          {posts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>কোনো পোস্ট পাওয়া যায়নি</Text>
            </Card>
          ) : (
            posts.map((post: any) => (
              <Card key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Image 
                    source={{ uri: post.author.profilePhoto || `https://ui-avatars.com/api/?name=${post.author.name}&background=random` }} 
                    style={styles.postAvatar} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postAuthorName}>{post.author.name}</Text>
                    <Text style={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
              </Card>
            ))
          )}
        </View>
      </CustomRefreshScrollView>
    
      <Modal
        visible={isSidebarOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeSidebar} />
          <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: sidebarAnim }] }]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarHeaderTop}>
                <Image source={{ uri: user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random` }} style={styles.sidebarAvatarLarge} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity 
                    onPress={toggleLocale}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 }}
                  >
                    <Feather name="globe" size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>
                      {locale === 'en' ? 'EN' : 'BN'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeSidebar} style={styles.closeSidebarBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.sidebarName}>{user?.name || 'ব্যবহারকারী'}</Text>
                  {user?.phone && <Text style={styles.sidebarPhone}>{user.phone}</Text>}
                </View>
                <TouchableOpacity 
                  onPress={() => { closeSidebar(); router.push('/(tabs)/profile'); }}
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sidebarSectionRow}>
                <View style={styles.sidebarSectionBox}>
                  <Text style={styles.sidebarSectionTitle}>রক্তের গ্রুপ</Text>
                  <Text style={[styles.sidebarSectionValue, { color: Colors.primary }]}>{bloodGroupDisplay}</Text>
                </View>
                <View style={styles.sidebarSectionBox}>
                  <Text style={styles.sidebarSectionTitle}>রক্তদান</Text>
                  <Text style={styles.sidebarSectionValue}>{user?.donationCount || 0} বার</Text>
                </View>
              </View>

              <View style={styles.sidebarDivider} />

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => { closeSidebar(); router.push('/(tabs)/request'); }}>
                <Ionicons name="water-outline" size={22} color={Colors.text} />
                <Text style={styles.sidebarMenuText}>আবেদন (Request)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => { closeSidebar(); router.push('/(tabs)/donors'); }}>
                <Ionicons name="people-outline" size={22} color={Colors.text} />
                <Text style={styles.sidebarMenuText}>ডোনার (Donor)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => { closeSidebar(); router.push('/(tabs)/create-post'); }}>
                <Ionicons name="create-outline" size={22} color={Colors.text} />
                <Text style={styles.sidebarMenuText}>পোস্ট করুন</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => { closeSidebar(); router.push('/(tabs)/history'); }}>
                <Ionicons name="document-text-outline" size={22} color={Colors.text} />
                <Text style={styles.sidebarMenuText}>{t('tabs.history')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => { closeSidebar(); /* handle logout */ useAuthStore.getState().logout?.(); }}>
                <Ionicons name="log-out-outline" size={22} color={Colors.error} />
                <Text style={[styles.sidebarMenuText, { color: Colors.error }]}>{locale === 'en' ? 'Logout' : 'লগ আউট'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  contentBgWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  contentScroll: { 
    flex: 1, 
  },
  contentContainer: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 130 },
  topHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 54, // Adjust for status bar
    paddingBottom: 42, 
    backgroundColor: Colors.primary,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 16 },
  profileAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    borderWidth: 2.5, 
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' },
  userName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bloodBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4
  },
  bloodBadgeText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  headerSearchIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center'
  },
  headerHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

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
    padding: 12, borderRadius: 14, marginBottom: 12, alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  lockedContainer: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  availabilityLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
  availabilityHint: { fontSize: 12, marginTop: 2, fontWeight: '600', color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { 
    flex: 1, alignItems: 'center', paddingVertical: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8
  },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4, fontWeight: '600' },

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

  actionContainer: { paddingVertical: 20 },
  newRequestButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginVertical: 10,
    width: '100%',
  },
  leftPillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 40,
  },
  leftPillBody: {
    flex: 1,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    paddingLeft: 10,
  },
  leftPillArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 21,
    borderBottomWidth: 21,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.primaryDark,
  },
  rightPillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
  },
  rightPillArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 21,
    borderBottomWidth: 21,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.primary,
  },
  rightPillBody: {
    flex: 1,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    paddingRight: 10,
  },
  requestButtonCenterCircle: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -32, // Center exactly
    width: 64, 
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12, // Stronger 3D shadow
    shadowColor: Colors.primaryDark, // Colored shadow for glow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#FFF5F5', // Light rim
    zIndex: 10, // Ensure it's above
  },
  requestButtonInnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(138, 3, 3, 0.06)', // Light red tint
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 3, 3, 0.15)', // Subtle inner ring
  },
  requestButtonTextSide: {
    color: '#FFFFFF',
    fontSize: 16, // Larger text
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebarContainer: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: Colors.background,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  sidebarHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 64, // Status bar padding approx
    paddingHorizontal: 20,
    paddingBottom: 12, // Shrunk from bottom
    borderBottomRightRadius: 24,
  },
  sidebarHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // Reduced margin
  },
  sidebarAvatarLarge: {
    width: 56, // Reduced size
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  closeSidebarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarName: {
    color: '#FFF',
    fontSize: 18, // Reduced size
    fontWeight: '800',
  },
  sidebarPhone: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13, // Reduced size
    marginTop: 2,
    fontWeight: '500',
  },
  sidebarContent: {
    flex: 1,
    padding: 20,
  },
  sidebarSectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sidebarSectionBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sidebarSectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  sidebarSectionValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  sidebarMenuText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    marginTop: 8,
  },
  actionButtonCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(138, 3, 3, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  postCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  postDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
