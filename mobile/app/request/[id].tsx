import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RadarAnimation } from '../../components/RadarAnimation';
import { JourneyTracker } from '../../components/JourneyTracker';
import { CelebrationOverlay } from '../../components/CelebrationOverlay';
import { useAuthStore } from '../../stores/authStore';
import * as requestsService from '../../services/requests';

export default function RequestTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const fetchRequest = async () => {
    try {
      const result = await requestsService.getRequest(id!);
      setRequest(result.data);
    } catch (err) {
      console.error('[Tracking] Error fetching request:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    pollRef.current = setInterval(fetchRequest, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (
      request?.status === 'COMPLETED' ||
      request?.status === 'EXPIRED' ||
      request?.status === 'CANCELLED'
    ) {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [request?.status]);

  const isRequester = request?.requesterId === user?.id;
  const isDonor =
    request?.matchedDonorId === user?.id ||
    request?.organizerId === user?.id;

  const handleStartJourney = async () => {
    setActionLoading(true);
    try {
      await requestsService.updateStatus(id!, 'IN_PROGRESS');
      await fetchRequest();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReachedHospital = async () => {
    setActionLoading(true);
    try {
      await requestsService.updateStatus(id!, 'ARRIVED');
      await fetchRequest();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    Alert.alert(
      'Confirm Donation',
      'Are you sure the donation was successful?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Donation Successful',
          onPress: async () => {
            setActionLoading(true);
            try {
              await requestsService.completeRequest(id!);
              setShowCelebration(true);
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.response?.data?.error?.message || 'Failed to complete'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Request not found</Text>
      </View>
    );
  }

  const bloodGroupDisplay = (request.bloodGroup || '')
    .replace('_POS', '+')
    .replace('_NEG', '−');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.backBtn} onPress={() => router.back()}>
          ← Back
        </Text>

        {isRequester && (
          <>
            {request.status === 'PENDING' && (
              <>
                <RadarAnimation message="Searching for donors nearby..." />
                
                {request.notifications && request.notifications.length > 0 && (
                  <Card style={{ marginTop: 20 }}>
                    <Text style={styles.infoTitle}>Notified Donors ({request.notifications.length})</Text>
                    {request.notifications.map((notif: any, i: number) => {
                      const donorBG = (notif.donor.bloodGroup || '').replace('_POS', '+').replace('_NEG', '−');
                      return (
                        <View key={i} style={styles.notifiedDonorCard}>
                          <View style={styles.notifiedDonorRow}>
                            {notif.donor.profilePhoto ? (
                              <Image source={{ uri: notif.donor.profilePhoto }} style={styles.notifiedAvatar} />
                            ) : (
                              <View style={styles.notifiedAvatarPlaceholder}>
                                <Text style={styles.notifiedAvatarText}>{notif.donor.name.charAt(0)}</Text>
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.notifiedName}>{notif.donor.name}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '700' }}>{donorBG}</Text>
                                <Text style={{ color: Colors.textMuted, fontSize: 11 }}>•</Text>
                                <Text style={{ color: Colors.textSecondary, fontSize: 11 }}>{notif.donor.donationCount || 0} donations</Text>
                              </View>
                            </View>
                            <View style={styles.notifiedBadge}>
                              <Text style={styles.notifiedBadgeText}>Waiting...</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => Linking.openURL(`tel:${notif.donor.phone}`)}
                          >
                            <Text style={styles.callButtonText}>📞 {notif.donor.phone}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </Card>
                )}
              </>
            )}

            {request.status === 'MATCHED' && (
              <Card style={styles.matchCard}>
                <Text style={styles.matchIcon}>✅</Text>
                <Text style={styles.matchTitle}>Donor Found!</Text>
                {request.acceptanceType === 'SELF' && request.matchedDonor && (
                  <View style={styles.donorInfo}>
                    <Text style={styles.donorName}>{request.matchedDonor.name}</Text>
                    <Text style={styles.donorBlood}>{bloodGroupDisplay}</Text>
                  </View>
                )}
                {request.acceptanceType === 'PROXY' && (
                  <View style={styles.donorInfo}>
                    <Text style={styles.donorName}>Proxy: {request.proxyName}</Text>
                    <Text style={styles.donorPhone}>📞 {request.proxyPhone}</Text>
                  </View>
                )}
              </Card>
            )}

            {request.status === 'IN_PROGRESS' && (
              <Card style={styles.matchCard}>
                <Text style={styles.matchIcon}>🚗</Text>
                <Text style={styles.matchTitle}>Donor is on the way!</Text>
                <Text style={styles.matchSubtitle}>
                  The donor has started their journey to the hospital.
                </Text>
              </Card>
            )}

            {request.status === 'ARRIVED' && (
              <Card style={styles.matchCard}>
                <Text style={styles.matchIcon}>🏥</Text>
                <Text style={styles.matchTitle}>Donor has arrived!</Text>
                <Text style={styles.matchSubtitle}>
                  The donor has reached the hospital.
                </Text>
                <Button
                  title="✅ Donation Successful"
                  onPress={handleComplete}
                  loading={actionLoading}
                  style={{ marginTop: 20 }}
                />
              </Card>
            )}

            {request.status === 'COMPLETED' && (
              <Card style={styles.matchCard}>
                <Text style={styles.matchIcon}>🎉</Text>
                <Text style={styles.matchTitle}>Donation Complete!</Text>
                <Text style={styles.matchSubtitle}>
                  Thank you for using Proyojon. A life has been saved.
                </Text>
              </Card>
            )}

            {request.status === 'EXPIRED' && (
              <Card style={styles.matchCard}>
                <Text style={styles.matchIcon}>⏰</Text>
                <Text style={styles.matchTitle}>Request Expired</Text>
                <Text style={styles.matchSubtitle}>
                  No donors were found within the time limit. Please try again.
                </Text>
                <Button
                  title="Create New Request"
                  onPress={() => router.push('/(tabs)/request')}
                  style={{ marginTop: 16 }}
                />
              </Card>
            )}
          </>
        )}

        {isDonor && (
          <>
            <Card style={styles.requestDetails}>
              <View style={styles.detailHeader}>
                <View style={styles.bloodCircle}>
                  <Text style={styles.bloodCircleText}>{bloodGroupDisplay}</Text>
                </View>
                <View>
                  <Text style={styles.detailTitle}>{request.hospitalName}</Text>
                  <Text style={styles.detailSub}>
                    {request.bagsNeeded} bags • ৳{request.conveyanceAmount} BDT
                  </Text>
                </View>
              </View>
            </Card>

            <JourneyTracker
              currentStatus={request.status}
              onStartJourney={handleStartJourney}
              onReachedHospital={handleReachedHospital}
              loading={actionLoading}
            />
          </>
        )}

        <Card style={{ marginTop: 20 }}>
          <Text style={styles.infoTitle}>Request Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Blood Group</Text>
            <Text style={styles.infoValue}>{bloodGroupDisplay}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bags Needed</Text>
            <Text style={styles.infoValue}>{request.bagsNeeded}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hospital</Text>
            <Text style={styles.infoValue}>{request.hospitalName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Conveyance</Text>
            <Text style={styles.infoValue}>৳{request.conveyanceAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: Colors.primary }]}>
              {request.status}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <CelebrationOverlay
        visible={showCelebration}
        donorName={request.matchedDonor?.name}
        onDismiss={() => {
          setShowCelebration(false);
          router.replace('/(tabs)/dashboard');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 56, paddingBottom: 32 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.textSecondary, fontSize: 16 },
  backBtn: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginBottom: 16 },
  matchCard: { alignItems: 'center', paddingVertical: 28 },
  matchIcon: { fontSize: 48, marginBottom: 12 },
  matchTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  matchSubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  donorInfo: { alignItems: 'center', marginTop: 12 },
  donorName: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  donorBlood: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginTop: 4 },
  donorPhone: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  requestDetails: { marginBottom: 8 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bloodCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  bloodCircleText: { color: Colors.primary, fontSize: 20, fontWeight: '900' },
  detailTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  detailSub: { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  infoTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoLabel: { color: Colors.textSecondary, fontSize: 14 },
  infoValue: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  notifiedDonorCard: { marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  notifiedDonorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  notifiedAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  notifiedAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifiedAvatarText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  notifiedName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  notifiedBadge: { backgroundColor: Colors.warning + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  notifiedBadgeText: { color: Colors.warning, fontSize: 11, fontWeight: '700' },
  callButton: { marginTop: 6, marginLeft: 52, backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  callButtonText: { color: '#2E7D32', fontSize: 13, fontWeight: '600' },
});
