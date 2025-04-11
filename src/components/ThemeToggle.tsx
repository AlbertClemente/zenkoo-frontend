'use client';

import { ActionIcon, Tooltip, rem } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Añadir una clase animada solo justo al hacer clic
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (animating) {
      const timeout = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [animating]);

  const handleClick = () => {
    setAnimating(true);
    toggleColorScheme();
  };

  return (
    <Tooltip label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`} withArrow>
      <ActionIcon
        onClick={handleClick}
        size="lg"
        radius="xl"
        variant="default"
        aria-label="Toggle theme"
        className={animating ? 'theme-toggle-animating' : ''}
        style={{
          transition: 'transform 0.3s ease',
        }}
      >
        <span style={{ display: 'grid', placeItems: 'center' }}>
          {isDark ? (
            <IconSun
              style={{
                width: rem(20),
                height: rem(20),
                transition: 'opacity 0.3s ease',
              }}
            />
          ) : (
            <IconMoonStars
              style={{
                width: rem(20),
                height: rem(20),
                transition: 'opacity 0.3s ease',
              }}
            />
          )}
        </span>
      </ActionIcon>
    </Tooltip>
  );
}
