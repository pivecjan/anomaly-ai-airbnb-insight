
import { create } from 'zustand';
import { CleanedRow, PreprocessingReport } from '@/utils/dataPreprocessing';

interface CSVDataState {
  cleanedData: CleanedRow[];
  preprocessingReport: PreprocessingReport | null;
  isDataReady: boolean;
  setCleanedData: (data: CleanedRow[]) => void;
  setPreprocessingReport: (report: PreprocessingReport) => void;
  clearData: () => void;
}

export const useCSVDataStore = create<CSVDataState>((set) => ({
  cleanedData: [],
  preprocessingReport: null,
  isDataReady: false,
  setCleanedData: (data) => set({ 
    cleanedData: data, 
    isDataReady: data.length > 0 
  }),
  setPreprocessingReport: (report) => set({ preprocessingReport: report }),
  clearData: () => set({ 
    cleanedData: [], 
    preprocessingReport: null, 
    isDataReady: false 
  }),
}));
