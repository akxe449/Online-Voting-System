import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../context/SessionContext';
import { colors, PrimaryButton, Screen, SecondaryButton } from '../components/VotingUI';

export default function DashboardScreen() {
  const { voterId, resetVotingFlow, logout } = useSession();
  const start = () => { resetVotingFlow(); router.push('/elections'); };
  const doLogout = () => { logout(); router.replace('/'); };

  if (!voterId) {
    return <Screen scroll={false} contentStyle={styles.center}><View style={styles.card}><Text style={styles.title}>Session unavailable</Text><Text style={styles.text}>Please sign in again.</Text><PrimaryButton title="GO TO LOGIN" onPress={() => router.replace('/')} style={styles.action}/></View></Screen>;
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topRow}>
        <View><Text style={styles.eyebrow}>VOTER PORTAL</Text><Text style={styles.title}>Good to see you.</Text></View>
        <View style={styles.secure}><Text style={styles.secureIcon}>✓</Text><Text style={styles.secureText}>SECURE</Text></View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}><Text style={styles.heroIconText}>→</Text></View>
        <Text style={styles.heroTitle}>Ready to vote?</Text>
        <Text style={styles.heroText}>Choose an active election and complete the protected voting steps.</Text>
        <PrimaryButton title="VIEW ELECTIONS" onPress={start} style={styles.action} />
      </View>

      <SecondaryButton title="LOG OUT" onPress={doLogout} style={styles.logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 28, paddingBottom: 30 },
  center: { justifyContent: 'center' },
  card: { backgroundColor: '#FFF', padding: 24, borderRadius: 22 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1, color: colors.blue },
  title: { fontSize: 30, fontWeight: '900', color: colors.ink, marginTop: 5 },
  text: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 8 },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.successSoft, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 12 },
  secureIcon: { color: colors.success, fontWeight: '900' },
  secureText: { color: colors.success, fontSize: 9, fontWeight: '900', letterSpacing: .7 },
  heroCard: { backgroundColor: colors.navy, borderRadius: 24, padding: 22, marginBottom: 16 },
  heroIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#1F2E48', alignItems: 'center', justifyContent: 'center' },
  heroIconText: { color: '#8DB4FF', fontSize: 24, fontWeight: '900' },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 18 },
  heroText: { color: '#C9D4E6', fontSize: 14, lineHeight: 21, marginTop: 5 },
  action: { marginTop: 20 },
  logout: { marginTop: 18 },
});
