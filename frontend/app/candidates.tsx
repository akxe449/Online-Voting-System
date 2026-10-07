import { router } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, LoadingState, PageHeader, PrimaryButton, Screen } from '../components/VotingUI';
import { apiFetch, describeApiError } from '../config/api';
import { Candidate, useSession } from '../context/SessionContext';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
}

export default function CandidatesScreen() {
  usePreventScreenCapture();
  const { election, intentId, credentialToken, candidate, setCandidate } = useSession();
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!election) return;
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch(
        `list-candidates.php?election_id=${encodeURIComponent(String(election.election_id))}`,
      );
      if (d.success) {
        setItems(d.candidates || []);
      } else {
        setError(d.message || 'Unable to load candidates. Please try again.');
      }
    } catch (e) {
      setError(describeApiError(e, 'Unable to load candidates.'));
    } finally {
      setLoading(false);
    }
  }, [election]);

  useEffect(() => {
    if (!election || !intentId) {
      router.replace('/elections');
      return;
    }
    load();
  }, [election, intentId, load]);

  const continueToVote = () => {
    if (!candidate || !credentialToken) {
      Alert.alert('Selection required', 'Please select a candidate before continuing.');
      return;
    }
    router.push('/vote');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <PageHeader
        title="Select a candidate"
        subtitle={election?.name || 'Election'}
        step={5}
        total={6}
        onBack={() => router.back()}
      />

      {loading ? (
        <LoadingState label="Loading candidates…" />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Unable to load candidates</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <PrimaryButton title="TRY AGAIN" onPress={load} style={styles.retry} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No candidates available</Text>
          <Text style={styles.emptyText}>Candidates have not been added to this election.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>BALLOT</Text>
          {items.map((c, index) => {
            const selected = candidate?.candidate_id === c.candidate_id;
            return (
              <Pressable
                key={c.candidate_id}
                onPress={() => setCandidate(c)}
                style={({ pressed }) => [styles.card, selected && styles.selectedCard, pressed && styles.pressed]}
              >
                <View style={[styles.initials, selected && styles.selectedInitials]}>
                  <Text style={[styles.initialsText, selected && styles.selectedInitialsText]}>
                    {initials(c.name) || String(index + 1).padStart(2, '0')}
                  </Text>
                </View>

                <View style={styles.details}>
                  <Text style={styles.name}>{c.name}</Text>
                  {c.symbol ? <Text style={styles.symbol}>{c.symbol}</Text> : null}
                </View>

                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}

          <View style={styles.bottomArea}>
            <PrimaryButton
              title="CONTINUE"
              onPress={continueToVote}
              disabled={!candidate}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 200, paddingBottom: 30 },
  sectionLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  card: {
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCard: { borderColor: colors.blue, backgroundColor: '#F7FAFE' },
  pressed: { opacity: 0.78 },
  initials: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EEF1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInitials: { backgroundColor: colors.navy },
  initialsText: {
    color: '#556274',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  selectedInitialsText: { color: '#FFFFFF' },
  details: { flex: 1, marginLeft: 14 },
  name: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  symbol: { color: colors.muted, fontSize: 12, marginTop: 5 },
  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B8C1CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioSelected: { borderColor: colors.blue },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.blue,
  },
  bottomArea: { marginTop: 8 },
  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  retry: { marginTop: 16 },
});
