import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { SessionProvider } from '../context/SessionContext';
import VotingCamera from '../components/VotingCamera';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider
        value={
          colorScheme === 'dark'
            ? DarkTheme
            : DefaultTheme
        }
      >
        <Stack
          screenOptions={{
            headerBackTitle: 'Back',
            headerTintColor: '#2563EB',
            headerTitleStyle: {
              fontWeight: '700',
            },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="register"
            options={{ title: 'Register' }}
          />

          <Stack.Screen
            name="dashboard"
            options={{
              title: 'Dashboard',
              headerBackVisible: false,
            }}
          />

          <Stack.Screen
            name="constituency"
            options={{
              title: 'Choose Constituency',
            }}
          />

          <Stack.Screen
            name="elections"
            options={{
              title: 'Choose Election',
            }}
          />

          <Stack.Screen
            name="voter-id"
            options={{
              title: 'Voter ID',
            }}
          />

          <Stack.Screen
            name="otp"
            options={{
              title: 'OTP Verification',
            }}
          />

          <Stack.Screen
            name="device"
            options={{
              title: 'Device Verification',
            }}
          />

          <Stack.Screen
            name="time-slots"
            options={{
              title: 'Choose Time Slot',
            }}
          />

          <Stack.Screen
            name="candidates"
            options={{
              title: 'Choose Candidate',
            }}
          />

          <Stack.Screen
            name="vote"
            options={{
              title: 'Confirm Vote',
            }}
          />

          <Stack.Screen
            name="vote-success"
            options={{
              title: 'Vote Submitted',
              headerBackVisible: false,
            }}
          />

          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Modal',
            }}
          />
        </Stack>

        <VotingCamera />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}