'use client';

import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
  data: {
    siswa: any[];
    kelas: any[];
    tujuanPembelajaran: any[];
    penilaianSumatif: any[];
  };
  activeSemester: any;
  updatePenilaianSumatif: (data: any) => Promise<void>;
  savePenilaianSumatifBatch: (data: any[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data] = useState({
    siswa: [],
    kelas: [],
    tujuanPembelajaran: [],
    penilaianSumatif: []
  });
  
  const [activeSemester] = useState({ id: 'sem-1', isAktif: true });

  const updatePenilaianSumatif = async (data: any) => {};
  const savePenilaianSumatifBatch = async (data: any[]) => {};

  return (
    <DataContext.Provider value={{ data, activeSemester, updatePenilaianSumatif, savePenilaianSumatifBatch }}>
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
