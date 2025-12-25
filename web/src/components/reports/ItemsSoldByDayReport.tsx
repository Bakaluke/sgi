import { useCallback, useEffect, useState } from 'react';
import { Button, Group, Pagination, Paper, Skeleton, Table } from '@mantine/core';
import api from '../../api/axios';
import type { ItemSalesReport } from '../../types';
import { format } from 'date-fns';
import { IconFileExport } from '@tabler/icons-react';

export function ItemsSoldByDayReport({ dateRange }: { dateRange: [Date | null, Date | null] }) {
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