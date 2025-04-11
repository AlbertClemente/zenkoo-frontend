'use client';

import { useEffect, useState } from 'react';
import { Button, Container, Group, Table, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { getIncomes, Income } from '@/lib/incomes';
import dayjs from 'dayjs';
import IncomeDrawer from '@/components/IncomeDrawer';

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash, IconCheck, IconX } from '@tabler/icons-react';

import { modals } from '@mantine/modals';
import { deleteIncome } from '@/lib/incomes';

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

  useEffect(() => {
    async function fetchIncomes() {
      try {
        const data = await getIncomes();
        setIncomes(data);
      } catch (error) {
        console.error('Error al obtener ingresos', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIncomes();
  }, []);

  const handleEdit = (income: Income) => {
    console.log('Editar ingreso:', income);
    setIncomeToEdit(income);
    setDrawerOpened(true);
  };
  
  const handleDelete = (id: string) => {
    console.log('Ingreso a eliminar:', id);
    modals.openConfirmModal({
      title: '¿Eliminar ingreso?',
      centered: true,
      children: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteIncome(id);
          showNotification({
            title: 'Ingreso eliminado',
            message: 'El ingreso se eliminó correctamente',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
          setLoading(true);
          getIncomes().then(setIncomes).finally(() => setLoading(false));
        } catch (error) {
          showNotification({
            title: 'Error',
            message: 'No se pudo eliminar el ingreso',
            color: 'zenkooRed',
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Ingresos</Title>
        <Button onClick={() => {
          setIncomeToEdit(null);
          setDrawerOpened(true);
        }}>
          + Nuevo ingreso
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Fecha</Table.Th>
            <Table.Th>Categoría</Table.Th>
            <Table.Th>Importe</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {incomes.map((income) => (
            <Table.Tr key={income.id}>
              <Table.Td>{dayjs(income.date).format('DD/MM/YYYY')}</Table.Td>
              <Table.Td>{income.type}</Table.Td>
              <Table.Td>{parseFloat(income.amount.toString()).toFixed(2)} €</Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <Tooltip label="Editar">
                    <ActionIcon variant="subtle" color="zenkooBlue" onClick={() => handleEdit(income)}>
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Eliminar">
                    <ActionIcon variant="subtle" color="zenkooRed" onClick={() => handleDelete(income.id)}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {incomes.length === 0 && !loading && (
            <Table.Tr>
              <Table.Td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>
                No hay ingresos registrados.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      <IncomeDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        onSuccess={() => {
          setLoading(true);
          getIncomes().then(setIncomes).finally(() => setLoading(false));
        }}
        incomeToEdit={incomeToEdit}
      />
    </Container>
  );
}