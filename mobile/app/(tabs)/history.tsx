import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import * as requestsService from '../../services/requests';
import { t } from '../../utils/i18n';

const TABS = ['myRequests', 'myDonations'] as const;

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('myRequests');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const role = activeTab === 'myRequests' ? 'requester' : 'donor';
      const result = await requestsService.getHistory(role);
      const filteredData = (result.data || []).filter((item: any) => item.status !== 'CANCELLED');
      setData(filteredData);
    } catch (err) {
      console.error('[History] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      t('history.deleteConfirmTitle'),
      t('history.deleteConfirmMessage'),
      [
        { text: t('history.cancelButton'), style: 'cancel' },
        {
          text: t('history.deleteButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await requestsService.cancelRequest(requestId);
              // Remove from local state immediately for smooth UX
              setData((prev) => prev.filter((item) => item.id !== requestId));
              Alert.alert('সফল', 'আবেদনটি বাতিল করা হয়েছে।');
            } catch (err: any) {
              Alert.alert('ত্রুটি', err.response?.data?.error?.message || 'বাতিল করা সম্ভব হয়নি');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return Colors.success;
      case 'PENDING': return Colors.warning;
      case 'MATCHED':
      case 'IN_PROGRESS':
      case 'ARRIVED': return Colors.info;
      case 'EXPIRED':
      case 'CANCELLED': return Colors.textMuted;
      default: return Colors.textSecondary;
    }
  };

  const getStatusBangla = (status: string) => {
    switch (status) {
      case 'PENDING': return 'অপেক্ষমান';
      case 'MATCHED': return 'ডোনার পাওয়া গেছে';
      case 'IN_PROGRESS': return 'রওনা হয়েছেন';
      case 'ARRIVED': return 'পৌঁছেছেন';
      case 'COMPLETED': return 'সম্পন্ন';
      case 'EXPIRED': return 'মেয়াদ শেষ';
      case 'CANCELLED': return 'বাতিল';
      default: return status;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const bloodGroupDisplay = (item.bloodGroup || '')
      .replace('_POS', '+')
      .replace('_NEG', '−');

    const isPending = item.status === 'PENDING';

    return (
      <TouchableOpacity onPress={() => router.push(`/request/${item.id}`)}>
        <Card style={styles.itemCard}>
          <View style={styles.itemRow}>
            <View style={styles.bloodCircle}>
              <Text style={styles.bloodText}>{bloodGroupDisplay}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.hospitalName}>{item.hospitalName}</Text>
              <Text style={styles.itemDate}>
                {new Date(item.createdAt).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.bagsText}>{item.bagsNeeded} {t('history.bags')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(item.status) + '22' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusBangla(item.status)}
                </Text>
              </View>
              {isPending && activeTab === 'myRequests' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    handleCancelRequest(item.id);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.cancelBtnText}>✕ বাতিল</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('history.title')}</Text>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {t(`history.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>{loading ? t('history.loading') : t('history.noHistory')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 20, marginBottom: 16 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 20, backgroundColor: Colors.surface,
    borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bloodCircle: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primaryGhost,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary,
  },
  bloodText: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  itemInfo: { flex: 1 },
  hospitalName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  itemDate: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  bagsText: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cancelBtn: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)', borderWidth: 1, borderColor: Colors.error,
  },
  cancelBtnText: { color: Colors.error, fontSize: 10, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 16 },
});
