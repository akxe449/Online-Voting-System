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
    Constituency,
    useSession,
} from '../context/SessionContext';


export default function ConstituencyScreen() {
  const { constituency, setConstituency } = useSession();

  const [items, setItems] = useState<Constituency[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    setBusy(null);

    fetch(API_BASE_URL + 'list-constituencies.php')
      .then(async response => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Unable to load constituencies.'
          );
        }

        return data;
      })
      .then(data => {
        setItems(data.constituencies || []);
      })
      .catch(error => {
        Alert.alert(
          'Unable to load constituencies',
          error.message || 'Please try again.'
        );
      })
      .finally(() => {
        setLoading(false);
        setBusy(null);
      });
  }, []);

  const choose = (item: Constituency) => {
    if (busy !== null) {
      return;
    }

    setBusy(item.constituency_id);

    setConstituency(item);

    router.push('/elections');

    // Do not keep the old constituency button
    // permanently in loading state.
    setTimeout(() => {
      setBusy(null);
    }, 500);
  };

  return (
    <Screen>
      <StepHeader
        eyebrow="STEP 1"
        title="Choose your constituency"
        subtitle="Select the constituency where you are registered to vote."
        step={1}
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
            No constituencies available
          </Text>

          <Text style={styles.emptyText}>
            There are currently no constituencies available.
          </Text>
        </View>
      ) : (
        items.map(item => (
          <View
            key={item.constituency_id}
            style={styles.card}
          >
            <View style={styles.icon}>
              <Text style={styles.iconText}>◆</Text>
            </View>

            <Text style={styles.name}>
              {item.name}
            </Text>

            <PrimaryButton
              title={
                busy === item.constituency_id
                  ? 'SELECTING...'
                  : 'SELECT'
              }
              onPress={() => choose(item)}
              loading={busy === item.constituency_id}
              disabled={busy !== null}
              style={styles.button}
            />
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7EBF2',
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  iconText: {
    color: colors.blue,
    fontSize: 17,
    fontWeight: '900',
  },

  name: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
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