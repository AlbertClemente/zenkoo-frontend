'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Loader,
} from '@mantine/core';
import { IconPigMoney, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import DrawerSavingGoal from '@/components/SavingGoalDrawer';
import { SavingGoalsPreview } from '@/components/SavingGoalsPreview';
import { SavingGoal, getSavingGoals, deleteSavingGoal } from '@/lib/savinggoals';
import Link from 'next/link';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';

import useCalendarTransactions from '@/hooks/useCalendarTransactions';
import UserCalendarSection from '@/components/UserCalendarSection';


export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalToEdit, setGoalToEdit] = useState<SavingGoal | null>(null);

  const { transactions, loading: loadingCalendar } = useCalendarTransactions();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  const fetchSavingGoals = async () => {
    setLoading(true);
    try {
      const data = await getSavingGoals(1, 'active');
      setSavingGoals(data.results); 
    } finally {
      setLoading(false);
    }
  };

  const handleNewGoal = () => {
    setGoalToEdit(null);
    setDrawerOpened(true);
  };

  const handleEditGoal = (goal: SavingGoal) => {
    setGoalToEdit(goal);
    setDrawerOpened(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpened(false);
    setGoalToEdit(null);
  };

  const handleDrawerSuccess = () => {
    fetchSavingGoals();
    handleDrawerClose();
  };

  const handleDeleteGoal = (id: string) => {
    modals.openConfirmModal({
      title: '¿Eliminar meta de ahorro?',
      centered: true,
      children: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'zenkooRed' },
      onConfirm: async () => {
        try {
          await deleteSavingGoal(id);
          showNotification({
            title: 'Meta eliminada',
            message: 'La meta se ha borrado correctamente',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
          fetchSavingGoals();
        } catch (err) {
          showNotification({
            title: 'Error',
            message: 'No se pudo eliminar la meta',
            color: 'zenkooRed',
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  if (!isAuthenticated) return null;

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Hola, {user.first_name || user.email} 👋</Title>
          <Text mt="md">Bienvenido a tu panel de control Zenkoo.</Text>
        </div>
        <Button
          leftSection={<IconPigMoney size={16} />}
          onClick={handleNewGoal}
          color="zenkooBlue"
        >
          Nueva meta de ahorro
        </Button>
      </Group>

      <Title order={3} mt="xl" mb="sm">
        Tus metas activas
      </Title>

      {loading ? (
        <Loader color="zenkoo" />
      ) : (
        <>
          <SavingGoalsPreview
            savingGoals={savingGoals}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
          />

          <Group justify="flex-end" mt="xs">
            <Button
              component={Link}
              href="/saving-goals"
              variant="subtle"
              color="zenkooBlue"
              rightSection={<IconArrowRight size={16} />}
            >
              Ver todas las metas
            </Button>
          </Group>
        </>
      )}

      <Title order={3} mt="xl" mb="sm">
        Resumen del mes
      </Title>

      {loadingCalendar ? (
        <Loader color="zenkoo" />
      ) : (
        <UserCalendarSection data={transactions} />
      )}

      <DrawerSavingGoal
        opened={drawerOpened}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        savingGoalToEdit={goalToEdit}
      />
    </Container>
  );
}
