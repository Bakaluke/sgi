import { useCallback, useEffect, useState } from 'react';
import { Button, Group, Pagination, Paper, Skeleton, Table } from '@mantine/core';
import api from '../../api/axios';
import type { CustomerSalesReport } from '../../types';
import { format } from 'date-fns';
import { IconFileExport } from '@tabler/icons-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function SalesByCustomerReport({ dateRange }: { dateRange: [Date | null, Date | null] }) {
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