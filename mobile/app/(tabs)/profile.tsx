import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LockCountdown } from '../../components/LockCountdown';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const bloodGroupDisplay = (user?.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  const maskedPhone = user?.phone
    ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4)
    : '';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userPhone}>{maskedPhone}</Text>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodBadgeText}>{bloodGroupDisplay}</Text>
        </View>
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
        title="Logout"
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
  profileHeader: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary, marginBottom: 12 },
  avatarText: { color: Colors.primary, fontSize: 32, fontWeight: '800' },
  userName: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userPhone: { color: Colors.textSecondary, fontSize: 14, marginBottom: 8 },
  bloodBadge: { backgroundColor: Colors.primaryGhost, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary },
  bloodBadgeText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
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
