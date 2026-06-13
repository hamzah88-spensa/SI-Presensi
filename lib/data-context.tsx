'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextType {
  data: any;
  activeSemester: any;
  isLoaded?: boolean;
  [key: string]: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export interface Agenda {
  id?: string;
  [key: string]: any;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data] = useState({
    siswa: [],
    kelas: [],
    tujuanPembelajaran: [],
    penilaianSumatif: [],
    penilaianFormatif: [],
    jurnal: [],
    agendas: [],
    kehadiran: [],
    semesters: [],
    remedialProgram: [],
    sumatifAkhir: [],
  });
  
  const [activeSemester] = useState({ id: 'sem-1', isAktif: true });

  const updatePenilaianSumatif = async (data: any) => {};
  const savePenilaianSumatifBatch = async (data: any[]) => {};
  const saveSumatifAkhirBatch = async (dataToSave: any[]) => {
    // Modify existing data directly for now in mock since we don't have setData directly exposed unless we recreate it?
    // Oh wait, data is from useState: const [data] = useState(...)
    // So usually we'd need setData.
  };

  return (
    <DataContext.Provider value={{ data, activeSemester, updatePenilaianSumatif, savePenilaianSumatifBatch, saveSumatifAkhirBatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
