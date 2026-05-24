import React, {createContext, useContext, useState, useCallback} from 'react';
import {AnalysisResult, Member} from '@/types/analysis';

type Mode = 'runner' | 'trainer';

interface AppState {
  mode: Mode;
  setMode: (m: Mode) => void;
  videoUri: string | null;
  setVideoUri: (uri: string | null) => void;
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (a: AnalysisResult | null) => void;
  members: Member[];
  addMember: (name: string) => Member;
  selectedMember: Member | null;
  selectMember: (m: Member | null) => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({children}: {children: React.ReactNode}) {
  const [mode, setMode] = useState<Mode>('runner');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, selectMember] = useState<Member | null>(null);
  const [serverUrl, setServerUrl] = useState('http://10.0.2.2:8000');

  const addMember = useCallback(
    (name: string) => {
      const member: Member = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
        analyses: [],
      };
      setMembers(prev => [...prev, member]);
      return member;
    },
    [],
  );

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        videoUri,
        setVideoUri,
        currentAnalysis,
        setCurrentAnalysis,
        members,
        addMember,
        selectedMember,
        selectMember,
        serverUrl,
        setServerUrl,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
