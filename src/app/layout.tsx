import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zenkoo - The Smart Saving App',
  description: 'App de ahorro personal basada en el método Kakeibo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mantine-color-scheme="auto">
      <head></head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}