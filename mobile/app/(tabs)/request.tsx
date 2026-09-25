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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';
import { Button } from '../../components/ui/Button';
import { ConveyanceAgreement } from '../../components/ConveyanceAgreement';
import * as requestsService from '../../services/requests';
import * as Location from 'expo-location';

const CONVEYANCE_OPTIONS = [200, 250, 300];

export default function RequestScreen() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState('');
  const [bagsNeeded, setBagsNeeded] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalLat, setHospitalLat] = useState(23.8103);
  const [hospitalLng, setHospitalLng] = useState(90.4125);
  const [conveyanceAmount, setConveyanceAmount] = useState(200);
  const [showAgreement, setShowAgreement] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setHospitalLat(location.coords.latitude);
      setHospitalLng(location.coords.longitude);
    })();
  }, []);

  const handlePreSubmit = () => {
    if (!bloodGroup) {
      Alert.alert('Error', 'Please select the required blood group');
      return;
    }
    if (!hospitalName.trim()) {
      Alert.alert('Error', 'Please enter the hospital name');
      return;
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
        hospital_lat: hospitalLat,
        hospital_lng: hospitalLng,
        conveyance_amount: conveyanceAmount,
        agreement_accepted: true,
      });
      router.push(`/request/${result.data.request_id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || 'Failed to create request';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Request Blood</Text>
        <Text style={styles.subtitle}>
          Emergency broadcast
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Blood Group Needed</Text>
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

        <View style={styles.fieldRow}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number of Bags</Text>
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Hospital Name</Text>
          <TextInput
            style={styles.input}
            value={hospitalName}
            onChangeText={setHospitalName}
            placeholder="e.g. DMCH"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Conveyance Allowance (BDT)</Text>
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
            style={styles.submitButton}
            onPress={handlePreSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Blood Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
  content: { flex: 1, padding: 16, paddingTop: 50 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 2 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  field: { marginBottom: 12 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  label: { color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodGroupCard: { width: '23%', aspectRatio: 1.4, backgroundColor: Colors.surface, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  bloodGroupSelected: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  bloodGroupLabel: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  bloodGroupLabelSelected: { color: Colors.primary },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  stepperBtnText: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  stepperValue: { backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10, minWidth: 50, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  stepperValueText: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  input: { backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  conveyanceRow: { flexDirection: 'row', gap: 8 },
  conveyanceCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  conveyanceSelected: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  conveyanceText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  conveyanceTextSelected: { color: Colors.primary },
  
  footerContainer: { marginTop: 'auto', paddingBottom: 16 },
  submitButton: { backgroundColor: Colors.primary, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
