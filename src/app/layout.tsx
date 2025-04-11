// layout.tsx
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Zenkoo - The Smart Saving App',
  description: 'App de ahorro personal basada en el método Kakeibo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}