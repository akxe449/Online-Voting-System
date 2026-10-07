import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useSession } from '../context/SessionContext';
import { colors, PrimaryButton, Screen } from '../components/VotingUI';

export default function VoteSuccess() {
  usePreventScreenCapture();
  const { confirmationCode } = useSession();

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.icon}><Text style={styles.check}>✓</Text></View>
      <Text style={styles.title}>Vote submitted</Text>
      <Text style={styles.text}>Your vote has been recorded successfully.</Text>

      {confirmationCode ? (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CONFIRMATION CODE</Text>
          <Text style={styles.code}>{confirmationCode}</Text>
          <Text style={styles.hint}>Keep this code for your reference.</Text>
        </View>
      ) : null}

      <Text style={styles.privateText}>Results are not displayed in the voter app.</Text>
      <PrimaryButton title="BACK TO DASHBOARD" onPress={() => router.replace('/dashboard')} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingBottom: 25 },
  icon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: '#CDE8DA', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  check: { color: colors.success, fontSize: 39, fontWeight: '800' },
  title: { color: colors.ink, fontSize: 31, lineHeight: 38, fontWeight: '800', textAlign: 'center', marginTop: 23 },
  text: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  codeCard: { backgroundColor: colors.navy, borderRadius: 20, padding: 20, marginTop: 25, alignItems: 'center' },
  codeLabel: { color: '#B7C7DD', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  code: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', letterSpacing: 2, marginTop: 7 },
  hint: { color: '#B7C7DD', fontSize: 10, marginTop: 7 },
  privateText: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 17 },
  button: { marginTop: 20 },
});
