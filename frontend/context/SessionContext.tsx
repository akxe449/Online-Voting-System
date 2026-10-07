import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

export type Constituency = {
  constituency_id: number;
  name: string;
};

export type Election = {
  election_id: number;
  election_type_id?: number;
  name: string;
  start_time: string;
  end_time: string;
  status: string;
  constituency_id?: number;
};

export type Candidate = {
  candidate_id: number;
  name: string;
  symbol: string;
};

export type TimeSlot = {
  time_slot_id: number;
  slot_start: string;
  slot_end: string;
  selected_at?: string | null;
};

type Session = {
  voterId: number | null;
  constituency: Constituency | null;
  election: Election | null;
  intentId: number | null;
  otp: string | null;
  deviceKey: string | null;
  selectedSlot: TimeSlot | null;
  credentialToken: string | null;
  candidate: Candidate | null;
  confirmationCode: string | null;
};

type SessionContextValue = Session & {
  setVoterId: (id: number) => void;
  setConstituency: (constituency: Constituency) => void;
  setElection: (election: Election) => void;
  setIntentId: (id: number) => void;
  setOtp: (otp: string) => void;
  setDeviceKey: (key: string) => void;
  setSelectedSlot: (slot: TimeSlot) => void;
  setCredentialToken: (token: string) => void;
  setCandidate: (candidate: Candidate) => void;
  setConfirmationCode: (code: string) => void;
  resetVotingFlow: () => void;
  logout: () => void;
};

const SessionContext =
  createContext<SessionContextValue | null>(null);

const initialSession: Session = {
  voterId: null,
  constituency: null,
  election: null,
  intentId: null,
  otp: null,
  deviceKey: null,
  selectedSlot: null,
  credentialToken: null,
  candidate: null,
  confirmationCode: null,
};

function makeDeviceKey() {
  return `expo-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] =
    useState<Session>(initialSession);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...session,

      setVoterId: (id) =>
        setSession((s) => ({
          ...s,
          voterId: id,
        })),

      setConstituency: (constituency) =>
        setSession((s) => ({
          ...s,
          constituency,
          election: null,
          intentId: null,
          otp: null,
          selectedSlot: null,
          credentialToken: null,
          candidate: null,
          confirmationCode: null,
        })),

      setElection: (election) =>
        setSession((s) => ({
          ...s,
          election,
          intentId: null,
          otp: null,
          selectedSlot: null,
          credentialToken: null,
          candidate: null,
          confirmationCode: null,
        })),

      setIntentId: (id) =>
        setSession((s) => ({
          ...s,
          intentId: id,
        })),

      setOtp: (otp) =>
        setSession((s) => ({
          ...s,
          otp,
        })),

      setDeviceKey: (key) =>
        setSession((s) => ({
          ...s,
          deviceKey: key,
        })),

      setSelectedSlot: (slot) =>
        setSession((s) => ({
          ...s,
          selectedSlot: slot,
        })),

      setCredentialToken: (token) =>
        setSession((s) => ({
          ...s,
          credentialToken: token,
        })),

      setCandidate: (candidate) =>
        setSession((s) => ({
          ...s,
          candidate,
        })),

      setConfirmationCode: (code) =>
        setSession((s) => ({
          ...s,
          confirmationCode: code,
        })),

      resetVotingFlow: () =>
        setSession((s) => ({
          ...s,
          constituency: null,
          election: null,
          intentId: null,
          otp: null,
          selectedSlot: null,
          credentialToken: null,
          candidate: null,
          confirmationCode: null,
        })),

      logout: () => setSession(initialSession),
    }),
    [session]
  );

  React.useEffect(() => {
    if (!session.deviceKey) {
      setSession((s) => ({
        ...s,
        deviceKey: makeDeviceKey(),
      }));
    }
  }, [session.deviceKey]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession must be used inside SessionProvider'
    );
  }

  return context;
}