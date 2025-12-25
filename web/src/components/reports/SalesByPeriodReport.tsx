import { useEffect, useState } from 'react';
import { Paper, Title, Skeleton, SimpleGrid, Text } from '@mantine/core';
import api from '../../api/axios';
import type { ReportData } from '../../types';
import { format } from 'date-fns';

const StatCard = ({ title, value, formatAsCurrency = false }: { title: string, value: number, formatAsCurrency?: boolean }) => {
    const formattedValue = formatAsCurrency 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
        : new Intl.NumberFormat('pt-BR').format(value);

    return (
        <Paper withBorder p="md" radius="md" ta="center">
            <Text size="sm" c="dimmed">{title}</Text>
            <Text size="xl" fw={700}>{formattedValue}</Text>
        </Paper>
    );
};

export function SalesByPeriodReport({ dateRange }: { dateRange: [Date | null, Date | null] }) {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
            setLoading(true);
            const params = { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') };
            api.get('/reports/sales-by-period', { params })
                .then(response => setReportData(response.data))
                .finally(() => setLoading(false));
        }
    }, [dateRange]);

    if (loading) { return <SimpleGrid cols={3}><Skeleton h={88} /><Skeleton h={88} /><Skeleton h={88} /></SimpleGrid>; }

    return (
        <Paper withBorder p="lg" radius="md">
            <Title order={3} mb="md">Resumo do Período</Title>
            <SimpleGrid cols={3}>
                <StatCard title="Faturamento (Orç. Aprovados)" value={reportData?.total_revenue || 0} formatAsCurrency />
                <StatCard title="Nº de Vendas" value={reportData?.quote_count || 0} />
                <StatCard title="Ticket Médio" value={reportData?.average_ticket || 0} formatAsCurrency />
            </SimpleGrid>
        </Paper>
    );
}