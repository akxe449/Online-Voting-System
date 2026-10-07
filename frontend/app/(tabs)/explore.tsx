import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, Screen } from '../../components/VotingUI';

export default function ExploreScreen() {
  return <Screen contentStyle={styles.screen}>
    <View style={styles.logo}><Text style={styles.logoText}>✓</Text></View>
    <Text style={styles.eyebrow}>ABOUT THE PORTAL</Text>
    <Text style={styles.title}>VoteSecure</Text>
    <Text style={styles.text}>A protected voter interface built around verified identity, controlled voting sessions and one-time credentials.</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>Privacy first</Text><Text style={styles.cardText}>Voters see confirmation after submission. Election results remain private and are not exposed through the voter application.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({
  screen: { justifyContent: 'center', alignItems: 'center', paddingBottom: 35 },
  logo: { width: 76, height: 76, borderRadius: 24, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFF', fontSize: 40, fontWeight: '900' },
  eyebrow: { color: colors.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginTop: 24 },
  title: { color: colors.ink, fontSize: 32, fontWeight: '900', marginTop: 5 },
  text: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 19, marginTop: 22, borderWidth: 1, borderColor: '#E7EBF2' },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  cardText: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 5, textAlign: 'center' },
});
