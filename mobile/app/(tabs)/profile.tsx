import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadProfilePhoto(result.assets[0].base64);
    }
  };

  const uploadProfilePhoto = async (base64Img: string) => {
    setUploading(true);
    try {
      // Upload to ImgBB (using a free API key for demonstration)
      const IMGBB_API_KEY = '5a688b1fcb4e3c35bbaee51e9b72d2fb'; // Public anonymous key
      const formData = new FormData();
      formData.append('image', base64Img);
      
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const imgbbData = await imgbbRes.json();
      
      if (imgbbData.success) {
        const photoUrl = imgbbData.data.url;
        // Save to backend
        await api.patch('/donor/profile-photo', { url: photoUrl });
        if (token && user) {
          setUser({ ...user, profilePhoto: photoUrl });
        }
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
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
            <Text style={[styles.eligibilityText, { color: '#F44336' }]}>Locked (Donated Recently)</Text>
          </View>
        ) : (
          <View style={[styles.eligibilityBadge, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
            <Text style={[styles.eligibilityText, { color: '#4CAF50' }]}>Eligible to Donate</Text>
          </View>
        )}
      </View>

      <Card style={styles.badgesCard}>
        <Text style={styles.sectionTitle}>Badges Earned</Text>
        <View style={styles.badgesRow}>
          <Badge type="HERO" size="large" />
          <Badge type="ORGANIZER" size="large" />
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Donation Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.donationCount || 0}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(user?.donationCount || 0) * 450}ml
            </Text>
            <Text style={styles.statLabel}>Blood Donated</Text>
          </View>
        </View>
      </Card>

      {user?.isLocked && user?.lockEndDate && (
        <LockCountdown lockEndDate={user.lockEndDate} />
      )}

      <Button
        title={t('profile.logout')}
        onPress={handleLogout}
        variant="danger"
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.primaryGhost, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary },
  langBtnText: { color: Colors.primary, fontWeight: '700' },
  profileHeader: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary, marginBottom: 12 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary, marginBottom: 12 },
  avatarText: { color: Colors.primary, fontSize: 36, fontWeight: '800' },
  uploadBadge: { position: 'absolute', bottom: 12, right: 0, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 2 },
  uploadBadgeText: { fontSize: 14 },
  userName: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userPhone: { color: Colors.textSecondary, fontSize: 14, marginBottom: 8 },
  bloodBadge: { backgroundColor: Colors.primaryGhost, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary, marginBottom: 12 },
  bloodBadgeText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  eligibilityBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  eligibilityText: { fontSize: 14, fontWeight: '700' },
  badgesCard: { marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  statsCard: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
});
