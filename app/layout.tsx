import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/lib/data-context';
import { Toaster } from 'sonner';
import { AutoLogout } from '@/components/AutoLogout';

export const metadata: Metadata = {
  title: 'Sistem Kehadiran & Penilaian',
  description: 'Aplikasi pencatatan kehadiran dan penilaian siswa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased font-sans">
        <DataProvider>
          <Toaster position="top-right" richColors closeButton />
          <AutoLogout />
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
