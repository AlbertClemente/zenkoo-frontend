import { createTheme } from '@mantine/core';

export const zenkooTheme = (colorScheme: 'light' | 'dark') =>
  createTheme({
    colors: {
      zenkoo: [
        '#F5FCFB', // 0
        '#E9F7F4', // 1
        '#CCF0E6', // 2
        '#ACE6D2', // 3
        '#77D1AD', // 4
        '#47bd86', // 5 → color base
        '#3AAB72', // 6
        '#278C56', // 7
        '#1A703F', // 8
        '#0E5429'  // 9
      ],
      zenkooBlue: [
        '#F5FCFC', // 0
        '#E9F7F7', // 1
        '#CCEEF0', // 2
        '#ACE3E6', // 3
        '#77CDD1', // 4
        '#47b5bd', // 5 ← tono base
        '#3A9EAB', // 6
        '#277A8C', // 7
        '#1A5B70', // 8
        '#0E3E54'  // 9
      ],
      zenkooRed: [
        '#FFFBF7', // 0
        '#FFF5ED', // 1
        '#FFE4D4', // 2
        '#FFCDB8', // 3
        '#FF9785', // 4
        '#ff5050', // 5 ← tono base
        '#E64040', // 6
        '#BF2C2C', // 7
        '#991D1D', // 8
        '#731010'  // 9
      ],
      zenkooYellow: [
        '#FFFDF5', // 0
        '#FFFBE8', // 1
        '#FFF4C7', // 2
        '#FFEBA3', // 3
        '#FFD45E', // 4
        '#ffb61a', // 5 ← tono base
        '#E69C15', // 6
        '#BF780D', // 7
        '#995809', // 8
        '#733C05'  // 9
      ],
      zenkooViolet: [
        '#FCF7FF', // 0
        '#FAF2FF', // 1
        '#F0DBFF', // 2
        '#E5C7FF', // 3
        '#C89EFF', // 4
        '#A272FF', // 5 ← tono base
        '#895EE6', // 6
        '#6741BF', // 7
        '#472999', // 8
        '#2E1773'  // 9
      ],
      dark: [
        '#C0C1C4', // 0
        '#6D6F74', // 1
        '#595B5F', // 2
        '#45474A', // 3
        '#313335', // 4
        '#18191a', // 5 ← base
        '#131517', // 6
        '#0C0F12', // 7
        '#080B0F', // 8
        '#04060A', // 9
      ],
    },
    primaryColor: 'zenkoo',
    primaryShade: colorScheme === 'dark' ? 6 : 5,
    fontFamily: 'Inter, sans-serif',
    defaultRadius: 'md',
    black: '#121212',     // más suave que el negro puro
    white: '#fafafa',     // blanco cálido para fondo
  });
