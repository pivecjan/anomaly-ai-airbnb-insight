import { create } from 'zustand';
import { CleanedRow, PreprocessingReport } from '@/utils/dataPreprocessing';

interface CSVDataState {
  rawData: any[];
  cleanedData: CleanedRow[];
  enhancedData: any[];
  preprocessingReport: PreprocessingReport | null;
  isDataReady: boolean;
  isAnalysisStarted: boolean;
  isAnalyzing: boolean;
  isEnhanced: boolean;
  setRawData: (data: any[]) => void;
  setCleanedData: (data: CleanedRow[]) => void;
  setEnhancedData: (data: any[]) => void;
  setPreprocessingReport: (report: PreprocessingReport) => void;
  startAnalysis: () => void;
  setAnalyzing: (analyzing: boolean) => void;
  clearData: () => void;
}

export const useCSVDataStore = create<CSVDataState>((set) => ({
  rawData: [],
  cleanedData: [],
  enhancedData: [],
  preprocessingReport: null,
  isDataReady: false,
  isAnalysisStarted: false,
  isAnalyzing: false,
  isEnhanced: false,
  setRawData: (data) => set({ rawData: data }),
  setCleanedData: (data) => set({ 
    cleanedData: data, 
    isDataReady: data.length > 0 
  }),
  setEnhancedData: (data) => set({ 
    enhancedData: data, 
    isEnhanced: data.length > 0 
  }),
  setPreprocessingReport: (report) => set({ preprocessingReport: report }),
  startAnalysis: () => set({ 
    isAnalysisStarted: true, 
    isAnalyzing: true 
  }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  clearData: () => set({ 
    rawData: [],
    cleanedData: [], 
    enhancedData: [],
    preprocessingReport: null, 
    isDataReady: false,
    isAnalysisStarted: false,
    isAnalyzing: false,
    isEnhanced: false
  }),
}));
