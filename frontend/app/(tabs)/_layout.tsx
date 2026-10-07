import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#98A2B3',
      tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 7, borderTopColor: '#E7EBF2', backgroundColor: '#FFFFFF' },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Sign in', tabBarIcon: ({ color, size }) => <Ionicons name="log-in-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'About', tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
