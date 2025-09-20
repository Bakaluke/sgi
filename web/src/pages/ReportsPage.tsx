import { useCallback, useEffect, useState } from 'react';
import { Container, Title, Paper, Text, Skeleton, SegmentedControl, Group, SimpleGrid, Table, Tabs, Pagination, Button } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { startOfMonth, endOfMonth, subMonths, subDays, format } from 'date-fns';
import api from '../api/axios';
import type { ReportData, CustomerSalesReport, ItemSalesReport } from '../types';
import { IconFileExport } from '@tabler/icons-react';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const adjustDateForTimezone = (date: Date | string | null): Date | null => {
    if (!date) return null;
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
    return newDate;
};

function SalesByPeriodReport({ dateRange }: { dateRange: [Date | null, Date | null] }) {
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

function SalesByCustomerReport({ dateRange }: { dateRange: [Date | null, Date | null] }) {
    const [salesData, setSalesData] = useState<CustomerSalesReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    const fetchReport = useCallback((page: number) => {
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
            setLoading(true);
            const params = { 
                startDate: format(startDate, 'yyyy-MM-dd'), 
                endDate: format(endDate, 'yyyy-MM-dd'),
                page 
            };
            api.get('/reports/sales-by-customer', { params })
                .then(response => {
                    setSalesData(response.data.data);
                    setTotalPages(response.data.last_page);
                })
                .finally(() => setLoading(false));
        }
    }, [dateRange]);

    useEffect(() => { fetchReport(activePage); }, [activePage, fetchReport]);

    const handleExport = () => {
        const [startDate, endDate] = dateRange;
        if (!startDate || !endDate) return;
        setIsExporting(true);
        const params = { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') };
        api.get('/reports/sales-by-customer/export', { params, responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'vendas_por_cliente.csv');
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            })
            .finally(() => setIsExporting(false));
    };
    
    const rows = salesData.map(row => (
        <Table.Tr key={row.id}>
            <Table.Td>{row.name}</Table.Td>
            <Table.Td>{row.quote_count}</Table.Td>
            <Table.Td>{formatCurrency(row.total_sold)}</Table.Td>
        </Table.Tr>
    ));

    if (loading) { return <Skeleton h={200} />; }

    return (
        <>
        <Paper withBorder p="lg" radius="md">
            <Group justify="space-between" mb="md">
                <Button onClick={handleExport} loading={isExporting} color="green" size="xs" leftSection={<IconFileExport size={14} />}>Exportar</Button>
            </Group>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Cliente</Table.Th>
                        <Table.Th>Nº de Compras</Table.Th>
                        <Table.Th>Valor Total Comprado</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows.length > 0 ? rows : 
                    <Table.Tr>
                        <Table.Td colSpan={3} align="center">Nenhum dado encontrado para o período.</Table.Td>
                    </Table.Tr>}
                </Table.Tbody>
            </Table>
            <Group justify="center" mt="md"><Pagination total={totalPages} value={activePage} onChange={setActivePage} /></Group>
        </Paper>
        </>
    );
}

function ItemsSoldByDayReport({ dateRange }: { dateRange: [Date | null, Date | null] }) {
    const [reportData, setReportData] = useState<ItemSalesReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    const fetchReport = useCallback((page: number) => {
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
            setLoading(true);
            const params = { 
                startDate: format(startDate, 'yyyy-MM-dd'), 
                endDate: format(endDate, 'yyyy-MM-dd'),
                page 
            };
            api.get('/reports/items-sold-by-day', { params })
                .then(response => {
                    setReportData(response.data.data);
                    setTotalPages(response.data.last_page);
                })
                .finally(() => setLoading(false));
        }
    }, [dateRange]);

    useEffect(() => { fetchReport(activePage); }, [activePage, fetchReport]);

    const handleExport = () => {
        const [startDate, endDate] = dateRange;
        if (!startDate || !endDate) return;

        setIsExporting(true);
        const params = { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') };
        
        api.get('/reports/items-sold-by-day/export', { params, responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'itens-vendidos.csv');
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            })
            .finally(() => setIsExporting(false));
    };

    const rows = reportData.map((row, index) => (
        <Table.Tr key={`${row.sale_date}-${row.product_name}-${index}`}>
            <Table.Td>{new Date(row.sale_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</Table.Td>
            <Table.Td>{row.product_name}</Table.Td>
            <Table.Td>{row.total_quantity}</Table.Td>
        </Table.Tr>
    ));

    if (loading) { return <Skeleton h={200} />; }

    return (
        <>
        <Paper withBorder p="lg" radius="md">
            <Group justify="space-between" mb="md">
                <Button onClick={handleExport} loading={isExporting} color="green" size="xs" leftSection={<IconFileExport size={14} />}>Exportar</Button>
            </Group>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Data da Venda</Table.Th>
                        <Table.Th>Produto</Table.Th>
                        <Table.Th>Quantidade Vendida</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows.length > 0 ? rows : 
                    <Table.Tr>
                        <Table.Td colSpan={3} align="center">Nenhum item vendido no período.</Table.Td>
                    </Table.Tr>}
                </Table.Tbody>
            </Table>
            <Group justify="center" mt="md"><Pagination total={totalPages} value={activePage} onChange={setActivePage} /></Group>
        </Paper>
        </>
    );
}

function ReportsPage() {
    const [period, setPeriod] = useState('this_month');
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startOfMonth(new Date()), endOfMonth(new Date())]);

    useEffect(() => {
        const today = new Date();
        if (period === 'today') setDateRange([today, today]);
        if (period === 'last_7_days') setDateRange([subDays(today, 6), today]);
        if (period === 'this_month') setDateRange([startOfMonth(today), endOfMonth(today)]);
        if (period === 'last_month') {
            const lastMonth = subMonths(today, 1);
            setDateRange([startOfMonth(lastMonth), endOfMonth(lastMonth)]);
        }
    }, [period]);

    return (
        <Container>
            <Group justify="space-between" mb="xl">
                <Title order={1}>Relatório de Vendas</Title>
                <SegmentedControl value={period} onChange={(value) => { setPeriod(value); if (value !== 'custom') { const today = new Date(); if (value === 'this_month') setDateRange([startOfMonth(today), endOfMonth(today)]); }}} data={[ { label: 'Hoje', value: 'today' }, { label: 'Últimos 7 dias', value: 'last_7_days' },{ label: 'Este Mês', value: 'this_month' }, { label: 'Mês Passado', value: 'last_month' }, { label: 'Customizado', value: 'custom' }, ]} />
            </Group>
            
            {period === 'custom' && (
                <Group grow mb="xl" align="flex-start">
                    <DatePickerInput type="range" label="Selecione o período" placeholder="De - Até" valueFormat="DD/MM/YYYY" value={dateRange} onChange={(value: DatesRangeValue) => { const [start, end] = value; setDateRange([adjustDateForTimezone(start), adjustDateForTimezone(end)]); }} mb="xl" />
                </Group>
            )}

            <Tabs defaultValue="summary" mt="xl">
                <Tabs.List>
                    <Tabs.Tab value="summary">Resumo de Vendas</Tabs.Tab>
                    <Tabs.Tab value="by_customer">Vendas por Cliente</Tabs.Tab>
                    <Tabs.Tab value="items_sold">Itens Vendidos</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="summary" pt="xs">
                    <SalesByPeriodReport dateRange={dateRange} />
                </Tabs.Panel>
                
                <Tabs.Panel value="by_customer" pt="xs">
                    <SalesByCustomerReport dateRange={dateRange} />
                </Tabs.Panel>
                
                <Tabs.Panel value="items_sold" pt="xs">
                    <ItemsSoldByDayReport dateRange={dateRange} />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}

export default ReportsPage;