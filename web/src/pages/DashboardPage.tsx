import { useEffect, useState } from 'react';
import { Container, Title, Paper, Text, Skeleton, SegmentedControl, Group, SimpleGrid, List, ThemeIcon, Button, Table } from '@mantine/core';
import { BarChart, AreaChart } from '@mantine/charts';
import { useAuth } from '../context/AuthContext';
import { Cell } from 'recharts';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths, subDays, differenceInDays } from 'date-fns';
import { IconAlertTriangle, IconClockHour4 } from '@tabler/icons-react';
import type { Stats } from '../types';
import api from '../api/axios';

const StatCard = ({ title, value, formatAsCurrency = false }: { title: string, value: number, formatAsCurrency?: boolean }) => {
  const formattedValue = formatAsCurrency 
  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  : value;
  return (
  <Paper withBorder p="md" radius="md">
    <Text size="xl" fw={700}>{formattedValue}</Text>
    <Text size="sm" c="dimmed">{title}</Text>
  </Paper>
  );
};

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

function DashboardPage() {
  const { can } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startOfMonth(new Date()), endOfMonth(new Date())]);
  
  useEffect(() => {
    const [startDate, endDate] = dateRange;
    if (startDate && endDate) {
      setLoading(true);
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
      api.get('/dashboard/stats', { params })
      .then(response => { setStats(response.data); })
      .catch(error => console.error("Erro ao buscar dados do dashboard", error))
      .finally(() => setLoading(false));
    }
  }, [dateRange]);

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

  if (loading || !stats) {
    return (
    <Container>
      <Skeleton height={40} mb="xl" />
      <Skeleton height={300} mb="xl" />
      <Skeleton height={300} />
    </Container>
    );
  }

  const { kpis, lowStockProducts, staleQuotes, topSellingProducts } = stats;
  
  const quoteStatusData = stats.quoteStats?.statuses.map(status => ({
    status: status.name,
    Orçamentos: stats.quoteStats?.counts[status.name] || 0,
    color: `var(--mantine-color-${status.color}-6)`,
  })).filter(item => item.Orçamentos > 0) ?? [];
  
  const orderStatusData = stats.orderStats?.statuses.map(status => ({
    status: status.name,
    Pedidos: stats.orderStats?.counts[status.name] || 0,
    color: `var(--mantine-color-${status.color}-6)`,
  })).filter(item => item.Pedidos > 0) ?? [];

  const topProductsRows = topSellingProducts.map((product) => (
    <Table.Tr key={product.product_name}>
      <Table.Td>{product.product_name}</Table.Td>
      <Table.Td align="left">{product.total_quantity}</Table.Td>
    </Table.Tr>
  ));

  return (
  <Container>
    <Group justify="space-between" mb="xl">
      <Title order={1}>Dashboard</Title>
      <SegmentedControl value={period} onChange={setPeriod} data={[ { label: 'Hoje', value: 'today' }, { label: 'Últimos 7 dias', value: 'last_7_days' }, { label: 'Este Mês', value: 'this_month' }, { label: 'Mês Passado', value: 'last_month' }, ]} />
    </Group>

    {can('quotes.view') && (
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <StatCard title="Valor Aprovado no Período" value={kpis.approvedValue} formatAsCurrency />
        <StatCard title="Previsão de Faturamento" value={kpis.forecastValue} formatAsCurrency />
        <StatCard title="Ticket Médio" value={kpis.averageTicket} formatAsCurrency />
      </SimpleGrid>
    )}
      
    {can('quotes.view') && (
    <Paper withBorder p="lg" mb="xl">
      <Title order={3} mb="md">Resumo de Orçamentos</Title>
      <BarChart h={300} data={quoteStatusData} dataKey="status" series={[{ name: 'Orçamentos' }]} tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />, cursor: false }} xAxisProps={{ angle: 0, textAnchor: 'end', fontSize: 11 }}>
      {quoteStatusData.map((item) => (<Cell key={item.status} fill={item.color} />))}
      </BarChart>
    </Paper>
    )}
    
    {(can('production_orders.view') || can('production_orders.view_all')) && (
    <Paper withBorder p="lg" mb="xl">
      <Title order={3} mb="md">Resumo de Pedidos</Title>
      <BarChart h={300} data={orderStatusData} dataKey="status" series={[{ name: 'Pedidos' }]} tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />, cursor: false }} xAxisProps={{ angle: 0, textAnchor: 'end', fontSize: 11 }}>
      {orderStatusData.map((item) => (<Cell key={item.status} fill={item.color} />))}
      </BarChart>
    </Paper>
    )}

    {can('quotes.view_all') && topSellingProducts.length > 0 && (
      <Paper withBorder p="lg" mb="xl">
        <Title order={3} mb="md">Top 5 Produtos Mais Vendidos</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Produto</Table.Th>
              <Table.Th align="right">Qtd. Vendida</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{topProductsRows}</Table.Tbody>
        </Table>
      </Paper>
    )}
    
    {can('quotes.view') && stats.quotesOverTime.length > 0 && (
    <Paper withBorder p="lg" mb="xl">
      <Title order={3} mb="md">Orçamentos Criados</Title>
      <AreaChart h={300} data={stats.quotesOverTime} dataKey="date" series={[{ name: 'count', color: 'blue.6' }]} curveType="natural" tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} /> }} />
    </Paper>
    )}
    
    {(can('stock.manage') && lowStockProducts.length > 0) || (can('quotes.view') && staleQuotes.length > 0) ? (
      <Paper withBorder p="lg" mb="xl">
        <Title order={3} mb="md">Pontos de Atenção:</Title>
        {can('stock.manage') && lowStockProducts.length > 0 && (
          <List spacing="xs" size="sm" center icon={ <ThemeIcon color="red" size={24} radius="xl"><IconAlertTriangle size={16} /></ThemeIcon> }>
            {lowStockProducts.map(product => (
              <List.Item key={product.id}>
                <Group justify="space-between">
                  <Text>Estoque baixo para <strong>{product.name}:</strong></Text>
                  <Text c="red" fw={700}>{product.quantity_in_stock} unidades restantes</Text>
                </Group>
              </List.Item>
            ))}
          </List>
        )}

        {can('quotes.view') && staleQuotes.length > 0 && (
          <List spacing="xs" size="sm" center mt="md" icon={ <ThemeIcon color="orange" size={24} radius="xl"><IconClockHour4 size={16} /></ThemeIcon> }>
            {staleQuotes.map(quote => (
              <List.Item key={quote.id}>
                <Group justify="space-between">
                  <Text>
                    Orçamento para <strong>{quote.customer.name}</strong> está parado há {differenceInDays(new Date(), new Date(quote.created_at))} dias.
                  </Text>
                  <Button component={Link} to={`/quotes/${quote.id}`} size="xs" variant="light">Ver Orçamento</Button>
                </Group>
              </List.Item>
            ))}
          </List>
        )}
      </Paper>
    ) : null}
  </Container>
  );
}

export default DashboardPage;