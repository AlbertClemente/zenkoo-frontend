'use client';

import { useEffect, useState } from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importamos el locale para España, override a US
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { zenkooTheme } from '@/theme/matine-theme';

dayjs.locale('es'); //Aplica el idioma español para fechas

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detecta el colorScheme guardado en localStorage al montar
    const stored = localStorage.getItem('mantine-color-scheme') as 'light' | 'dark' | null;
    setColorScheme(stored || 'light');
    setMounted(true);
  }, []);

  const toggleColorScheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    localStorage.setItem('mantine-color-scheme', next);
  };

  if (!mounted) return null; // Evita render hasta que el cliente esté listo

  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider 
        defaultColorScheme="light" 
        forceColorScheme={colorScheme} 
        theme={zenkooTheme(colorScheme)}
        >
          {/* Lunes como primer día, formato europeo */}
          <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
            <ModalsProvider>
              <Notifications position="top-right" zIndex={2077} />
              {/* Pasamos toggle y colorScheme por contexto si se necesita */}
              <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
                {children}
              </ThemeContext.Provider>
            </ModalsProvider>
          </DatesProvider>
      </MantineProvider>
    </>
  );
}

import { createContext, useContext } from 'react';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  toggleColorScheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);