import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Request Blood</Text>
        <Text style={styles.subtitle}>
          Fill in the details to broadcast an emergency request
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

        <View style={styles.field}>
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

        <View style={styles.field}>
          <Text style={styles.label}>Hospital Name</Text>
          <TextInput
            style={styles.input}
            value={hospitalName}
            onChangeText={setHospitalName}
            placeholder="e.g. Dhaka Medical College Hospital"
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

        <Button
          title="Submit Blood Request"
          onPress={handlePreSubmit}
          loading={loading}
          style={{ marginTop: 8 }}
        />
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
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 28 },
  field: { marginBottom: 24 },
  label: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodGroupCard: { width: '22%', aspectRatio: 1.2, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  bloodGroupSelected: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  bloodGroupLabel: { color: Colors.textSecondary, fontSize: 18, fontWeight: '700' },
  bloodGroupLabelSelected: { color: Colors.primary },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  stepperBtnText: { color: Colors.text, fontSize: 22, fontWeight: '600' },
  stepperValue: { backgroundColor: Colors.surface, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, minWidth: 60, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  stepperValueText: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  input: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border },
  conveyanceRow: { flexDirection: 'row', gap: 12 },
  conveyanceCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  conveyanceSelected: { backgroundColor: Colors.primaryGhost, borderColor: Colors.primary },
  conveyanceText: { color: Colors.textSecondary, fontSize: 18, fontWeight: '700' },
  conveyanceTextSelected: { color: Colors.primary },
});
