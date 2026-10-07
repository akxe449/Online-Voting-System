import { API_BASE_URL } from '../config/api';
import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, PrimaryButton, Screen, SecondaryButton } from '../components/VotingUI';
import { generateStrongPassword, getPasswordChecks, isStrongPassword, isValidAadhaar, isValidIndianMobile, passwordStrength } from '../utils/validation';


function EyeButton({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} hitSlop={10} style={styles.eye}><Text style={styles.eyeText}>{visible ? 'HIDE' : 'SHOW'}</Text></Pressable>;
}

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const strength = useMemo(() => passwordStrength(password), [password]);
  const valid = isValidIndianMobile(phone) && isValidAadhaar(aadhaar) && isStrongPassword(password) && password === confirmPassword;

  const handleRegister = async () => {
    if (!phone || !aadhaar || !password || !confirmPassword) {
      Alert.alert('Complete your details', 'Please fill in every field.');
      return;
    }
    if (!isValidIndianMobile(phone)) {
      Alert.alert('Invalid phone number', 'Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    if (!isValidAadhaar(aadhaar)) {
      Alert.alert('Invalid Aadhaar number', 'Enter a valid 12-digit Aadhaar-format number.');
      return;
    }
    if (!isStrongPassword(password)) {
      Alert.alert('Password does not meet the rules', 'Use at least 10 characters with uppercase, lowercase, number, special character, and no spaces.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Enter the same password in both fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch((API_BASE_URL + 'register.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password, aadhaar: aadhaar.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Account created', 'Your voter account has been created successfully.', [
          { text: 'Continue to Login', onPress: () => router.replace('/') },
        ]);
      } else {
        Alert.alert('Registration failed', data.message || 'Unable to create your account.');
      }
    } catch {
      Alert.alert('Connection error', 'Unable to reach the voting server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const passwordRow = (ok: boolean, label: string) => (
    <View style={styles.ruleRow} key={label}>
      <Text style={[styles.ruleIcon, ok && styles.ruleIconGood]}>{ok ? '✓' : '•'}</Text>
      <Text style={[styles.ruleText, ok && styles.ruleTextGood]}>{label}</Text>
    </View>
  );

  return (
    <Screen contentStyle={styles.screen}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
          <Text style={styles.eyebrow}>VOTER REGISTRATION</Text>
          <Text style={styles.title}>Create your secure account</Text>
          <Text style={styles.subtitle}>Your identity details are used only to establish your voter account.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account details</Text>

          <Text style={styles.label}>Phone number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={t => setPhone(t.replace(/\D/g, ''))} keyboardType="phone-pad" maxLength={10} placeholder="10-digit mobile number" placeholderTextColor="#98A2B3" />

          <Text style={styles.label}>Aadhaar number</Text>
          <View style={styles.inputWrap}>
            <TextInput style={styles.inputWithAction} value={aadhaar} onChangeText={t => setAadhaar(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={12} secureTextEntry={!showAadhaar} placeholder="12-digit Aadhaar number" placeholderTextColor="#98A2B3" />
            <EyeButton visible={showAadhaar} onPress={() => setShowAadhaar(v => !v)} />
          </View>
          <Text style={styles.micro}>Enter exactly 12 digits. This does not contact UIDAI.</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <Pressable onPress={() => setPassword(generateStrongPassword())}><Text style={styles.generate}>GENERATE STRONG</Text></Pressable>
          </View>
          <View style={styles.inputWrap}>
            <TextInput style={styles.inputWithAction} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} placeholder="Create a strong password" placeholderTextColor="#98A2B3" />
            <EyeButton visible={showPassword} onPress={() => setShowPassword(v => !v)} />
          </View>

          <View style={styles.strengthRow}>
            <View style={styles.strengthTrack}>
              <View style={[styles.strengthFill, { width: `${Math.max(4, (strength.score / 6) * 100)}%`, backgroundColor: strength.score >= 6 ? colors.success : strength.score >= 5 ? '#D97706' : '#DC2626' }]} />
            </View>
            <Text style={styles.strengthLabel}>{strength.label}</Text>
          </View>

          <View style={styles.rules}>
            {passwordRow(checks.length, 'At least 10 characters')}
            {passwordRow(checks.uppercase, 'One uppercase letter')}
            {passwordRow(checks.lowercase, 'One lowercase letter')}
            {passwordRow(checks.number, 'One number')}
            {passwordRow(checks.special, 'One special character')}
            {passwordRow(checks.noSpaces, 'No spaces')}
          </View>

          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.inputWrap}>
            <TextInput style={styles.inputWithAction} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} autoCapitalize="none" autoCorrect={false} placeholder="Re-enter your password" placeholderTextColor="#98A2B3" />
            <EyeButton visible={showConfirm} onPress={() => setShowConfirm(v => !v)} />
          </View>

          <PrimaryButton title="CREATE ACCOUNT" onPress={handleRegister} loading={loading} disabled={!valid} style={styles.submit} />

          <SecondaryButton title="Back to Login" onPress={() => router.replace('/')} style={styles.secondary} />
        </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 280 },
  top: { marginBottom: 18 },
  back: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E4E7EC' },
  backText: { fontSize: 30, lineHeight: 32, color: colors.ink },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1, color: colors.blue },
  title: { fontSize: 29, lineHeight: 35, fontWeight: '800', color: colors.ink, marginTop: 7 },
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#E7EBF2' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '800', color: '#344054', marginBottom: 8, marginTop: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  generate: { color: colors.blue, fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  input: { height: 52, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 14, paddingHorizontal: 15, fontSize: 16, color: colors.ink, backgroundColor: '#FBFCFE' },
  inputWrap: { position: 'relative' },
  inputWithAction: { height: 52, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 14, paddingHorizontal: 15, paddingRight: 65, fontSize: 16, color: colors.ink, backgroundColor: '#FBFCFE' },
  eye: { position: 'absolute', right: 14, top: 0, height: 52, justifyContent: 'center' },
  eyeText: { fontSize: 10, fontWeight: '900', color: colors.blue, letterSpacing: 0.4 },
  micro: { fontSize: 11, lineHeight: 16, color: '#98A2B3', marginTop: 6 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  strengthTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#EAECF0', overflow: 'hidden' },
  strengthFill: { height: 6, borderRadius: 3 },
  strengthLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, width: 72, textAlign: 'right' },
  rules: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginTop: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  ruleIcon: { width: 20, fontSize: 14, color: '#98A2B3' },
  ruleIconGood: { color: colors.success, fontWeight: '900' },
  ruleText: { fontSize: 12, color: '#667085' },
  ruleTextGood: { color: '#344054' },
  submit: { marginTop: 22 },
  secondary: { marginTop: 10 },
});
