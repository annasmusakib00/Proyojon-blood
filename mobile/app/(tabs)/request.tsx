import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { ConveyanceAgreement } from '../../components/ConveyanceAgreement';
import * as requestsService from '../../services/requests';
import * as Location from 'expo-location';
import { t } from '../../utils/i18n';

const CONVEYANCE_OPTIONS = [200, 250, 300];

export default function RequestScreen() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState('');
  const [bagsNeeded, setBagsNeeded] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalLat, setHospitalLat] = useState<number | null>(null);
  const [hospitalLng, setHospitalLng] = useState<number | null>(null);
  const [conveyanceType, setConveyanceType] = useState<number | 'other' | 'none'>(200);
  const [customConveyance, setCustomConveyance] = useState('');
  const [showAgreement, setShowAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    setLocationLoading(false);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setHospitalLat(location.coords.latitude);
        setHospitalLng(location.coords.longitude);
      }
    } catch (err) {}
    
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handlePreSubmit = async () => {
    if (!bloodGroup) {
      Alert.alert('⚠️', t('request.bloodGroupRequired'));
      return;
    }
    if (!hospitalName.trim()) {
      Alert.alert('⚠️', t('request.hospitalRequired'));
      return;
    }
    
    let currentLat = hospitalLat;
    let currentLng = hospitalLng;
    
    if (currentLat === null || currentLng === null) {
      setLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('📍 লোকেশন প্রয়োজন', t('request.locationRequired'));
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        currentLat = location.coords.latitude;
        currentLng = location.coords.longitude;
        setHospitalLat(currentLat);
        setHospitalLng(currentLng);
      } catch (err) {
        Alert.alert('📍 লোকেশন প্রয়োজন', 'লোকেশন পাওয়া যাচ্ছে না, দয়া করে লোকেশন চালু করুন।');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    
    setShowAgreement(true);
  };

  const handleSubmit = async () => {
    setShowAgreement(false);
    setLoading(true);
    
    const finalConveyance = conveyanceType === 'none' ? 0 : conveyanceType === 'other' ? (parseInt(customConveyance) || 0) : conveyanceType;

    try {
      const result = await requestsService.createRequest({
        blood_group: bloodGroup,
        bags_needed: bagsNeeded,
        hospital_name: hospitalName.trim(),
        hospital_lat: hospitalLat!,
        hospital_lng: hospitalLng!,
        conveyance_amount: finalConveyance,
        agreement_accepted: true,
      });
      router.push(`/request/${result.data.request_id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || 'আবেদন পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।';
      Alert.alert('ত্রুটি', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
            colors={[Colors.primary]} 
          />
        }
      >
        <Text style={styles.title}>{t('request.title')}</Text>
        <Text style={styles.subtitle}>{t('request.subtitle')}</Text>



        <View style={styles.field}>
          <Text style={styles.label}>{t('request.bloodGroupLabel')}</Text>
          <View style={styles.bloodGroupGrid}>
            {BLOOD_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.value}
                style={[
                  styles.bloodGroupCard,
                  bloodGroup === group.value && styles.bloodGroupSelected,
                ]}
                onPress={() => setBloodGroup(group.value)}
              >
                <Text
                  style={[
                    styles.bloodGroupLabel,
                    bloodGroup === group.value && styles.bloodGroupLabelSelected,
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('request.bagsLabel')}</Text>
          <View style={styles.pillStepperContainer}>
            <TouchableOpacity
              style={styles.pillStepperBtn}
              onPress={() => setBagsNeeded((prev) => Math.max(1, prev - 1))}
            >
              <Text style={styles.pillStepperBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.pillStepperValue}>
              <Text style={styles.pillStepperValueText}>{bagsNeeded}</Text>
            </View>
            <TouchableOpacity
              style={styles.pillStepperBtn}
              onPress={() => setBagsNeeded((prev) => Math.min(10, prev + 1))}
            >
              <Text style={styles.pillStepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('request.hospitalLabel')}</Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              value={hospitalName}
              onChangeText={setHospitalName}
              placeholder={t('request.hospitalPlaceholder')}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('request.conveyanceLabel')}</Text>
          <View style={styles.conveyanceGrid}>
            {CONVEYANCE_OPTIONS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.conveyanceCard,
                  conveyanceType === amount && styles.conveyanceSelected,
                ]}
                onPress={() => setConveyanceType(amount)}
              >
                <Text
                  style={[
                    styles.conveyanceText,
                    conveyanceType === amount && styles.conveyanceTextSelected,
                  ]}
                >
                  ৳{amount}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.conveyanceCard,
                conveyanceType === 'none' && styles.conveyanceSelected,
              ]}
              onPress={() => setConveyanceType('none')}
            >
              <Text
                style={[
                  styles.conveyanceText,
                  conveyanceType === 'none' && styles.conveyanceTextSelected,
                ]}
              >
                প্রযোজ্য নয়
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.conveyanceCard,
                conveyanceType === 'other' && styles.conveyanceSelected,
              ]}
              onPress={() => setConveyanceType('other')}
            >
              <Text
                style={[
                  styles.conveyanceText,
                  conveyanceType === 'other' && styles.conveyanceTextSelected,
                ]}
              >
                অন্যান্য
              </Text>
            </TouchableOpacity>
          </View>
          {conveyanceType === 'other' && (
            <TextInput
              style={[styles.inputContainer, { marginTop: 12, paddingVertical: 12, color: Colors.text, fontSize: 14 }]}
              value={customConveyance}
              onChangeText={setCustomConveyance}
              placeholder="ভাতার পরিমাণ লিখুন"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
          )}
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handlePreSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.submitButtonInner}>
              <Feather name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {loading ? t('request.submitting') : t('request.submitButton')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConveyanceAgreement
        visible={showAgreement}
        amount={conveyanceType === 'none' ? 0 : conveyanceType === 'other' ? (parseInt(customConveyance) || 0) : conveyanceType}
        onAccept={handleSubmit}
        onClose={() => setShowAgreement(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingTop: 56, paddingBottom: 32 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 20, lineHeight: 19 },

  locationWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)', borderWidth: 1, borderColor: Colors.warning,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  locationWarningIcon: { fontSize: 20 },
  locationWarningText: { flex: 1, color: Colors.warning, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  locationOk: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.10)', borderWidth: 1, borderColor: Colors.success,
    borderRadius: 12, padding: 10, marginBottom: 16,
  },
  locationOkIcon: { fontSize: 16 },
  locationOkText: { color: Colors.success, fontSize: 12, fontWeight: '600' },

  field: { marginBottom: 24 },
  label: { color: Colors.textMuted, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodGroupCard: {
    width: '22%', aspectRatio: 1.4, backgroundColor: Colors.surfaceLight,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  bloodGroupSelected: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  bloodGroupLabel: { color: Colors.textSecondary, fontSize: 17, fontWeight: '700' },
  bloodGroupLabelSelected: { color: '#FFF' },

  pillStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 30,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pillStepperBtn: { paddingHorizontal: 22, paddingVertical: 14 },
  pillStepperBtnText: { color: Colors.textSecondary, fontSize: 22, fontWeight: '600' },
  pillStepperValue: { paddingHorizontal: 16 },
  pillStepperValueText: { color: Colors.text, fontSize: 20, fontWeight: '800' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
  },

  conveyanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  conveyanceCard: {
    flexBasis: '30%', flexGrow: 1, backgroundColor: Colors.surfaceLight, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  conveyanceSelected: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: Colors.success },
  conveyanceText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  conveyanceTextSelected: { color: Colors.success },

  footerContainer: { marginTop: 16, paddingBottom: 24 },
  submitButton: {
    backgroundColor: Colors.primary, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', elevation: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  submitButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitButtonDisabled: { backgroundColor: Colors.textMuted, elevation: 0, shadowOpacity: 0 },
  submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
});
