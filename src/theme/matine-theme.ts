import { createTheme } from '@mantine/core';

export const zenkooTheme = (colorScheme: 'light' | 'dark') =>
  createTheme({
    colors: {
      zenkoo: [
        '#e3f2ec', '#c3e6d7', '#96d4b8', '#6fc89f', '#47bd86',
        '#1faf6e', '#189d63', '#138552', '#0e6c42', '#094f30',
      ],
      zenkooBlue: [
        '#e1f0ff', '#b8dcff', '#8ec7ff', '#61b1ff', '#3a9bff',
        '#177fe6', '#1166b8', '#0c4e8a', '#08375e', '#042132',
      ],
      zenkooRed: [
        '#fff0f0', '#ffd6d6', '#ffaaaa', '#ff7d7d', '#ff5050',
        '#e63946', '#cc2f3a', '#a7262f', '#871d24', '#611418',
      ],
      zenkooYellow: [
        '#fff9e5', '#ffefb2', '#ffe57f', '#ffdc4c', '#ffd21a',
        '#f9c900', '#c7a500', '#947f00', '#625800', '#3a3300',
      ],
      zenkooViolet: [
        '#f3ecff', '#e0d0ff', '#c4a8ff', '#a97fff', '#8f55ff',
        '#7232e6', '#5c29b8', '#471f8a', '#33165e', '#1f0c32',
      ],
    },
    primaryColor: 'zenkoo',
    primaryShade: colorScheme === 'dark' ? 7 : 5,
    fontFamily: 'Inter, sans-serif',
    defaultRadius: 'md',
    black: '#121212',     // más suave que el negro puro
    white: '#fafafa',     // blanco cálido para fondo
  });