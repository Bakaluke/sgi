import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { Paper, Title, Skeleton, Group, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import api from '../../api/axios';
import type { CashFlowData } from '../../types';

const ChartTooltip = ({ label, payload }: { label: ReactNode; payload: { name: string; value: number; color: string; }[] | undefined }) => {
  if (!payload || !payload.length) return null;
  return (
  <Paper px="md" py="sm" withBorder shadow="md" radius="md">
    <Text fw={700} mb={5}>{label}</Text>
    {payload.map((item) => (
      <Text key={item.name} c={item.color} size="sm">
        {item.name === 'count' ? 'Orçamentos' : item.name}: {item.value}
      </Text>
    ))}
  </Paper>
  );
};

export function CashFlowReport() {
    const [reportData, setReportData] = useState<CashFlowData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(() => {
        setLoading(true);
        api.get('/reports/cash-flow')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setReportData(response.data);
                } else {
                    setReportData([]);
                }
            })
            .catch(error => {
                console.error("Erro ao buscar fluxo de caixa:", error);
                setReportData([]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    if (loading) { return <Skeleton h={350} />; }

    if (reportData.length === 0) {
        return (
            <Paper withBorder p="lg" radius="md">
                <Text ta="center">Nenhum dado de fluxo de caixa encontrado.</Text>
            </Paper>
        );
    }

    return (
        <Paper withBorder p="lg" radius="md">
            <Group justify="space-between" mb="md">
                <Title order={3}>Previsão de Entradas vs. Saídas</Title>
            </Group>
            <BarChart
                h={300}
                data={reportData}
                dataKey="month"
                series={[
                    { name: 'A Receber', label: 'A Receber', color: 'teal.6' },
                    { name: 'A Pagar', label: 'A Pagar', color: 'red.6' },
                ]}
                tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />, cursor: false }}
                yAxisProps={{ tickFormatter: (value) => `R$ ${value.toLocaleString('pt-BR')}` }}
            />
        </Paper>
    );
}