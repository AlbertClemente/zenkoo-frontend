'use client';

import { useEffect, useState } from 'react';
import { SavingGoal, getSavingGoals, updateSavingGoal, deleteSavingGoal } from '@/lib/savinggoals';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { SavingGoalCard } from './SavingGoalCard';
import SavingGoalDrawer from './SavingGoalDrawer';
import { Button, SegmentedControl, Group, Card, Pagination, Text, Stack, Select } from '@mantine/core';
import { Plus } from 'lucide-react';

export default function SavingGoalsList() {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingGoalToEdit, setSavingGoalToEdit] = useState<SavingGoal | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Cambié el valor a 5 para que sea consistente con PAGE_SIZE por defecto
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  // Calculamos el número total de páginas usando el count y pageSize
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await getSavingGoals(page, filter, pageSize);
      setSavingGoals(data.results);
      setCount(data.count);
    } catch (error) {
      console.error(error);
      showNotification({
        title: 'Error',
        message: 'No se ha podido obtener las metas de ahorro',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      try {
        // ⚠️ Seguridad: forzar página 1 si se detecta que la actual es inválida
        const data = await getSavingGoals(page, filter, pageSize);
  
        // Si page es mayor que el total, lo corregimos
        const newTotalPages = Math.max(1, Math.ceil(data.count / pageSize));
        if (page > newTotalPages) {
          setPage(1);
          return; // Previene cargar metas con página incorrecta
        }
  
        setSavingGoals(data.results);
        setCount(data.count);
      } catch (error) {
        console.error(error);
        showNotification({
          title: 'Error',
          message: 'No se ha podido obtener las metas de ahorro',
          color: 'zenkooRed',
          icon: <IconX size={16} />,
        });
      } finally {
        setLoading(false);
      }
    };
  
    loadGoals();
  }, [page, filter, pageSize]);

  const handleMarkCompleted = async (goalId: string) => {
    try {
      const goal = savingGoals.find(g => g.id === goalId);

      if (!goal) {
        showNotification({
          title: 'Error',
          message: 'Meta no encontrada.',
          color: 'zenkooRed',
          icon: <IconX size={16} />,
        });
        return;
      }

      await updateSavingGoal(goalId, {
        ...goal,
        status: 'completed',
      });

      showNotification({
        title: 'Meta completada',
        message: '¡Felicidades! Has alcanzado tu objetivo de ahorro.',
        color: 'zenkoo',
        icon: <IconCheck size={16} />,
      });

      fetchGoals(); // Actualizamos la lista de metas
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'No se pudo marcar la meta como completada.',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
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
      
          const newCount = count - 1;
          const newTotalPages = Math.max(1, Math.ceil(newCount / pageSize));
          const newPage = page > newTotalPages ? newTotalPages : page;
      
          setPage(newPage); // Actualiza la página si es necesario
          setCount(newCount); // También puedes mantener el count actualizado
      
          showNotification({
            title: 'Meta eliminada',
            message: 'Se eliminó correctamente la meta',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
      
          fetchGoals(); // Vuelve a cargar las metas
        } catch (err) {
          showNotification({
            title: 'Error',
            message: 'No se pudo eliminar la meta',
            color: 'zenkooRed',
            icon: <IconX size={16} />,
          });
        }
      }
    });
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <>
      <Group justify="space-between" mt="md" mb="lg" align="center">
        <SegmentedControl
          value={filter}
          onChange={(value) => {
            setFilter(value as 'all' | 'active' | 'paused' | 'completed');
            setPage(1); // forzamos a página 1 con cada filtrado
          }}
          data={[
            { label: 'Todas', value: 'all' },
            { label: 'Activas', value: 'active' },
            { label: 'Pausadas', value: 'paused' },
            { label: 'Completadas', value: 'completed' },
          ]}
        />

        <Group justify="space-between" style={{ alignItems: 'center', display: 'flex' }}>
          <Select
            value={pageSize.toString()}
            onChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
            data={[
              { value: '5', label: '5 por página' },
              { value: '10', label: '10 por página' },
              { value: '20', label: '20 por página' },
            ]}
            style={{ minWidth: '100px' }} // Asegura que el select no se estire demasiado
          />
          <Button onClick={handleNew} leftSection={<Plus size={16} />}>
            Nueva meta
          </Button>
        </Group>
      </Group>

      {savingGoals.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="md" c="dimmed">
            No hay metas en este estado 🐷
          </Text>
        </Card>
      ) : (
        <>
          <Stack>
            {savingGoals.map((goal) => (
              <SavingGoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal.id)}
                onMarkCompleted={handleMarkCompleted} // Pasamos la función de marcar como completada
              />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                color="zenkoo"
              />
            </Group>
          )}
        </>
      )}

      <SavingGoalDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
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
