import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { CustomRefreshScrollView } from '../../components/CustomRefreshScrollView';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { BD_DIVISIONS, getLocaleLabel } from '../../constants/locations';
import * as donorService from '../../services/donor';

import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';

export default function DonorsScreen() {
  const router = useRouter();
  const { locale } = useLocaleStore();
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const currentDivision = BD_DIVISIONS.find((d) => d.value === selectedDivision);
  const currentDistrict = currentDivision?.districts.find((d) => d.value === selectedDistrict);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDonors = useCallback(async (pageNum = 1, append = false) => {
    if (!searchQuery && !selectedBloodGroup && !selectedDivision && !selectedDistrict) {
      setDonors([]);
      setTotal(0);
      setTotalPages(1);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const locationFilter = selectedUpazila || selectedDistrict || selectedDivision || '';
      const result = await donorService.getAllDonors({
        blood_group: selectedBloodGroup || undefined,
        location: locationFilter || undefined,
        search: searchQuery || undefined,
        page: pageNum,
        limit: 20,
      });

      if (result.success) {
        if (append) {
          setDonors((prev) => [...prev, ...result.data.donors]);
        } else {
          setDonors(result.data.donors);
        }
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('[Donors] Error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedBloodGroup, selectedDivision, selectedDistrict, selectedUpazila, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDonors(1, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchDonors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDonors(1, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchDonors(page + 1, true);
    }
  };

  const clearFilters = () => {
    setSelectedBloodGroup('');
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedUpazila('');
    setSearchQuery('');
  };

  const activeFilterCount = [selectedBloodGroup, selectedDivision, selectedDistrict, selectedUpazila].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const currentDivision = BD_DIVISIONS.find((d) => d.value === selectedDivision);

  const renderDonorItem = ({ item }: { item: any }) => {
    const bloodGroupDisplay = (item.bloodGroup || '')
      .replace('_POS', '+')
      .replace('_NEG', '−');

    return (
      <TouchableOpacity
        onPress={() => router.push(`/donor/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <Card style={styles.donorCard}>
          <View style={styles.donorRow}>
            {item.profilePhoto ? (
              <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.donorInfo}>
              <Text style={styles.donorName}>{item.name}</Text>
              <View style={styles.donorMeta}>
                <View style={styles.bloodChip}>
                  <Text style={styles.bloodChipText}>{bloodGroupDisplay}</Text>
                </View>
                {item.isVerified && (
                  <View style={styles.verifiedChip}>
                    <Text style={styles.verifiedChipText}>✓ যাচাইকৃত</Text>
                  </View>
                )}
              </View>
              {item.locationText && (
                <Text style={styles.locationText}>📍 {item.locationText}</Text>
              )}
            </View>
            <View style={styles.donorStats}>
              <Text style={styles.donationCount}>{item.donationCount || 0}</Text>
              <Text style={styles.donationLabel}>বার দান</Text>
              {item.badges?.some((b: any) => b.badgeType === 'HERO') && (
                <Text style={styles.heroBadge}>🏆</Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('donors.title')}</Text>
        
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('donors.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => fetchDonors(1, false)}
          />
          <TouchableOpacity 
            style={styles.filterIconButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather name="sliders" size={18} color={showFilters ? Colors.primary : Colors.textSecondary} />
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilterRow}>
          <TouchableOpacity 
            style={[styles.quickFilterChip, selectedBloodGroup === 'A_POS' && styles.quickFilterChipActive]}
            onPress={() => setSelectedBloodGroup(selectedBloodGroup === 'A_POS' ? '' : 'A_POS')}
          >
            <Text style={[styles.quickFilterText, selectedBloodGroup === 'A_POS' && styles.quickFilterTextActive]}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickFilterChip, selectedBloodGroup === 'O_POS' && styles.quickFilterChipActive]}
            onPress={() => setSelectedBloodGroup(selectedBloodGroup === 'O_POS' ? '' : 'O_POS')}
          >
            <Text style={[styles.quickFilterText, selectedBloodGroup === 'O_POS' && styles.quickFilterTextActive]}>O+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickFilterChip, selectedDivision === 'Dhaka' && styles.quickFilterChipActive]}
            onPress={() => setSelectedDivision(selectedDivision === 'Dhaka' ? '' : 'Dhaka')}
          >
            <Text style={[styles.quickFilterText, selectedDivision === 'Dhaka' && styles.quickFilterTextActive]}>
              {getLocaleLabel(locale, BD_DIVISIONS.find(d => d.value === 'Dhaka') || {labelEn: 'Dhaka', labelBn: 'ঢাকা'})}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickFilterChip, selectedDivision === 'Chattogram' && styles.quickFilterChipActive]}
            onPress={() => setSelectedDivision(selectedDivision === 'Chattogram' ? '' : 'Chattogram')}
          >
            <Text style={[styles.quickFilterText, selectedDivision === 'Chattogram' && styles.quickFilterTextActive]}>
              {getLocaleLabel(locale, BD_DIVISIONS.find(d => d.value === 'Chattogram') || {labelEn: 'Chattogram', labelBn: 'চট্টগ্রাম'})}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CustomRefreshScrollView
        outerStyle={{ flex: 1 }}
        innerStyle={[styles.contentBgWrapper, { marginTop: -26 }]}
        imageBackgroundSource={require('../../assets/images/body-bg.jpg')}
        imageBackgroundStyle={{ opacity: 0.035, resizeMode: 'repeat' }}
        isFlatList={true}
        flatListData={donors}
        flatListKeyExtractor={(item: any) => item.id}
        flatListRenderItem={renderDonorItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            <View style={styles.headerHandleBar} />
            {/* Filter Panel */}
            {showFilters && (

        <View style={styles.filterPanel}>
          {/* Blood Group Filter */}
          <Text style={styles.filterLabel}>রক্তের গ্রুপ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedBloodGroup && styles.filterChipActive]}
              onPress={() => setSelectedBloodGroup('')}
            >
              <Text style={[styles.filterChipText, !selectedBloodGroup && styles.filterChipTextActive]}>সবগুলো</Text>
            </TouchableOpacity>
            {BLOOD_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.value}
                style={[styles.filterChip, selectedBloodGroup === group.value && styles.filterChipActive]}
                onPress={() => setSelectedBloodGroup(selectedBloodGroup === group.value ? '' : group.value)}
              >
                <Text style={[styles.filterChipText, selectedBloodGroup === group.value && styles.filterChipTextActive]}>
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Division Filter */}
          <Text style={styles.filterLabel}>বিভাগ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedDivision && styles.filterChipActive]}
              onPress={() => { setSelectedDivision(''); setSelectedDistrict(''); }}
            >
              <Text style={[styles.filterChipText, !selectedDivision && styles.filterChipTextActive]}>সব বিভাগ</Text>
            </TouchableOpacity>
            {BD_DIVISIONS.map((div) => (
              <TouchableOpacity
                key={div.value}
                style={[styles.filterChip, selectedDivision === div.value && styles.filterChipActive]}
                onPress={() => {
                  setSelectedDivision(selectedDivision === div.value ? '' : div.value);
                  setSelectedDistrict('');
                  setSelectedUpazila('');
                }}
              >
                <Text style={[styles.filterChipText, selectedDivision === div.value && styles.filterChipTextActive]}>
                  {getLocaleLabel(locale, div)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* District Filter (shown only when division selected) */}
          {currentDivision && (
            <>
              <Text style={styles.filterLabel}>জেলা</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[styles.filterChip, !selectedDistrict && styles.filterChipActive]}
                  onPress={() => { setSelectedDistrict(''); setSelectedUpazila(''); }}
                >
                  <Text style={[styles.filterChipText, !selectedDistrict && styles.filterChipTextActive]}>সব জেলা</Text>
                </TouchableOpacity>
                {currentDivision.districts.map((dist) => (
                  <TouchableOpacity
                    key={dist.value}
                    style={[styles.filterChip, selectedDistrict === dist.value && styles.filterChipActive]}
                    onPress={() => {
                      setSelectedDistrict(selectedDistrict === dist.value ? '' : dist.value);
                      setSelectedUpazila('');
                    }}
                  >
                    <Text style={[styles.filterChipText, selectedDistrict === dist.value && styles.filterChipTextActive]}>
                      {getLocaleLabel(locale, dist)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Upazila Filter (shown only when district selected) */}
          {currentDistrict && (
            <>
              <Text style={styles.filterLabel}>উপজেলা</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[styles.filterChip, !selectedUpazila && styles.filterChipActive]}
                  onPress={() => setSelectedUpazila('')}
                >
                  <Text style={[styles.filterChipText, !selectedUpazila && styles.filterChipTextActive]}>সব উপজেলা</Text>
                </TouchableOpacity>
                {currentDistrict.upazilas.map((upa) => (
                  <TouchableOpacity
                    key={upa.value}
                    style={[styles.filterChip, selectedUpazila === upa.value && styles.filterChipActive]}
                    onPress={() => setSelectedUpazila(selectedUpazila === upa.value ? '' : upa.value)}
                  >
                    <Text style={[styles.filterChipText, selectedUpazila === upa.value && styles.filterChipTextActive]}>
                      {getLocaleLabel(locale, upa)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>✕ ফিল্টার সরান</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && !showFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilterRow}>
          {selectedBloodGroup && (
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>
                🩸 {BLOOD_GROUPS.find(g => g.value === selectedBloodGroup)?.label}
              </Text>
              <TouchableOpacity onPress={() => setSelectedBloodGroup('')}>
                <Text style={styles.activeTagClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {selectedDivision && (
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>📍 {selectedDivision}</Text>
              <TouchableOpacity onPress={() => { setSelectedDivision(''); setSelectedDistrict(''); }}>
                <Text style={styles.activeTagClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {selectedDistrict && (
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>🏠 {selectedDistrict}</Text>
              <TouchableOpacity onPress={() => setSelectedDistrict('')}>
                <Text style={styles.activeTagClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
          </>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{(!hasActiveFilters && !searchQuery) ? '📍' : '🔍'}</Text>
            <Text style={styles.emptyText}>
              {loading 
                ? 'ডোনার খোঁজা হচ্ছে...' 
                : (!hasActiveFilters && !searchQuery)
                  ? 'ডোনর খুঁজতে আপনার লোকেশন লিখে সার্চ করুন'
                  : 'কোনো ডোনার পাওয়া যায়নি'}
            </Text>
            {(hasActiveFilters || searchQuery) && !loading && (
              <TouchableOpacity style={styles.clearEmptyBtn} onPress={clearFilters}>
                <Text style={styles.clearEmptyBtnText}>সার্চ/ফিল্টার সরিয়ে ফেলুন</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  contentBgWrapper: { 
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 54, 
    paddingBottom: 38,
    backgroundColor: Colors.primary,
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: '600' },
  headerHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  searchBarContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, marginTop: 16, marginBottom: 12,
  },
  searchIcon: { paddingLeft: 12 },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: Colors.text, fontSize: 14 },
  filterIconButton: {
    padding: 10, backgroundColor: Colors.surfaceLight, borderRadius: 10, marginRight: 4, position: 'relative',
  },
  filterBadge: {
    position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

  quickFilterRow: { marginTop: 14, marginBottom: 4 },
  quickFilterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginRight: 8,
  },
  quickFilterChipActive: { backgroundColor: '#FFF', borderColor: '#FFF' },
  quickFilterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  quickFilterTextActive: { color: Colors.primary, fontWeight: '700' },

  filterPanel: {
    marginHorizontal: 16, backgroundColor: Colors.surface,
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterLabel: { color: Colors.text, fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 6 },
  filterScroll: { marginBottom: 6 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.surfaceLight, marginRight: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: Colors.primary, fontWeight: '700' },

  clearBtn: {
    alignSelf: 'center', marginTop: 10, paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  clearBtnText: { color: Colors.error, fontSize: 12, fontWeight: '700' },

  activeFilterRow: { paddingHorizontal: 16, marginBottom: 8 },
  activeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryGhost, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: Colors.primary,
  },
  activeTagText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  activeTagClose: { color: Colors.primary, fontSize: 14, fontWeight: '800' },

  listContent: { paddingHorizontal: 16, paddingBottom: 130 },

  donorCard: { marginBottom: 10, paddingVertical: 12, paddingHorizontal: 14 },
  donorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Colors.primary },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryGhost,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary,
  },
  avatarText: { color: Colors.primary, fontSize: 20, fontWeight: '800' },

  donorInfo: { flex: 1 },
  donorName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  donorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  bloodChip: {
    backgroundColor: Colors.primaryGhost, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.primary,
  },
  bloodChipText: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
  verifiedChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedChipText: { color: Colors.success, fontSize: 10, fontWeight: '700' },
  locationText: { color: Colors.textMuted, fontSize: 11, marginTop: 3 },

  donorStats: { alignItems: 'center' },
  donationCount: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  donationLabel: { color: Colors.textMuted, fontSize: 9, marginTop: 1 },
  heroBadge: { fontSize: 16, marginTop: 2 },

  footerLoader: { paddingVertical: 16, alignItems: 'center' },

  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 16, textAlign: 'center' },
  clearEmptyBtn: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: Colors.primaryGhost, borderRadius: 12,
  },
  clearEmptyBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
});
