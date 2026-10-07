import { CameraView, useCameraPermissions } from 'expo-camera';
import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const CAMERA_ROUTES = new Set(['/candidates', '/vote']);

/**
 * Preview-only front camera shown on the ballot + review screens.
 * Never records, never takes pictures, never uploads anything.
 * Screens that show it reserve ~200px of top padding.
 */
export default function VotingCamera() {
  const pathname = usePathname();
  const [permission, requestPermission] = useCameraPermissions();
  const active = CAMERA_ROUTES.has(pathname);
  const asked = useRef(false);

  // Ask once. Without this guard a denial can re-trigger the prompt.
  useEffect(() => {
    if (
      active &&
      permission &&
      !permission.granted &&
      permission.canAskAgain &&
      !asked.current
    ) {
      asked.current = true;
      requestPermission();
    }
  }, [active, permission, requestPermission]);

  if (!active || !permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.off]}>
        <Text style={styles.offTitle}>Camera preview is off</Text>
        <Text style={styles.offText}>
          Camera access was not allowed. No video is recorded or stored.
        </Text>
        <Pressable
          onPress={() =>
            permission.canAskAgain ? requestPermission() : Linking.openSettings()
          }
          style={styles.offButton}
        >
          <Text style={styles.offButtonText}>
            {permission.canAskAgain ? 'ALLOW CAMERA' : 'OPEN SETTINGS'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      <CameraView style={styles.camera} facing="front" mode="picture" mute />
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>LIVE CAMERA</Text>
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Camera preview is live. No video is recorded or stored.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 190,
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  camera: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  notice: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.64)',
  },
  noticeText: { color: '#FFFFFF', fontSize: 9, textAlign: 'center' },
  off: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  offTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  offText: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  offButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  offButtonText: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
