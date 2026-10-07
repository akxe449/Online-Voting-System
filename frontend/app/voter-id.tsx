import { API_BASE_URL } from '../config/api';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';

import {
    colors,
    PrimaryButton,
    Screen,
    StepHeader,
} from '../components/VotingUI';

import { useSession } from '../context/SessionContext';


export default function VoterIdScreen() {
  const {
    constituency,
    election,
    setVoterId,
    setIntentId,
  } = useSession();

  const [voterCode, setVoterCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!constituency || !election) {
      Alert.alert(
        'Selection missing',
        'Please select a constituency and election first.'
      );

      router.replace('/constituency');
      return;
    }

    const code = voterCode.trim().toUpperCase();

    if (!code) {
      Alert.alert(
        'Voter ID required',
        'Enter your Voter ID.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        API_BASE_URL + 'create-intent.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            voter_code: code,
            election_id: election.election_id,
          constituency_id: constituency.constituency_id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Cannot continue',
          data.message ||
            'You are not eligible for this election.'
        );
        return;
      }

      // Store the internal numeric voter_id returned by the backend.
      // The voter only sees/enters the voter_code.
      setVoterId(Number(data.voter_id));
      setIntentId(Number(data.intent_id));

      router.push('/otp');
    } catch {
      Alert.alert(
        'Connection error',
        'Unable to connect to the voting server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <StepHeader
        eyebrow="STEP 3"
        title="Enter your Voter ID"
        subtitle={
          election
            ? `Selected election: ${election.name}`
            : 'Enter your registered Voter ID.'
        }
        step={3}
        total={6}
      />

      <Text style={styles.constituencyLabel}>
        Constituency
      </Text>

      <Text style={styles.constituencyValue}>
        {constituency?.name || 'Not selected'}
      </Text>

      <Text style={styles.label}>
        Voter ID
      </Text>

      <TextInput
        style={styles.input}
        value={voterCode}
        onChangeText={(text) =>
          setVoterCode(
            text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
          )
        }
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={20}
        placeholder="Example: GND731846"
        placeholderTextColor="#98A2B3"
        autoFocus
      />

      <Text style={styles.help}>
        Enter the Voter ID provided during voter
        registration. Your constituency eligibility
        will be verified before OTP verification.
      </Text>

      <PrimaryButton
        title="CONTINUE"
        onPress={handleContinue}
        loading={loading}
        disabled={!voterCode.trim()}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  constituencyLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    marginBottom: 4,
  },

  constituencyValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#344054',
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.ink,
    backgroundColor: '#FBFCFE',
  },

  help: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 10,
  },

  button: {
    marginTop: 24,
  },
});