'use client';

import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Group, Loader, Divider} from '@mantine/core';
import { IconPigMoney, IconArrowRight, IconCheck, IconX, IconEdit, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';

import DrawerSavingGoal from '@/components/SavingGoalDrawer';
import { SavingGoalsPreview } from '@/components/SavingGoalsPreview';
import { SavingGoal, deleteSavingGoal } from '@/lib/savinggoals';

import UserCalendarSection from '@/components/UserCalendarSection';
import MonthlyPlanCard from '@/components/MonthlyPlanCard';
import MonthlyPlanDrawer from '@/components/MonthlyPlanDrawer';

//Hooks
import useMonthlyPlan from '@/hooks/useMonthlyPlan';
import { useSavingGoals } from '@/hooks/useSavingGoals';
import useCalendarTransactions from '@/hooks/useCalendarTransactions';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data, loading: loadingMonthlyPlan, refetch: refetchMonthlyPlan } = useMonthlyPlan();
  const [monthlyPlanDrawerOpened, setMonthlyPlanDrawerOpened] = useState(false);

  const { savingGoals, loading: loadingSavingGoals, refetch: refetchSavingGoals } = useSavingGoals();
  const [savingGoalDrawerOpened, setSavingGoalDrawerOpened] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingGoal | null>(null);

  const { transactions, loading: loadingCalendar, refetch: refetchCalendar } = useCalendarTransactions();

  

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleNewGoal = () => {
    setGoalToEdit(null);
    setSavingGoalDrawerOpened(true);
  };

  const handleEditGoal = (goal: SavingGoal) => {
    setGoalToEdit(goal);
    setSavingGoalDrawerOpened(true);
  };

  const handleSavingGoalDrawerClose = () => {
    setSavingGoalDrawerOpened(false);
    setGoalToEdit(null);
  };

  const handleSavingGoalDrawerSuccess = () => {
    refetchSavingGoals();
    handleSavingGoalDrawerClose();
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
          refetchSavingGoals();
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
          <Title order={2}>Hola, {user?.first_name || 'Usuario'} 👋</Title>
          <Text mt="md">Bienvenido a tu panel de control Zenkoo.</Text>
        </div>
      </Group>

      <MonthlyPlanCard />

      <Group justify="flex-end" mt="xs">
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => setMonthlyPlanDrawerOpened(true)}
          variant="zenkoo"
        >
          Editar plan
        </Button>
      </Group>

      <Title order={3} mt="xl" mb="sm">
        Resumen de movimientos 
      </Title>

      {loadingCalendar ? (
        <Loader color="zenkoo" />
      ) : (
        <UserCalendarSection data={transactions} />
      )}

      <Divider my="xl" />

      <Title order={3} mt="xl" mb="sm">
        Tus metas de ahorro activas
      </Title>

      {loadingSavingGoals ? (
        <Loader color="zenkoo" />
      ) : (
        <>
          <SavingGoalsPreview
            savingGoals={savingGoals}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
          />

          <Group justify="flex-end" mt="xs" mb="md">
            <Button
              component={Link}
              href="/saving-goals"
              variant="light"
              color="zenkoo"
              leftSection={<IconPigMoney size={16} />}
              rightSection={<IconArrowRight size={16} />}
            >
              Ver todas las metas
            </Button>

            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleNewGoal}
              color="zenkoo"
            >
              Nueva meta de ahorro
            </Button>
          </Group>
        </>
      )}

      <DrawerSavingGoal
        opened={savingGoalDrawerOpened}
        onClose={handleSavingGoalDrawerClose}
        onSuccess={handleSavingGoalDrawerSuccess}
        savingGoalToEdit={goalToEdit}
      />

      <MonthlyPlanDrawer
        opened={monthlyPlanDrawerOpened}
        onClose={() => setMonthlyPlanDrawerOpened(false)}
        onSuccess={() => {
          setMonthlyPlanDrawerOpened(false);
          refetchMonthlyPlan();
        }}
      />
    </Container>
  );
}
