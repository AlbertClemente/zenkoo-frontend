// layout.tsx
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import type { Metadata } from 'next';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Zenkoo - The Smart Saving App',
  description: 'App de ahorro personal basada en el método Kakeibo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}