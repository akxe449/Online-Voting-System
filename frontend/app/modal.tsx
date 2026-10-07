import { StyleSheet, Text, Pressable, View } from 'react-native';
import { router } from 'expo-router';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Voting</Text>
      <Text style={styles.text}>Development information screen.</Text>
      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  text: { marginTop: 8, color: '#6B7280' },
  button: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#2563EB' },
  buttonText: { color: '#FFF', fontWeight: '700' },
});
