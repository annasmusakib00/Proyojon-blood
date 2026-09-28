import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import * as donorService from '../../services/donor';

export default function DonorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchDonorProfile();
  }, [id]);

  useEffect(() => {
    if (donor?.isAvailable && !donor?.isLocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [donor, pulseAnim]);

  const fetchDonorProfile = async () => {
    try {
      setLoading(true);
      const result = await donorService.getDonorPublicProfile(id!);
      if (result.success) {
        setDonor(result.data);
      }
    } catch (err) {
      console.error('[DonorProfile] Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>প্রোফাইল লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (error || !donor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorIcon}>😞</Text>
        <Text style={styles.loadingText}>ডোনার খুঁজে পাওয়া যায়নি</Text>
        <TouchableOpacity style={styles.backBtnFooter} onPress={() => router.back()}>
          <Text style={styles.backBtnFooterText}>← ফিরে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bloodGroupDisplay = (donor.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  const memberSince = new Date(donor.createdAt).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const lastActive = donor.lastSeenAt
    ? new Date(donor.lastSeenAt).toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'অজানা';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← ফিরে যান</Text>
        </TouchableOpacity>

        {/* Profile Header Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {donor.profilePhoto ? (
              <Image source={{ uri: donor.profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {donor.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}

            <Text style={styles.donorName}>{donor.name}</Text>

            {/* Blood Group Badge */}
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodBadgeText}>🩸 {bloodGroupDisplay}</Text>
            </View>

            {/* Availability Status */}
            <View style={styles.statusRow}>
              {donor.isAvailable && !donor.isLocked ? (
                <>
                  <Animated.View style={[styles.statusDot, styles.statusDotActive, { transform: [{ scale: pulseAnim }] }]} />
                  <Text style={[styles.statusLabel, { color: Colors.success }]}>সক্রিয় — রক্তদানে প্রস্তুত</Text>
                </>
              ) : donor.isLocked ? (
                <>
                  <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
                  <Text style={[styles.statusLabel, { color: Colors.warning }]}>বিশ্রাম পিরিয়ডে আছেন</Text>
                </>
              ) : (
                <>
                  <View style={[styles.statusDot, { backgroundColor: Colors.textMuted }]} />
                  <Text style={[styles.statusLabel, { color: Colors.textMuted }]}>এখন অনুপলব্ধ</Text>
                </>
              )}
            </View>
          </View>
        </Card>

        {/* Verification Status */}
        <Card style={styles.infoCard}>
          <View style={styles.verificationRow}>
            <View style={[styles.verifyIcon, donor.isVerified ? styles.verifyIconActive : styles.verifyIconInactive]}>
              <Text style={styles.verifyIconText}>{donor.isVerified ? '✓' : '✕'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>
                OTP যাচাইকরণ
              </Text>
              <Text style={[styles.verifyStatus, { color: donor.isVerified ? Colors.success : Colors.error }]}>
                {donor.isVerified ? 'যাচাইকৃত ✓' : 'যাচাই করা হয়নি ✕'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🩸</Text>
            <Text style={styles.statValue}>{donor.donationCount || 0}</Text>
            <Text style={styles.statLabel}>বার রক্তদান</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValueSmall}>{memberSince}</Text>
            <Text style={styles.statLabel}>যোগদানের তারিখ</Text>
          </Card>
        </View>

        {/* Badges */}
        {donor.badges && donor.badges.length > 0 && (
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>🏅 ব্যাজসমূহ</Text>
            <View style={styles.badgesRow}>
              {donor.badges.map((badge: any, i: number) => (
                <Badge key={i} type={badge.badgeType} size="small" />
              ))}
            </View>
          </Card>
        )}

        {/* Donor Details */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>📋 বিস্তারিত তথ্য</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📞 ফোন নম্বর</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${donor.phone}`)}>
              <Text style={styles.detailValuePhone}>{donor.phone}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🩸 রক্তের গ্রুপ</Text>
            <Text style={styles.detailValue}>{bloodGroupDisplay}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>✅ যাচাইকৃত</Text>
            <Text style={[styles.detailValue, { color: donor.isVerified ? Colors.success : Colors.error }]}>
              {donor.isVerified ? 'হ্যাঁ' : 'না'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🩸 মোট রক্তদান</Text>
            <Text style={styles.detailValue}>{donor.donationCount || 0} বার</Text>
          </View>

          {donor.locationText && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 অবস্থান</Text>
              <Text style={styles.detailValue}>{donor.locationText}</Text>
            </View>
          )}

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>🕒 সর্বশেষ সক্রিয়</Text>
            <Text style={styles.detailValue}>{lastActive}</Text>
          </View>
        </Card>

        {/* Call Button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL(`tel:${donor.phone}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.callButtonText}>📞 কল করুন — {donor.phone}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.textSecondary, fontSize: 15, marginTop: 12 },
  errorIcon: { fontSize: 48, marginBottom: 4 },

  backBtn: { marginBottom: 16 },
  backBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  backBtnFooter: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primaryGhost, borderRadius: 12 },
  backBtnFooterText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },

  profileCard: { alignItems: 'center', paddingVertical: 28, marginBottom: 12 },
  profileHeader: { alignItems: 'center' },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: Colors.primary, marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryGhost,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary, marginBottom: 12,
  },
  avatarText: { color: Colors.primary, fontSize: 36, fontWeight: '800' },
  donorName: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  bloodBadge: {
    backgroundColor: Colors.primaryGhost, paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 2, borderColor: Colors.primary, marginBottom: 10,
  },
  bloodBadgeText: { color: Colors.primary, fontSize: 18, fontWeight: '800' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusDotActive: { backgroundColor: Colors.success },
  statusLabel: { fontSize: 13, fontWeight: '600' },

  infoCard: { marginBottom: 12, paddingVertical: 14 },
  verificationRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  verifyIcon: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  verifyIconActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  verifyIconInactive: { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  verifyIconText: { fontSize: 20, fontWeight: '800' },
  verifyTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  verifyStatus: { fontSize: 13, fontWeight: '600', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { color: Colors.text, fontSize: 28, fontWeight: '800' },
  statValueSmall: { color: Colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },

  badgesRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  detailLabel: { color: Colors.textSecondary, fontSize: 14 },
  detailValue: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  detailValuePhone: { color: Colors.accent, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },

  callButton: {
    backgroundColor: Colors.success, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
    elevation: 4, shadowColor: Colors.success, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  callButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
