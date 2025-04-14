'use client';

import {
  Stack,
  Loader,
  Text,
  Pagination,
  Center,
  SegmentedControl,
  Group,
  Button,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  getSavingGoals,
  SavingGoal,
  deleteSavingGoal,
} from '@/lib/savinggoals';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconPigMoney, IconX } from '@tabler/icons-react';
import { SavingGoalCard } from './SavingGoalCard';
import SavingGoalDrawer from './SavingGoalDrawer';

const ITEMS_PER_PAGE = 6;

export default function SavingGoalsList() {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGoalToEdit, setSavingGoalToEdit] = useState<SavingGoal | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await getSavingGoals();
      setSavingGoals(data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal: SavingGoal) => {
    setSavingGoalToEdit(goal);
    setDrawerOpened(true);
  };

  const handleNew = () => {
    setSavingGoalToEdit(null);
    setDrawerOpened(true);
  };

  const handleDelete = (id: string) => {
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
            message: 'Se eliminó correctamente',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
          fetchGoals();
        } catch (err) {
          showNotification({
            title: 'Error',
            message: 'No se pudo eliminar',
            color: 'zenkooRed',
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  const filteredGoals =
    filter === 'all'
      ? savingGoals
      : savingGoals.filter((goal) => goal.status === filter);

  const totalPages = Math.ceil(filteredGoals.length / ITEMS_PER_PAGE);
  const paginatedGoals = filteredGoals.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1); // reset page when filter changes
  }, [filter]);

  if (loading) return <Loader color="zenkoo" />;

  return (
    <>
      <Group justify="space-between" mt="md" mb="lg">
        <SegmentedControl
          value={filter}
          onChange={(value) =>
            setFilter(value as 'all' | 'active' | 'paused' | 'completed')
          }
          data={[
            { label: 'Todas', value: 'all' },
            { label: 'Activas', value: 'active' },
            { label: 'Pausadas', value: 'paused' },
            { label: 'Completadas', value: 'completed' },
          ]}
          color="zenkoo"
        />

        <Button
          leftSection={<IconPigMoney size={16} />}
          color="zenkooBlue"
          onClick={handleNew}
        >
          Nueva meta
        </Button>
      </Group>

      {filteredGoals.length === 0 ? (
        <Text c="dimmed" ta="center">
          No hay metas en este estado 🐷
        </Text>
      ) : (
        <>
          <Stack>
            {paginatedGoals.map((goal) => (
              <SavingGoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal.id)}
              />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Center mt="md">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                color="zenkoo"
              />
            </Center>
          )}
        </>
      )}

      <SavingGoalDrawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
          setSavingGoalToEdit(null);
        }}
        onSuccess={() => {
          fetchGoals();
          setDrawerOpened(false);
          setSavingGoalToEdit(null);
        }}
        savingGoalToEdit={savingGoalToEdit}
      />
    </>
  );
}
