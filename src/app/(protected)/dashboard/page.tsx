'use client';

import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Container, Title, Text, Button, Group, Loader, Divider, Blockquote, Transition, Box} from '@mantine/core';
import { IconPigMoney, IconArrowRight, IconCheck, IconX, IconEdit, IconPlus, IconTipJar } from '@tabler/icons-react';
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

  const [reloadKey, setReloadKey] = useState(0);

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

  const motivationalPhrases = [
    'Cada euro cuenta. ¡No subestimes el poder del ahorro!',
    'El mejor momento para empezar a ahorrar fue ayer. El segundo mejor momento es hoy.',
    'Ahorrar no es renunciar, es priorizar.',
    'Pequeños hábitos crean grandes resultados.',
    'Controlar tus finanzas es controlar tu libertad.',
    'Hoy te cuesta, mañana te lo agradeces.',
    'El ahorro es la base de tus sueños.',
    'No se trata de cuánto ganas, sino de cuánto conservas.',
    'Tus decisiones de hoy definen tu tranquilidad de mañana.',
    'La constancia vence al impulso. ¡Sigue así!'
  ];

  const randomPhrase = useMemo(() => {
    const index = Math.floor(Math.random() * motivationalPhrases.length);
    return motivationalPhrases[index];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return null;

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Hola, {user?.first_name || 'Usuario'} 👋</Title>
          <Text mt="md">Bienvenido a tu panel de control Zenkoo.</Text>
        </div>
      </Group>

      <Transition mounted={!!randomPhrase} transition="fade" duration={400} timingFunction="ease-out">

        {(styles) => (
          <Blockquote
            style={styles}
            color="zenkooBlue"
            cite="– Zenkoo Team"
            icon={<IconTipJar size={24} />}
            mt="xl"
            mb="xl"
          >
            {randomPhrase}
          </Blockquote>
        )}
      </Transition>

      <MonthlyPlanCard reloadKey={reloadKey} />

      <Group justify="flex-end" mt="xs">
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => setMonthlyPlanDrawerOpened(true)}
          variant="zenkoo"
        >
          Actualizar resumen mensual
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
        <Box mb={{ base: 120, sm: 'xl' }}>
          <SavingGoalsPreview
            savingGoals={savingGoals}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
          />

          <Group justify="flex-end" mt="xs" mb="xl">
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
        </Box>
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
          setReloadKey((prev) => prev + 1);
        }}
      />
    </Container>
  );
}
