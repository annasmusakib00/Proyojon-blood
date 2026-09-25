import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
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
  const { user, logout, setUser, token } = useAuthStore();
  const { locale, toggleLocale } = useLocaleStore();
  const [uploading, setUploading] = useState(false);

  const bloodGroupDisplay = (user?.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  const maskedPhone = user?.phone
    ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4)
    : '';

  const handleLogout = () => {
    Alert.alert(t('profile.title'), 'Are you sure you want to log out?', [
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
      
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>{t('profile.title')}</Text>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLocale}>
          <Text style={styles.langBtnText}>{locale === 'en' ? 'বাংলা' : 'English'}</Text>
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

        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userPhone}>{maskedPhone}</Text>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodBadgeText}>{bloodGroupDisplay}</Text>
        </View>

        {user?.isLocked ? (
          <View style={[styles.eligibilityBadge, { backgroundColor: '#FFEBEE', borderColor: '#F44336' }]}>
            <Text style={[styles.eligibilityText, { color: '#F44336' }]}>Locked</Text>
          </View>
        ) : (
          <View style={[styles.eligibilityBadge, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
            <Text style={[styles.eligibilityText, { color: '#4CAF50' }]}>Eligible</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionRow}>
        <Card style={styles.halfCard}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesRow}>
            <Badge type="HERO" size="small" />
            <Badge type="ORGANIZER" size="small" />
          </View>
        </Card>

        <Card style={styles.halfCard}>
          <Text style={styles.sectionTitle}>Donations</Text>
          <Text style={styles.statValue}>{user?.donationCount || 0}</Text>
        </Card>
      </View>

      {user?.isLocked && user?.lockEndDate && (
        <View style={{ marginBottom: 12 }}>
          <LockCountdown lockEndDate={user.lockEndDate} />
        </View>
      )}

      <View style={styles.footerContainer}>
        <Button
          title={t('profile.logout')}
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.primaryGhost, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary },
  langBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary, marginBottom: 8 },
  avatarImage: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: Colors.primary, marginBottom: 8 },
  avatarText: { color: Colors.primary, fontSize: 32, fontWeight: '800' },
  uploadBadge: { position: 'absolute', bottom: 8, right: 0, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 2 },
  uploadBadgeText: { fontSize: 12 },
  userName: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 2 },
  userPhone: { color: Colors.textSecondary, fontSize: 13, marginBottom: 6 },
  bloodBadge: { backgroundColor: Colors.primaryGhost, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary, marginBottom: 8 },
  bloodBadgeText: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  eligibilityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1 },
  eligibilityText: { fontSize: 12, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  halfCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  statValue: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  footerContainer: { marginTop: 'auto', paddingBottom: 16 },
  logoutBtn: { height: 48 },
});
