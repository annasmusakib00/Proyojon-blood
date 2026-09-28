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
} from 'react-native';
import { useRouter } from 'expo-router';
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
  const [conveyanceAmount, setConveyanceAmount] = useState(200);
  const [showAgreement, setShowAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  React.useEffect(() => {
    setLocationLoading(false);
  }, []);

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
    try {
      const result = await requestsService.createRequest({
        blood_group: bloodGroup,
        bags_needed: bagsNeeded,
        hospital_name: hospitalName.trim(),
        hospital_lat: hospitalLat!,
        hospital_lng: hospitalLng!,
        conveyance_amount: conveyanceAmount,
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setBagsNeeded((prev) => Math.max(1, prev - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperValueText}>{bagsNeeded}</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setBagsNeeded((prev) => Math.min(10, prev + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('request.hospitalLabel')}</Text>
          <TextInput
            style={styles.input}
            value={hospitalName}
            onChangeText={setHospitalName}
            placeholder={t('request.hospitalPlaceholder')}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('request.conveyanceLabel')}</Text>
          <View style={styles.conveyanceRow}>
            {CONVEYANCE_OPTIONS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.conveyanceCard,
                  conveyanceAmount === amount && styles.conveyanceSelected,
                ]}
                onPress={() => setConveyanceAmount(amount)}
              >
                <Text
                  style={[
                    styles.conveyanceText,
                    conveyanceAmount === amount && styles.conveyanceTextSelected,
                  ]}
                >
                  ৳{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handlePreSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading ? t('request.submitting') : t('request.submitButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConveyanceAgreement
        visible={showAgreement}
        amount={conveyanceAmount}
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

  field: { marginBottom: 18 },
  label: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodGroupCard: {
    width: '22%', aspectRatio: 1.4, backgroundColor: Colors.surface,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  bloodGroupSelected: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  bloodGroupLabel: { color: Colors.textSecondary, fontSize: 17, fontWeight: '700' },
  bloodGroupLabelSelected: { color: Colors.primary },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  stepperBtnText: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  stepperValue: {
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 12, minWidth: 56, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  stepperValueText: { color: Colors.text, fontSize: 22, fontWeight: '800' },

  input: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, color: Colors.text, fontSize: 14, borderWidth: 1.5, borderColor: Colors.border,
  },

  conveyanceRow: { flexDirection: 'row', gap: 10 },
  conveyanceCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  conveyanceSelected: { backgroundColor: Colors.accentGhost, borderColor: Colors.accent },
  conveyanceText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  conveyanceTextSelected: { color: Colors.accent },

  footerContainer: { marginTop: 10, paddingBottom: 16 },
  submitButton: {
    backgroundColor: Colors.primary, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  submitButtonDisabled: { backgroundColor: Colors.textMuted, elevation: 0, shadowOpacity: 0 },
  submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
