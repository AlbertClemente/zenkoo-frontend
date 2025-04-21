'use client'

import {
  Card,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  Grid,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMantineTheme } from '@mantine/core'
import api from '@/lib/axios'
import { Download, FileDown, FileJson, RefreshCcw } from 'lucide-react'

export default function AdminIA() {
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [retraining, setRetraining] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchModelInfo = async () => {
    setLoading(true)
    try {
      const res = await api.get('api/admin/model-info/')
      setModelInfo(res.data)
    } catch (err) {
      setError('No se pudo obtener la información del modelo.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async () => {
    setRetraining(true)
    setError('')
    setSuccess(false)

    try {
      const res = await api.post('api/ml/retrain/')
      if (res.status !== 200) throw new Error('Error al reentrenar el modelo')

      setSuccess(true)

      showNotification({
        title: '¡Éxito!',
        message: 'El modelo se ha reentrenado correctamente',
        color: 'zenkoo',
        icon: <IconCheck size={16} />,
      })

      await fetchModelInfo()
    } catch (err: any) {
      const code = err?.response?.data?.code
      const detail = err?.response?.data?.detail
      const errorMsg = detail || 'Hubo un error al reentrenar el modelo.'

      setError(errorMsg)

      showNotification({
        title: code === 'NOT_ENOUGH_DATA' ? 'No se puede reentrenar' : 'Error',
        message: errorMsg,
        color: code === 'NOT_ENOUGH_DATA' ? 'zenkooYellow' : 'zenkooRed',
        icon: code === 'NOT_ENOUGH_DATA' ? <IconAlertCircle size={16} /> : <IconX size={16} />,
      })
    } finally {
      setRetraining(false)
    }
  }

  useEffect(() => {
    fetchModelInfo()
  }, [])

  const theme = useMantineTheme()

  const CATEGORY_COLORS: Record<string, string> = {
    'Supervivencia': theme.colors.zenkoo[5],
    'Ocio y vicio': theme.colors.zenkooYellow[5],
    'Cultura': theme.colors.zenkooViolet[5],
    'Extras': theme.colors.zenkooBlue[5],
  }

  const COLORS = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7f50',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#a29bfe',
  ]

  const chartData = useMemo(() => {
    if (!modelInfo?.categoryDistribution) return []
    return Object.entries(modelInfo.categoryDistribution).map(([name, value]) => ({
      name,
      value,
    }))
  }, [modelInfo])

  console.log('modelinfo:', modelInfo)
  console.log('chartData:', chartData)

  if (modelInfo && !modelInfo.categoryDistribution) {
    console.warn('⚠️ modelInfo cargado pero sin categoryDistribution:', modelInfo)
  }
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3} mb="sm">Gestión de IA</Title>

      {loading ? (
        <Loader />
      ) : modelInfo ? (
        <>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs" mb={20}>
                <Text>📅 Último entrenamiento: {new Date(modelInfo.lastTrainedAt).toLocaleString()}</Text>
                <Text>📦 Muestras usadas: {modelInfo.sampleCount}</Text>
                <Text>🏷️ Categorías: {modelInfo.categories.join(', ')}</Text>
                <Text>
                  📈 Precisión (accuracy): {modelInfo.accuracy !== null ? `${modelInfo.accuracy.toFixed(2)}%` : 'N/D'}
                </Text>
                <Text size="xs" c="dimmed">Versión del modelo: {modelInfo.modelVersion}</Text>
              </Stack>

              <Group>
                <Button onClick={handleRetrain} loading={retraining} disabled={retraining} leftSection={<RefreshCcw size={16} />} >
                  Reentrenar modelo
                </Button>
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/static/ml/model.pkl`} download>
                  <Button variant="light" leftSection={<FileDown size={16} />}>
                    Descargar modelo
                  </Button>
                </a>
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/static/ml/model_info.json`} download>
                  <Button variant="light" leftSection={<FileJson size={16} />}>
                    Descargar JSON
                  </Button>
                </a>
              </Group>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={4} mb="sm">Distribución de categorías</Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid.Col>
          </Grid>
        </>
      ) : (
        <Text>No hay información disponible.</Text>
      )}
    </Card>
  )
}
