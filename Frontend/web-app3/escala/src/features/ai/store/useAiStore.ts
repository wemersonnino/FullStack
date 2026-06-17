import { create } from 'zustand';

interface AiState {
  isOpen: boolean;
  isAnalyzing: boolean;
  analysis: string | null;
  credits: number;
  openAi: () => void;
  closeAi: () => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysis: (analysis: string | null) => void;
  setCredits: (credits: number) => void;
}

export const useAiStore = create<AiState>((set) => ({
  isOpen: false,
  isAnalyzing: false,
  analysis: null,
  credits: 0,
  openAi: () => set({ isOpen: true }),
  closeAi: () => set({ isOpen: false }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setAnalysis: (analysis) => set({ analysis }),
  setCredits: (credits) => set({ credits }),
}));
