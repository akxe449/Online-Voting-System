import { API_BASE_URL } from '../config/api';
import { router } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, Screen, StepHeader } from '../components/VotingUI';
import { TimeSlot, useSession } from '../context/SessionContext';


export default function TimeSlotsScreen() {
  usePreventScreenCapture();
  const { intentId, setSelectedSlot } = useSession();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (!intentId) { router.replace('/elections'); return; }
    fetch(API_BASE_URL + `list-time-slots.php?intent_id=${intentId}`)
      .then(r => r.json()).then(d => { if (d.success) setSlots(d.slots || []); else Alert.alert('Unable to load slots', d.message || 'Please try again.'); })
      .catch(() => Alert.alert('Connection error', 'Unable to load time slots.'))
      .finally(() => setLoading(false));
  }, [intentId]);

  const choose = async (slot: TimeSlot) => {
    if (!intentId) return;
    setBusy(slot.time_slot_id);
    try {
      const r = await fetch(API_BASE_URL + 'select-time-slot.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent_id: intentId, time_slot_id: slot.time_slot_id }) });
      const d = await r.json();
      if (!d.success) { Alert.alert('Cannot select slot', d.message || 'Unable to select this slot.'); return; }
      setSelectedSlot(slot); router.push('/candidates');
    } catch { Alert.alert('Connection error', 'Unable to select the time slot.'); }
    finally { setBusy(null); }
  };

  return <Screen contentStyle={styles.screen}>
    <StepHeader eyebrow="STEP 4 · SESSION WINDOW" title="Choose a time slot" subtitle="Select an available slot for your protected voting session." step={4} total={6} />
    {loading ? <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 25 }} /> :
      slots.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No slots available</Text><Text style={styles.emptyText}>There are no voting slots available for this session.</Text></View> :
      slots.map(slot => (
        <View key={slot.time_slot_id} style={styles.card}>
          <View style={styles.clock}><Text style={styles.clockText}>◷</Text></View>
          <Text style={styles.time}>{slot.slot_start}</Text>
          <Text style={styles.to}>TO</Text>
          <Text style={styles.time}>{slot.slot_end}</Text>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={() => choose(slot)} disabled={busy !== null}>
            <Text style={styles.buttonText}>{busy === slot.time_slot_id ? 'SELECTING…' : 'SELECT THIS SLOT'}</Text>
          </Pressable>
        </View>
      ))
    }
  </Screen>;
}
const styles = StyleSheet.create({
  screen: { paddingBottom: 35 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 19, marginBottom: 14, borderWidth: 1, borderColor: '#E7EBF2', alignItems: 'center' },
  clock: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  clockText: { color: colors.blue, fontSize: 9, fontWeight: '900', letterSpacing: .7 },
  time: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 14 },
  to: { color: '#98A2B3', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 5 },
  button: { minHeight: 50, borderRadius: 14, backgroundColor: colors.blue, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  pressed: { opacity: .82 },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  empty: { backgroundColor: '#FFF', padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#E7EBF2' },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
});
