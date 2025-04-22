'use client';

import { Drawer, TextInput, Button, Stack, NumberInput, Group, Badge, Text, Select, Alert, Tooltip, ActionIcon } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { createExpense, updateExpense } from '@/lib/expenses';
import { getCategories } from '@/lib/categories';

import type { Expense } from '@/lib/expenses';
import type { Category } from '@/lib/categories';

import { usePredictCategory } from '@/hooks/usePredictCategory';
import { Lightbulb, LightbulbIcon, Save } from 'lucide-react';


interface ExpenseDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null; //para cuando vayamos a editar un expense desde el drawer
}

export default function ExpenseDrawer({ opened, onClose, onSuccess, expenseToEdit }: ExpenseDrawerProps) {
  const [loading, setLoading] = useState(false);

  // IA
  const { suggestedCategory, predict, resetSuggestion } = usePredictCategory();

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.map((cat: Category) => ({
          label: cat.name,
          value: cat.name
        })));
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    fetchCategories();
  }, []);

  const form = useForm({
    initialValues: {
      amount: 0,
      date: new Date(),
      type: '',
      category: '',
    },
  });

  useEffect(() => {
    if (expenseToEdit) {
      form.setValues({
        amount: parseFloat(expenseToEdit.amount.toString()),
        date: new Date(expenseToEdit.date),
        type: expenseToEdit.type,
        category: expenseToEdit.category,
      });
    } else {
      form.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [expenseToEdit]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, {
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
          category: values.category
        });
        showNotification({
          title: 'Gasto actualizado',
          message: 'Los cambios se han guardado correctamente',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      } else {
        //Fallback: si el campo Categoría está vacío y hay sugerencia generada por IA, rellenamos la categoría con la sugerencia:
        if (values.category.trim() === '' && suggestedCategory) {
          values.category = suggestedCategory;
        }

        //Evitar que se envíe gasto sin categoríaz
        const payload = {
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
          // Solo incluimos categoría si no está vacía
          ...(values.category.trim() !== '' && { category: values.category }),
        };

        await createExpense(payload);

        showNotification({
          title: 'Gasto creado',
          message: 'El gasto se ha registrado correctamente',
          color: 'zenkoo',
          icon: <IconCheck size={16} />,
        });
      }
  
      form.reset();
      onClose();
      resetSuggestion();
      onSuccess();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'No se pudo guardar el gasto',
        color: 'zenkooRed',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!opened) {
      form.reset();
      resetSuggestion(); // Limpieza al cerrar también
    }
  }, [opened]);

  const icon = <LightbulbIcon />;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Nuevo gasto"
      padding="xl"
      size="sm"
      position="right"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <NumberInput
            label="Importe (€)"
            min={0}
            step={0.01}
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            hideControls
            {...form.getInputProps('amount')}
            required
          />
          <DateInput
            label="Fecha"
            placeholder="Selecciona una fecha"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps('date')}
            required
          />
          <TextInput
            label="Tipo de gasto"
            placeholder="Ej: Supermercado, Concierto, Cine, etc."
            {...form.getInputProps('type')}
            onBlur={(e) => {
              const value = e.target.value.trim();
          
              // Validación simple para evitar predicciones basura
              const isValid = value.length >= 3 && /[a-zA-Z]/.test(value);
          
              if (isValid) predict(value);
            }}
            required
          />
          {suggestedCategory && (
            <Alert variant="light" color="zenkooYellow" title="Categoría sugerida" icon={icon}>
              <Text mb="md">Hemos detectado que esta categoría podría encajar con tu gasto. Puedes seleccionarla a continuación o elegir la que prefieras.</Text>
              <Badge
                variant="light"
                color="zenkoo"
                style={{ cursor: 'pointer' }}
                onClick={() => form.setFieldValue('category', suggestedCategory)}
              >
                {suggestedCategory}
              </Badge>
            </Alert>
          )}
          <Select
            label={
              <Group gap={4}>
                Categoría
                <Tooltip
                  label={
                    <Text size="xs">
                      <strong>Supervivencia:</strong> gastos esenciales como comida, transporte, farmacia.<br />
                      <strong>Ocio y vicio:</strong> caprichos como bares, tabaco, ropa.<br />
                      <strong>Cultura:</strong> libros, cine, música.<br />
                      <strong>Extras:</strong> regalos, reparaciones, electrónica.
                    </Text>
                  }
                  multiline
                  w={260}
                  withArrow
                >
                  <ActionIcon variant="light" size="xs" color="gray">
                    ?
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
            placeholder="Selecciona o escribe"
            searchable
            data={categories}
            {...form.getInputProps('category')}
          />
          <Group justify="flex-end" mt="md">
            <Button leftSection={<Save size={16} />}  type="submit" loading={loading} >
              Guardar gasto
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}