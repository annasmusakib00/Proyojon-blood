import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LockCountdown } from '../../components/LockCountdown';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';
import api from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser, token } = useAuthStore();
  const { locale, toggleLocale } = useLocaleStore();
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/donor/me');
        if (res.data?.success && res.data.data) {
          setUser(res.data.data);
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const bloodGroupDisplay = (user?.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  const maskedPhone = user?.phone
    ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4)
    : '';

  const handleLogout = () => {
    Alert.alert(t('profile.title'), t('profile.logoutConfirm'), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setUploading(true);
    try {
      const IMGBB_API_KEY = '5a688b1fcb4e3c35bbaee51e9b72d2fb';
      
      // Read file as base64 using expo-file-system
      const FileSystem = await import('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Send as URL-encoded form data (most reliable method for React Native)
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image=${encodeURIComponent(base64)}`,
      });
      const imgbbData = await imgbbRes.json();
      
      if (imgbbData.success) {
        const photoUrl = imgbbData.data.url;
        await api.patch('/donor/profile-photo', { url: photoUrl });
        if (token && user) {
          setUser({ ...user, profilePhoto: photoUrl });
        }
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        throw new Error(imgbbData.error?.message || 'Upload failed on server');
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>{t('profile.title')}</Text>
        <TouchableOpacity style={styles.langToggle} onPress={toggleLocale}>
          <Feather name="globe" size={18} color={Colors.textSecondary} />
          <Text style={styles.langToggleText}>{locale === 'en' ? 'EN' : 'BN'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          {user?.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.uploadBadge}>
            <Text style={styles.uploadBadgeText}>📷</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{user?.name}</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Feather name="edit-2" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userPhone}>{maskedPhone}</Text>
        
        <View style={styles.inlineBadges}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{bloodGroupDisplay}</Text>
          </View>
          {user?.isLocked ? (
            <View style={[styles.eligibilityBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: Colors.warning }]}>
              <Text style={[styles.eligibilityText, { color: Colors.warning }]}>{t('profile.locked')}</Text>
            </View>
          ) : (
            <View style={[styles.eligibilityBadge, { backgroundColor: 'rgba(16, 185, 129, 0.10)', borderColor: Colors.success }]}>
              <Text style={[styles.eligibilityText, { color: Colors.success }]}>{t('profile.eligible')}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Card style={styles.halfCard}>
          <Text style={styles.sectionTitle}>🏅 {t('profile.badges')}</Text>
          <View style={styles.badgesRow}>
            {user?.badges?.some((b: any) => b.badgeType === 'HERO') && (
              <Badge type="HERO" size="small" />
            )}
            {user?.badges?.some((b: any) => b.badgeType === 'ORGANIZER') && (
              <Badge type="ORGANIZER" size="small" />
            )}
            {(!user?.badges || user.badges.length === 0) && (
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>{t('profile.noBadges')}</Text>
            )}
          </View>
        </Card>

        <Card style={styles.halfCard}>
          <Text style={styles.sectionTitle}>🩸 {t('profile.donations')}</Text>
          <Text style={styles.statValue}>{user?.donationCount || 0}</Text>
        </Card>
      </View>

      {user?.isLocked && user?.lockEndDate && (
        <View style={{ marginBottom: 12 }}>
          <LockCountdown lockEndDate={user.lockEndDate} />
        </View>
      )}

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="bell" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Notification Settings</Text>
          <Feather name="chevron-right" size={20} color={Colors.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="map-pin" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Location / Address</Text>
          <Feather name="chevron-right" size={20} color={Colors.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/history')}>
          <Feather name="clock" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Donation History</Text>
          <Feather name="chevron-right" size={20} color={Colors.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="help-circle" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Feather name="chevron-right" size={20} color={Colors.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={Colors.error} style={styles.menuIcon} />
          <Text style={[styles.menuItemText, { color: Colors.error }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { flexGrow: 1, padding: 16, paddingTop: 50, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  langToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 6 },
  langToggleText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.4)', marginBottom: 8 },
  avatarImage: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.4)', marginBottom: 8 },
  avatarText: { color: Colors.primary, fontSize: 32, fontWeight: '800' },
  uploadBadge: { position: 'absolute', bottom: 8, right: 0, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 2 },
  uploadBadgeText: { fontSize: 12 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  userName: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  editBtn: { marginLeft: 8, padding: 4 },
  userPhone: { color: Colors.textSecondary, fontSize: 13, marginBottom: 8 },
  inlineBadges: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bloodBadge: { backgroundColor: Colors.primaryGhost, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary },
  bloodBadgeText: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  eligibilityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1 },
  eligibilityText: { fontSize: 12, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  halfCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  statValue: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  menuList: { marginTop: 4, paddingBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuIcon: { marginRight: 14 },
  menuItemText: { color: Colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
});
