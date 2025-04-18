import { useDisclosure } from '@mantine/hooks';
import { Popover, Stack, Box, Text, ActionIcon, rem } from '@mantine/core';
import { IconInfoSquareRounded } from '@tabler/icons-react';

export default function CalendarCaption() {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Popover width={200} position="bottom-start" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <ActionIcon onMouseEnter={open} onMouseLeave={close} variant="light" aria-label="Calendar Caption">
          <IconInfoSquareRounded style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
        <Stack gap={6} mt="md" mb={'md'}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkoo" style={{ borderRadius: '50%' }} />
            <Text size="xs">Ingreso</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkooRed" style={{ borderRadius: '50%' }} />
            <Text size="xs">Gasto</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="gold" style={{ borderRadius: rem(2) }} />
            <Text size="xs">Meta activa</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkooBlue" style={{ borderRadius: '50%' }} />
            <Text size="xs">Inicio de mes</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box w={10} h={10} bg="zenkooViolet" style={{ borderRadius: '50%' }} />
            <Text size="xs">Fin de mes</Text>
          </Box>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}