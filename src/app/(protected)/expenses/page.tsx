'use client';

import { useEffect, useState } from 'react';
import { Button, Container, Group, Table, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { getExpenses, Expense, deleteExpense } from '@/lib/expenses';
import dayjs from 'dayjs';
import ExpenseDrawer from '@/components/ExpenseDrawer';

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash, IconCheck, IconX } from '@tabler/icons-react';

import { modals } from '@mantine/modals';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (error) {
        console.error('Error al obtener fastos', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, []);

  const handleEdit = (expense: Expense) => {
    console.log('Editar gasto:', expense);
    setExpenseToEdit(expense);
    setDrawerOpened(true);
  };

  const handleDelete = (id: string) => {
    console.log('Gasto a eliminar:', id);
    modals.openConfirmModal({
      title: '¿Eliminar gasto?',
      centered: true,
      children: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'zenkooRed' },
      onConfirm: async () => {
        try {
          await deleteExpense(id);

          showNotification({
            title: 'Gasto eliminado',
            message: 'El gasto se eliminó correctamente',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
          
          setLoading(true);
          getExpenses().then(setExpenses).finally(() => setLoading(false));

        } catch (error) {
          showNotification({
            title: 'Error',
            message: 'No se pudo eliminar el gasto',
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
        <Title order={2}>Gastos</Title>
        <Button onClick={() => {
          setExpenseToEdit(null);
          setDrawerOpened(true);
        }}>
          + Nuevo gasto
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Fecha</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th>Categoría</Table.Th>
            <Table.Th>Importe</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {expenses.map((expense) => (
            <Table.Tr key={expense.id}>
              <Table.Td>{dayjs(expense.date).format('DD/MM/YYYY')}</Table.Td>
              <Table.Td>{expense.type}</Table.Td>
              <Table.Td>{expense.category}</Table.Td>
              <Table.Td>{parseFloat(expense.amount.toString()).toFixed(2)} €</Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <Tooltip label="Editar">
                    <ActionIcon variant="subtle" color="zenkooBlue" onClick={() => handleEdit(expense)}>
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Eliminar">
                    <ActionIcon variant="subtle" color="zenkooRed" onClick={() => handleDelete(expense.id)}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {expenses.length === 0 && !loading && (
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                No hay gastos registrados.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      
      <ExpenseDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        onSuccess={() => {
          setLoading(true);
          getExpenses().then(setExpenses).finally(() => setLoading(false));
        }}
        expenseToEdit={expenseToEdit}
      />
    </Container>
  );
}