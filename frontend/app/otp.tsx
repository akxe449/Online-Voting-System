import { router } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  colors,
  PageHeader,
  PrimaryButton,
  Screen,
} from '../components/VotingUI';

import { describeApiError, postJson } from '../config/api';
import { useSession } from '../context/SessionContext';

// The code is valid for 1 minute, so let people ask for a new one after 30s.
const RESEND_COOLDOWN_SECONDS = 30;

export default function OtpScreen() {
  usePreventScreenCapture();

  const {
    intentId,
    setCredentialToken,
  } = useSession();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  // Guards against sending two emails if the effect runs twice in dev.
  const requestedOnce = useRef(false);

  useEffect(() => {
    if (!intentId) {
      Alert.alert(
        'Session expired',
        'Please start the voting flow again.',
      );

      router.replace('/constituency');
      return;
    }

    if (requestedOnce.current) return;
    requestedOnce.current = true;

    requestOtp(Number(intentId)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const requestOtp = async (id: number): Promise<boolean> => {
    try {
      const data = await postJson('otp-request.php', { intent_id: id });

      if (data.success) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
        return true;
      }

      Alert.alert(
        'Unable to continue',
        data.message || 'Unable to send the verification code.',
      );
    } catch (e) {
      Alert.alert(
        'Connection error',
        describeApiError(e, 'Unable to request the verification code.'),
      );
    }
    return false;
  };

  const resend = async () => {
    if (!intentId || resending || cooldown > 0) return;
    setResending(true);
    setCode('');
    await requestOtp(Number(intentId));
    setResending(false);
  };

  const verify = async () => {
    if (code.length !== 6) {
      Alert.alert(
        'Enter the code',
        'Please enter all 6 digits.',
      );
      return;
    }

    setVerifying(true);

    try {
      const data = await postJson('otp-verify.php', {
        intent_id: Number(intentId),
        otp: code,
      });

      if (data.success && data.credential_token) {
        setCredentialToken(String(data.credential_token));

        router.push('/device');
      } else {
        Alert.alert(
          'Code not accepted',
          data.message || 'The code is invalid or expired.',
        );
      }
    } catch (e) {
      Alert.alert(
        'Connection error',
        describeApiError(e, 'Unable to verify the code.'),
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleDigit = (
    index: number,
    value: string,
  ) => {
    const digit = value
      .replace(/\D/g, '')
      .slice(-1);

    const next = code.split('');
    next[index] = digit;

    const clean = next
      .join('')
      .slice(0, 6);

    setCode(clean);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <PageHeader
        title="Enter verification code"
        subtitle="A 6-digit verification code has been sent to your registered email address."
        step={4}
        total={6}
        onBack={() => router.back()}
      />

      <View style={styles.card}>
        <Text style={styles.label}>
          Verification code
        </Text>

        <View style={styles.codeRow}>
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={code[index] || ''}
                onChangeText={(value) =>
                  handleDigit(index, value)
                }
                onKeyPress={({ nativeEvent }) => {
                  if (
                    nativeEvent.key ===
                      'Backspace' &&
                    !code[index] &&
                    index > 0
                  ) {
                    inputRefs.current[
                      index - 1
                    ]?.focus();
                  }
                }}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={1}
                editable={
                  !loading && !verifying && !resending
                }
                style={[
                  styles.codeBox,
                  code[index]
                    ? styles.codeBoxFilled
                    : undefined,
                ]}
                textAlign="center"
                selectTextOnFocus
              />
            ),
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            Check your email
          </Text>

          <Text style={styles.infoText}>
            Enter the 6-digit OTP sent to your
            registered email address. The code is
            valid for 1 minute.
          </Text>
        </View>

        <PrimaryButton
          title="VERIFY"
          onPress={verify}
          loading={verifying || loading}
          disabled={loading}
          style={styles.button}
        />

        <Pressable
          onPress={resend}
          disabled={loading || verifying || resending || cooldown > 0}
          style={styles.resend}
        >
          <Text
            style={[
              styles.resendText,
              (loading || verifying || resending || cooldown > 0) &&
                styles.resendDisabled,
            ]}
          >
            {resending
              ? 'Sending a new code…'
              : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : 'Didn’t get it? Resend code'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 21,
    borderWidth: 1,
    borderColor: colors.line,
  },

  label: {
    color: '#39465A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },

  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  codeBox: {
    width: 45,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCD4DF',
    backgroundColor: '#FCFDFE',
    paddingHorizontal: 0,
    fontSize: 21,
    fontWeight: '800',
    color: colors.ink,
  },

  codeBoxFilled: {
    borderColor: colors.blue,
    backgroundColor: colors.blueSoft,
  },

  infoBox: {
    marginTop: 22,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F6F8FB',
    borderWidth: 1,
    borderColor: colors.line,
  },

  infoTitle: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '800',
  },

  infoText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  button: {
    marginTop: 18,
  },

  resend: {
    marginTop: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },

  resendText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '700',
  },

  resendDisabled: {
    color: colors.muted,
  },
});
