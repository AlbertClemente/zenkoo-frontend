'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Container, Group, Table, Title, Badge, ActionIcon, Tooltip, Select, Loader, Pagination } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { getExpenses, Expense, deleteExpense } from '@/lib/expenses';
import dayjs from 'dayjs';
import ExpenseDrawer from '@/components/ExpenseDrawer';
import { IconPencil, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { DatePickerInput } from '@mantine/dates';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [count, setCount] = useState(0);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const categoryColors: Record<string, string> = {
    'Supervivencia': 'zenkoo',
    'Ocio y vicio': 'zenkooYellow',
    'Cultura': 'zenkooViolet',
    'Extras': 'zenkooBlue',
    'Desconocido': 'gray',
  };

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenses(
        page,
        startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
        endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined,
        pageSize,
        categoryFilter || undefined
      );
      setExpenses(data.results);
      setCount(data.count);
    } catch (error) {
      console.error('Error al obtener gastos', error);
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, pageSize, categoryFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [page, pageSize, startDate, endDate, fetchExpenses]);

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
          
          fetchExpenses();
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

      <Group justify="space-between" mb="md">
        <DatePickerInput
          type="range"
          label="Filtrar por rango de fechas"
          value={[startDate, endDate]}
          onChange={([start, end]) => {
            setStartDate(start);
            setEndDate(end);
            setPage(1); // reset de página al aplicar nuevo filtro
          }}
          clearable
        />

        <Select
          label="Filtrar por tipo"
          placeholder="Todos"
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value || '');
            setPage(1); // reiniciar página si cambia el filtro
          }}
          data={[
            { label: 'Todos', value: '' },
            { label: 'Supervivencia', value: 'Supervivencia' },
            { label: 'Ocio y vicio', value: 'Ocio y vicio' },
            { label: 'Cultura', value: 'Cultura' },
            { label: 'Extras', value: 'Extras' },
          ]}
        />

        <Select
          label="Resultados por página"
          value={pageSize.toString()}
          onChange={(value) => {
            setPageSize(Number(value));
            setPage(1);
          }}
          data={['5', '10', '20', '50']}
        />
      </Group>
      
      {loading ? (
        <Loader color="zenkoo" />
      ) : (
        <>
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
              {expenses.map((expense) => {
                const categoryName = expense.category ?? 'Desconocido';
                const badgeColor = categoryColors[categoryName] || 'grape';

                return (
                  <Table.Tr key={expense.id}>
                    <Table.Td>{dayjs(expense.date).format('DD/MM/YYYY')}</Table.Td>
                    <Table.Td>{expense.type}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={badgeColor}>
                        {categoryName}
                      </Badge>  
                    </Table.Td>
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
                );
              })}
              {expenses.length === 0 && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                    No hay gastos registrados.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          {count > pageSize && (
            <Group justify="center" mt="md">
              <Pagination
                value={page}
                onChange={setPage}
                total={Math.ceil(count / pageSize)}
                color="zenkoo"
              />
            </Group>
          )}
        </>
      )}
      
      <ExpenseDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        onSuccess={() => {
          fetchExpenses();
          setDrawerOpened(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />
    </Container>
  );
}