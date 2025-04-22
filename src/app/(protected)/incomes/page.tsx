'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Container, Group, Table, Title, Select, Pagination, Loader, ActionIcon, Tooltip, Badge, ScrollArea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { getIncomes, Income, deleteIncome } from '@/lib/incomes';
import dayjs from 'dayjs';
import IncomeDrawer from '@/components/IncomeDrawer';
import { IconCheck, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { DatePickerInput } from '@mantine/dates';
import { Pencil, Plus, Trash } from 'lucide-react';

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [count, setCount] = useState(0);


  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const typeColors: Record<string, string> = {
    'Sueldo': 'zenkoo',
    'Extra': 'zenkooYellow',
    'Regalo': 'zenkooRed',
    'Venta': 'zenkooBlue',
    'Otros': 'zenkooViolet',
    'Desconocido': 'dark',
  };

  const fetchIncomes = useCallback(async () => {
    try {
      // ⚠️ Seguridad: forzar página 1 si se detecta que la actual es inválida
      const data = await getIncomes(
        page,
        startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
        endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined,
        pageSize
      );

      // Si page es mayor que el total, lo corregimos
      const newTotalPages = Math.max(1, Math.ceil(data.count / pageSize));

      if (page > newTotalPages) {
        setPage(1);
        return;
      }

      setIncomes(data.results);
      setCount(data.count);
    } catch (error) {
      console.error('Error al obtener ingresos', error);
      showNotification({
        title: 'Error',
        message: 'Error al obtener ingresos',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, pageSize]);

  useEffect(() => {
    fetchIncomes();
  }, [page, pageSize, startDate, endDate, fetchIncomes]);

  const handleEdit = (income: Income) => {
    setIncomeToEdit(income);
    setDrawerOpened(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: '¿Eliminar ingreso?',
      centered: true,
      children: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'zenkooRed' },
      onConfirm: async () => {
        try {
          await deleteIncome(id);
          showNotification({
            title: 'Ingreso eliminado',
            message: 'El ingreso se eliminó correctamente',
            color: 'zenkoo',
            icon: <IconCheck size={16} />,
          });
          fetchIncomes();
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
        <Button 
          onClick={() => {
          setIncomeToEdit(null);
          setDrawerOpened(true);
          }}
          leftSection={<Plus size={16} />}
        >
          Nuevo ingreso
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
          <ScrollArea>
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
                {incomes.map((income) => {
                const typeName = income.type ?? 'Desconocido';
                const badgeColor = typeColors[typeName] || 'grape';

                return (
                  <Table.Tr key={income.id}>
                    <Table.Td>{dayjs(income.date).format('DD/MM/YYYY')}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={badgeColor}>
                        {typeName}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{parseFloat(income.amount.toString()).toFixed(2)} €</Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Tooltip label="Editar">
                          <ActionIcon variant="subtle" color="zenkooBlue" onClick={() => handleEdit(income)} aria-label="Modificar ingreso">
                            <Pencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar">
                          <ActionIcon variant="subtle" color="zenkooRed" onClick={() => handleDelete(income.id)} aria-label="Eliminar ingreso" >
                            <Trash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )})}
                {incomes.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>
                      No hay ingresos registrados.
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
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

      <IncomeDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        onSuccess={() => {
          fetchIncomes();
          setDrawerOpened(false);
          setIncomeToEdit(null);
        }}
        incomeToEdit={incomeToEdit}
      />
    </Container>
  );
}
