import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  TextInput,
  ImageBackground,
} from 'react-native';
import { CustomRefreshScrollView } from '../../components/CustomRefreshScrollView';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const [address, setAddress] = useState(user?.locationText || '');
  const [showHelp, setShowHelp] = useState(false);
  const [isEditNameVisible, setEditNameVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const handleSaveName = async () => {
    try {
      await api.patch('/donor/profile', { name: newName });
      setUser({ ...user, name: newName } as any);
      setEditNameVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update name');
    }
  };

  const handleSaveAddress = async () => {
    try {
      await api.patch('/donor/profile', { locationText: address });
      setUser({ ...user, locationText: address } as any);
      Alert.alert("Success", "Address saved successfully.");
    } catch (err) {
      Alert.alert('Error', 'Failed to update address');
    }
  };

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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/donor/me');
      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch (err) {}
    setRefreshing(false);
  };

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
      base64: true, // Ask for base64 encoding
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadProfilePhoto(result.assets[0].base64);
    }
  };

  const uploadProfilePhoto = async (base64Data: string) => {
    setUploading(true);
    try {
      const IMGBB_API_KEY = '92e878c94ca2e2da7bdb797109718cba';
      
      const formData = new FormData();
      formData.append('image', base64Data);
      
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
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>{t('profile.title')}</Text>
          <TouchableOpacity style={styles.langToggle} onPress={toggleLocale}>
            <Feather name="globe" size={18} color="#FFF" />
            <Text style={styles.langToggleText}>{locale === 'en' ? 'EN' : 'BN'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomRefreshScrollView 
        outerStyle={{ flex: 1 }}
        innerStyle={styles.contentBgWrapper}
        imageBackgroundSource={require('../../assets/images/body-bg.jpg')}
        imageBackgroundStyle={{ opacity: 0.035, resizeMode: 'cover' }}
        style={{ flex: 1 }} 
        contentContainerStyle={styles.contentContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >

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
          <TouchableOpacity style={styles.editBtn} onPress={() => { setNewName(user?.name || ''); setEditNameVisible(true); }}>
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
        <View style={styles.menuItem}>
          <Feather name="bell" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Notification Settings</Text>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled} 
            trackColor={{ false: Colors.surfaceLight, true: Colors.primaryGhost }}
            thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowLocationEdit(!showLocationEdit)}>
          <Feather name="map-pin" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemText, { flex: 0 }]}>Location / Address</Text>
            {user?.locationText ? (
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                {user.locationText}
              </Text>
            ) : null}
          </View>
          <Feather name={showLocationEdit ? "chevron-up" : "chevron-down"} size={20} color={Colors.border} />
        </TouchableOpacity>
        {showLocationEdit && (
          <View style={styles.expandableContent}>
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your full address..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/history')}>
          <Feather name="clock" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Donation History</Text>
          <Feather name="chevron-right" size={20} color={Colors.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowHelp(!showHelp)}>
          <Feather name="help-circle" size={20} color={Colors.textSecondary} style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Feather name={showHelp ? "chevron-up" : "chevron-down"} size={20} color={Colors.border} />
        </TouchableOpacity>
        {showHelp && (
          <View style={styles.expandableContent}>
            <Text style={styles.helpText}>
              Need help? You can reach out to our dedicated support team 24/7. We are here to assist you with blood donation requests, account issues, and more. Contact us at support@proyojon.com.
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={Colors.error} style={styles.menuIcon} />
          <Text style={[styles.menuItemText, { color: Colors.error }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isEditNameVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile Name</Text>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditNameVisible(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveName} style={[styles.modalBtn, { backgroundColor: Colors.primary }]}>
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </CustomRefreshScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentBgWrapper: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
    marginBottom: 12,
    zIndex: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  screenTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  langToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12,
  },
  langToggleText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  
  contentContainer: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 120 },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primaryGhost, marginBottom: 8 },
  avatarImage: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: Colors.primaryGhost, marginBottom: 8 },
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
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { marginRight: 14 },
  menuItemText: { color: Colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  expandableContent: { padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  addressInput: { backgroundColor: Colors.background, borderRadius: 8, padding: 12, color: Colors.text, fontSize: 14, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  saveBtn: { backgroundColor: Colors.primaryGhost, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  saveBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  helpText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  nameInput: { backgroundColor: Colors.background, borderRadius: 8, padding: 12, color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.surfaceLight },
  modalBtnText: { color: Colors.text, fontWeight: '700', fontSize: 14 },
});
