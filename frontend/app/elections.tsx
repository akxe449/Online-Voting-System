import { API_BASE_URL } from '../config/api';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  PrimaryButton,
  Screen,
  StepHeader,
} from '../components/VotingUI';

import {
  Election,
  useSession,
} from '../context/SessionContext';


export default function ElectionsScreen() {
  const {
    constituency,
    setElection,
  } = useSession();

  const [items, setItems] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (!constituency) {
      router.replace('/constituency');
      return;
    }

    fetch(
      API_BASE_URL +
        `list-elections.php?constituency_id=${constituency.constituency_id}`
    )
      .then(async (r) => {
        const data = await r.json();

        if (!r.ok || !data.success) {
          throw new Error(
            data.message || 'Unable to load elections.'
          );
        }

        return data;
      })
      .then((data) => {
        setItems(data.elections || []);
      })
      .catch((error) => {
        Alert.alert(
          'Unable to load elections',
          error.message || 'Please try again.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [constituency]);

  const choose = (election: Election) => {
    setBusy(election.election_id);

    setElection(election);

    router.push('/voter-id');

    setBusy(null);
  };

  return (
    <Screen>
      <StepHeader
        eyebrow="STEP 2"
        title="Choose an election"
        subtitle={
          constituency
            ? `Available elections in ${constituency.name}.`
            : 'Select an election to continue.'
        }
        step={2}
        total={6}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.blue}
          style={{ marginTop: 30 }}
        />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            No elections available
          </Text>

          <Text style={styles.emptyText}>
            There are currently no active elections for this
            constituency.
          </Text>
        </View>
      ) : (
        items.map((e) => {
          const active = e.status === 'active';

          return (
            <View
              key={e.election_id}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={styles.electionIcon}>
                  <Text style={styles.iconText}>◆</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {e.name}
                  </Text>

                  <View
                    style={[
                      styles.status,
                      active
                        ? styles.active
                        : styles.inactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        active
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {active
                        ? 'ACTIVE'
                        : e.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.time}>
                {e.start_time}
              </Text>

              <Text style={styles.arrow}>to</Text>

              <Text style={styles.time}>
                {e.end_time}
              </Text>

              <PrimaryButton
                title={
                  busy === e.election_id
                    ? 'OPENING...'
                    : active
                    ? 'SELECT ELECTION'
                    : 'NOT AVAILABLE'
                }
                onPress={() => choose(e)}
                loading={busy === e.election_id}
                disabled={!active || busy !== null}
                style={styles.button}
              />
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7EBF2',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  electionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    color: colors.blue,
    fontSize: 17,
    fontWeight: '900',
  },

  name: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },

  status: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  active: {
    backgroundColor: colors.successSoft,
  },

  inactive: {
    backgroundColor: '#F2F4F7',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  activeText: {
    color: colors.success,
  },

  inactiveText: {
    color: colors.muted,
  },

  time: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 16,
  },

  arrow: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 3,
  },

  button: {
    marginTop: 17,
  },

  empty: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E7EBF2',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },

  emptyText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginTop: 6,
  },
});