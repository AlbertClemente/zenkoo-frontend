'use client';

import { useEffect, useState } from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

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
        theme={{
          colors: {
            zenkoo: [
              '#e3f2ec', // 0 - fondo general
              '#c3e6d7', // 1 - fondo resaltado
              '#96d4b8', // 2 - botones desactivados / outline
              '#6fc89f', // 3 - texto sobre blanco / hover claro
              '#47bd86', // 4 - botón primario claro
              '#1faf6e', // 5 - color principal
              '#189d63',
              '#138552',
              '#0e6c42',
              '#094f30', // 9 - texto sobre fondo oscuro
            ],
            zenkooBlue: [
              '#e1f0ff', // 0 - fondo informativo
              '#b8dcff',
              '#8ec7ff',
              '#61b1ff',
              '#3a9bff',
              '#177fe6', // 5 - azul accesible en dark
              '#1166b8',
              '#0c4e8a',
              '#08375e',
              '#042132'
            ],
            zenkooRed: [
              '#fff0f0', // 0 - fondo error claro
              '#ffd6d6',
              '#ffaaaa',
              '#ff7d7d',
              '#ff5050', // 4 - fondo alerta
              '#e63946', // 5 - botón error / texto blanco
              '#cc2f3a',
              '#a7262f',
              '#871d24',
              '#611418'  // 9 - fondo oscuro error
            ],
            zenkooYellow: [
              '#fff9e5', // 0 - fondo advertencia
              '#ffefb2',
              '#ffe57f',
              '#ffdc4c',
              '#ffd21a',
              '#f9c900', // 5 - amarillo mostaza base
              '#c7a500',
              '#947f00',
              '#625800',
              '#3a3300'
            ],
            zenkooViolet: [
              '#f3ecff', // 0 - fondo violeta claro
              '#e0d0ff',
              '#c4a8ff',
              '#a97fff',
              '#8f55ff',
              '#7232e6', // 5 - violeta base
              '#5c29b8',
              '#471f8a',
              '#33165e',
              '#1f0c32'
            ],
          },
          primaryColor: 'zenkoo',
          primaryShade: colorScheme === 'dark' ? 4 : 5,
          fontFamily: 'Inter, sans-serif',
          defaultRadius: 'md',
        }}>
          <Notifications />
          {/* Pasamos toggle y colorScheme por contexto si se necesita */}
          <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
            {children}
          </ThemeContext.Provider>
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