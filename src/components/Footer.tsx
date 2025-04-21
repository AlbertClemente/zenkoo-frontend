import { Container, Text, Group, Anchor } from '@mantine/core';

export default function AppFooter() {
  return (
    <footer style={{ padding: '2rem 0', borderTop: '1px solid #2e2e2e' }}>
      <Container size="lg">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} Zenkoo — The Smart Saving App
          </Text>

          <Group gap="md">
            <Anchor href="/privacy" size="sm" c="dimmed" underline="hover">
              Privacidad
            </Anchor>
            <Anchor href="/terms" size="sm" c="dimmed" underline="hover">
              Términos
            </Anchor>
            <Anchor href="/contact" size="sm" c="dimmed" underline="hover">
              Contacto
            </Anchor>
          </Group>

          <Text size="xs" c="dimmed">
            Hecho con 💚 por Albert Clemente Subirón 🤩✌🏻
          </Text>
        </Group>
      </Container>
    </footer>
  );
}