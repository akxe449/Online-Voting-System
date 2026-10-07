import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
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
import { describeApiError, postJson } from '../config/api';
import { useSession } from '../context/SessionContext';

/**
 * Phones with no fingerprint/face enrolled can't pass a biometric-only check.
 * true  -> such phones may verify with their screen-lock PIN/pattern/password
 *          instead (phones that DO have biometrics still must use biometrics).
 * false -> biometrics are mandatory; phones without them cannot vote.
 */
const ALLOW_DEVICE_PIN_FALLBACK = true;

export default function DeviceScreen() {
  usePreventScreenCapture();

  const {
    intentId,
    deviceKey,
    setDeviceKey,
  } = useSession();

  const [loading, setLoading] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (!intentId) {
      Alert.alert(
        'Session expired',
        'Please start the voting flow again.',
      );

      router.replace('/elections');
    }
  }, [intentId]);

  const verifyBiometric = async (): Promise<boolean> => {
    try {
      const [hasHardware, isEnrolled, level] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.getEnrolledLevelAsync(),
      ]);

      const hasBiometric = hasHardware && isEnrolled;

      if (!hasBiometric) {
        const hasScreenLock =
          level !== LocalAuthentication.SecurityLevel.NONE;

        if (!ALLOW_DEVICE_PIN_FALLBACK || !hasScreenLock) {
          Alert.alert(
            'Device security required',
            ALLOW_DEVICE_PIN_FALLBACK
              ? 'Please set a screen lock (PIN, pattern or password) or a fingerprint / Face ID on this device before continuing.'
              : !hasHardware
                ? 'This device does not support fingerprint or Face ID verification.'
                : 'Please set up Face ID, Touch ID, or a fingerprint on this device before continuing.',
          );
          return false;
        }
      }

      const result =
        await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity',
          cancelLabel: 'Cancel',
          // Biometric-only when the phone has biometrics; otherwise allow
          // the screen lock (only reachable when the fallback flag is on).
          disableDeviceFallback: hasBiometric,
        });

      if (result.success) {
        return true;
      }

      if (
        result.error === 'user_cancel' ||
        result.error === 'system_cancel' ||
        result.error === 'app_cancel'
      ) {
        return false;
      }

      Alert.alert(
        'Verification failed',
        'Verification was not successful. Please try again.',
      );

      return false;
    } catch {
      Alert.alert(
        'Verification error',
        'Unable to start device verification.',
      );

      return false;
    }
  };

  const bind = async () => {
    if (!intentId || busy.current) {
      return;
    }

    busy.current = true;
    setLoading(true);

    try {
      const verified = await verifyBiometric();

      if (!verified) {
        return;
      }

      const key =
        deviceKey ||
        `expo-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const d = await postJson('device-bind.php', {
        intent_id: intentId,
        platform: Platform.OS,
        device_key: key,
      });

      if (d.success) {
        setDeviceKey(key);
        router.push('/time-slots');
      } else {
        Alert.alert(
          'Device verification failed',
          d.message || 'Unable to bind this device.',
        );
      }
    } catch (e) {
      Alert.alert(
        'Connection error',
        describeApiError(e, 'Unable to bind this device.'),
      );
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <StepHeader
        eyebrow="STEP 3 · DEVICE CHECK"
        title="Verify this device"
        subtitle="Confirm your identity with the security on this phone."
        step={3}
        total={6}
      />

      <View style={styles.card}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>◉</Text>
        </View>

        <Text style={styles.title}>
          Device verification
        </Text>

        <Text style={styles.text}>
          Use Face ID, Touch ID, or your fingerprint
          to confirm that you are the person continuing
          this voting session.
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Device
          </Text>

          <Text style={styles.rowValue}>
            {Platform.OS === 'ios'
              ? 'iPhone'
              : 'Android'}
          </Text>
        </View>

        <PrimaryButton
          title="VERIFY & CONTINUE"
          onPress={bind}
          loading={loading}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 35,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7EBF2',
  },

  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    color: colors.blue,
    fontSize: 25,
    fontWeight: '900',
  },

  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 16,
  },

  text: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  row: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAECF0',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rowLabel: {
    color: colors.muted,
    fontSize: 13,
  },

  rowValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },

  button: {
    marginTop: 18,
  },
});
