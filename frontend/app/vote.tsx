import { router } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { colors, PageHeader, PrimaryButton, Screen } from '../components/VotingUI';
import { ApiError, describeApiError, postJson } from '../config/api';
import { useSession } from '../context/SessionContext';

export default function VoteScreen() {
  usePreventScreenCapture();
  const { candidate, credentialToken, setConfirmationCode } = useSession();
  const [loading, setLoading] = useState(false);
  // State updates are async, so a fast double-tap could fire two requests.
  const submitting = useRef(false);

  if (!candidate || !credentialToken) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Text style={styles.errorTitle}>Voting session unavailable</Text>
        <Text style={styles.errorText}>Please start the voting flow again.</Text>
        <PrimaryButton
          title="START AGAIN"
          onPress={() => router.replace('/elections')}
          style={styles.button}
        />
      </Screen>
    );
  }

  const cast = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);

    try {
      const d = await postJson(
        'cast-vote.php',
        {
          token: credentialToken,
          candidate_id: candidate.candidate_id,
        },
        20000,
      );

      if (d.success) {
        setConfirmationCode(String(d.confirmation_code || ''));
        router.replace('/vote-success');
      } else {
        const message = String(d.message || 'Unable to submit your vote.');
        const alreadyUsed = /already|used|voted/i.test(message);

        Alert.alert(
          alreadyUsed ? 'Vote already recorded' : 'Vote not submitted',
          alreadyUsed
            ? 'This voting credential has already been used. A second vote cannot be submitted.'
            : message
        );
      }
    } catch (e) {
      // A timeout/network drop can happen AFTER the server saved the vote,
      // so don't tell the voter it definitely failed.
      const maybeSaved =
        e instanceof ApiError && (e.kind === 'timeout' || e.kind === 'network');

      Alert.alert(
        'Connection error',
        maybeSaved
          ? `${describeApiError(e, 'Unable to connect to the voting server.')}\n\nYour vote may or may not have been recorded. If you press SUBMIT again and are told this credential was already used, your vote was counted.`
          : describeApiError(e, 'Unable to connect to the voting server.')
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <PageHeader
        title="Review your selection"
        subtitle="Check the candidate below before submitting your ballot."
        step={6}
        total={6}
        onBack={() => router.back()}
      />

      <View style={styles.card}>
        <Text style={styles.label}>SELECTED CANDIDATE</Text>

        <View style={styles.candidateRow}>
          <View style={styles.initials}>
            <Text style={styles.initialsText}>
              {candidate.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map(part => part[0]?.toUpperCase() || '')
                .join('')}
            </Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.name}>{candidate.name}</Text>
            {candidate.symbol ? (
              <Text style={styles.symbol}>{candidate.symbol}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rule} />

        <View style={styles.warningRow}>
          <Text style={styles.warningMark}>!</Text>

          <View style={styles.warningBody}>
            <Text style={styles.warningTitle}>Final submission</Text>
            <Text style={styles.warningText}>
              Once submitted, this vote cannot be changed or submitted again.
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="SUBMIT VOTE"
          onPress={cast}
          loading={loading}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 200,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 21,
    borderWidth: 1,
    borderColor: colors.line,
  },

  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  initials: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initialsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  details: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },

  symbol: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },

  rule: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 21,
  },

  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  warningMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warningSoft,
    color: colors.warning,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
    paddingTop: 4,
  },

  warningBody: {
    flex: 1,
    marginLeft: 10,
  },

  warningTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },

  warningText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  button: {
    marginTop: 22,
  },

  center: {
    justifyContent: 'center',
  },

  errorTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
