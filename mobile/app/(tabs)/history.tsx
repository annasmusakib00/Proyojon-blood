import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import * as requestsService from '../../services/requests';

const TABS = ['My Requests', 'My Donations'] as const;

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('My Requests');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const role = activeTab === 'My Requests' ? 'requester' : 'donor';
      const result = await requestsService.getHistory(role);
      setData(result.data || []);
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

  const renderItem = ({ item }: { item: any }) => {
    const bloodGroupDisplay = (item.bloodGroup || '')
      .replace('_POS', '+')
      .replace('_NEG', '−');

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
                {new Date(item.createdAt).toLocaleDateString('en-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.bagsText}>{item.bagsNeeded} bags</Text>
            </View>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) + '22' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

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
              {tab}
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
            <Text style={styles.emptyText}>{loading ? 'Loading...' : 'No history yet'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 20, marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bloodCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryGhost, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  bloodText: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  itemInfo: { flex: 1 },
  hospitalName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  itemDate: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  bagsText: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 16 },
});
