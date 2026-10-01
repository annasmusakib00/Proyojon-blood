import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { CustomRefreshScrollView } from '../../components/CustomRefreshScrollView';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import * as requestsService from '../../services/requests';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';

const TABS = ['myRequests', 'myDonations'] as const;

export default function HistoryScreen() {
  const router = useRouter();
  const { locale } = useLocaleStore();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('myRequests');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const role = activeTab === 'myRequests' ? 'requester' : 'donor';
      const result = await requestsService.getHistory(role, pageNum, 10);
      const fetchedData = result.data || [];
      const filteredData = fetchedData.filter((item: any) => item.status !== 'CANCELLED');
      
      if (append) {
        setData((prev) => [...prev, ...filteredData]);
      } else {
        setData(filteredData);
      }
      setTotalPages(result.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('[History] Error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData(1, false);
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(1, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchData(page + 1, true);
    }
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { bg: '#D1FAE5', text: '#065F46' };
      case 'PENDING': return { bg: '#FEF3C7', text: '#92400E' };
      case 'EXPIRED':
      case 'CANCELLED': return { bg: '#F3F4F6', text: '#374151' };
      case 'MATCHED':
      case 'IN_PROGRESS':
      case 'ARRIVED': return { bg: Colors.info + '22', text: Colors.info };
      default: return { bg: Colors.surface, text: Colors.textSecondary };
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
              <Text style={styles.bagsText}>
                <Feather name="droplet" size={12} color={Colors.primary} /> {item.bagsNeeded} {t('history.bags')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusStyles(item.status).bg },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusStyles(item.status).text }]}>
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
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('history.title')}</Text>
        </View>

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
      </View>

      <CustomRefreshScrollView
        outerStyle={{ flex: 1 }}
        innerStyle={styles.contentBgWrapper}
        imageBackgroundSource={require('../../assets/images/body-bg.jpg')}
        imageBackgroundStyle={{ opacity: 0.035, resizeMode: 'repeat' }}
        isFlatList={true}
        flatListData={data}
        flatListKeyExtractor={(item: any) => item.id}
        flatListRenderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={64} color={Colors.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>কোনো ইতিহাস পাওয়া যায়নি</Text>
              <Text style={styles.emptyText}>আপনি এখনো কোনো আবেদন করেননি বা রক্তদান করেননি।</Text>
              <Button 
                title="নতুন আবেদন করুন" 
                onPress={() => router.push('/(tabs)/request')} 
                style={{ marginTop: 24 }}
              />
            </View>
          ) : null
        }
      />
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
    elevation: 20,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  filterBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FFF' },
  tabText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 110 },
  itemCard: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bloodCircle: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  bloodText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  itemInfo: { flex: 1 },
  hospitalName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  itemDate: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  bagsText: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cancelBtn: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: Colors.primaryGhost, borderWidth: 1, borderColor: Colors.error,
  },
  cancelBtnText: { color: Colors.error, fontSize: 10, fontWeight: '700' },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
