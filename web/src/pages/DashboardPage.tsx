import { useEffect, useState } from 'react';
import { Container, Title, Paper, Text, Skeleton, SegmentedControl, Group } from '@mantine/core';
import { BarChart, AreaChart } from '@mantine/charts';
import { useAuth } from '../context/AuthContext';
import { Cell } from 'recharts';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';
import type { Stats } from '../types';
import api from '../api/axios';

const ChartTooltip = ({ label, payload }: { label: any, payload: any[] | undefined }) => {
  if (!payload || !payload.length) return null;
  return (
  <Paper px="md" py="sm" withBorder shadow="md" radius="md">
    <Text fw={700} mb={5}>{label}</Text>
    {payload.map((item: any) => (
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
  const now = new Date();
  const [period, setPeriod] = useState('this_month');
  const [dateRange, setDateRange] = useState<[Date, Date]>([startOfMonth(now), endOfMonth(now)]);
  
  useEffect(() => {
    setLoading(true);
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
    api.get('/dashboard/stats', { params })
    .then(response => { setStats(response.data); })
    .finally(() => setLoading(false));
  }, [dateRange]);

  useEffect(() => {
    const today = new Date();
    if (period === 'today') setDateRange([now, now]);
    if (period === 'last_7_days') setDateRange([subDays(now, 6), now]);
    if (period === 'this_month') setDateRange([startOfMonth(today), endOfMonth(today)]);
    if (period === 'last_month') {
      const lastMonth = subMonths(today, 1);
      setDateRange([startOfMonth(lastMonth), endOfMonth(lastMonth)]);
    }
  }, [period]);
  
  const quoteStatusData = stats?.quoteStats?.statuses.map(status => ({
    status: status.name,
    Orçamentos: stats.quoteStats?.counts[status.name] || 0,
    color: `var(--mantine-color-${status.color}-6)`,
  })).filter(item => item.Orçamentos > 0) ?? [];
  
  const orderStatusData = stats?.orderStats?.statuses.map(status => ({
    status: status.name,
    Pedidos: stats.orderStats?.counts[status.name] || 0,
    color: `var(--mantine-color-${status.color}-6)`,
  })).filter(item => item.Pedidos > 0) ?? [];

  if (loading || !stats) {
    return (
    <Container>
      <Skeleton height={40} mb="xl" />
      <Skeleton height={300} mb="xl" />
      <Skeleton height={300} />
    </Container>
    );
  }

  return (
  <Container>
    <Group justify="space-between" mb="xl">
      <Title order={1}>Dashboard</Title>
      <SegmentedControl value={period} onChange={setPeriod} data={[ { label: 'Hoje', value: 'today' }, { label: 'Últimos 7 dias', value: 'last_7_days' }, { label: 'Este Mês', value: 'this_month' }, { label: 'Mês Passado', value: 'last_month' }, { label: 'Customizado', value: 'custom' }, ]} />
    </Group>

    {period === 'custom' && (<DatePickerInput type="range" label="Selecione o período" placeholder="De - Até" value={dateRange} onChange={(value: DatesRangeValue) => { const [start, end] = value; if (!start || !end) { return; } const startDate = typeof start === 'string' ? new Date(start) : start; const endDate = typeof end === 'string' ? new Date(end) : end; if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) { setDateRange([startDate, endDate]); } }} mb="xl" /> )}
    
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
    
    {can('quotes.view') && stats.quotesOverTime.length > 0 && (
      <Paper withBorder p="lg">
        <Title order={3} mb="md">Orçamentos Criados</Title>
        <AreaChart h={300} data={stats.quotesOverTime} dataKey="date" series={[{ name: 'count', color: 'blue.6' }]} curveType="natural" tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} /> }} />
      </Paper>
    )}
  </Container>
  );
}

export default DashboardPage;