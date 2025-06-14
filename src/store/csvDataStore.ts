import { create } from 'zustand';
import { CleanedRow, PreprocessingReport } from '@/utils/dataPreprocessing';

interface CSVDataState {
  rawData: any[];
  cleanedData: CleanedRow[];
  preprocessingReport: PreprocessingReport | null;
  isDataReady: boolean;
  setRawData: (data: any[]) => void;
  setCleanedData: (data: CleanedRow[]) => void;
  setPreprocessingReport: (report: PreprocessingReport) => void;
  clearData: () => void;
}

export const useCSVDataStore = create<CSVDataState>((set) => ({
  rawData: [],
  cleanedData: [],
  preprocessingReport: null,
  isDataReady: false,
  setRawData: (data) => set({ rawData: data }),
  setCleanedData: (data) => set({ 
    cleanedData: data, 
    isDataReady: data.length > 0 
  }),
  setPreprocessingReport: (report) => set({ preprocessingReport: report }),
  clearData: () => set({ 
    rawData: [],
    cleanedData: [], 
    preprocessingReport: null, 
    isDataReady: false 
  }),
}));
