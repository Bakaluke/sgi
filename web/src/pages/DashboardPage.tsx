import { useEffect, useState } from 'react';
import { Container, Title, Paper, Text, Skeleton } from '@mantine/core';
import { BarChart, AreaChart } from '@mantine/charts';
import { useAuth } from '../context/AuthContext';
import { Cell } from 'recharts';
import api from '../api/axios';
import type { Stats } from '../types';

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
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  
  useEffect(() => {
    api.get('/dashboard/stats').then(response => { setStats(response.data); });
  }, []);

  if (!stats) {
    return (
    <Container>
      <Skeleton height={40} mb="xl" />
      <Skeleton height={200} mb="xl" />
      <Skeleton height={200} />
    </Container>
    );
  }

  const { quoteStats, orderStats, quotesOverTime } = stats;

  const quoteStatusData = [
    { status: 'Aberto', Orçamentos: quoteStats['Aberto'] || 0, color: 'blue.6' },
    { status: 'Negociação', Orçamentos: quoteStats['Negociação'] || 0, color: 'yellow.6' },
    { status: 'Aprovado', Orçamentos: quoteStats['Aprovado'] || 0, color: 'green.6' },
    { status: 'Cancelado', Orçamentos: quoteStats['Cancelado'] || 0, color: 'red.6' },
  ];
  
  const orderStatusData = [
    { status: 'Pendente', Pedidos: orderStats['Pendente'] || 0, color: 'blue.6' },
    { status: 'Em Produção', Pedidos: orderStats['Em Produção'] || 0, color: 'yellow.6' },
    { status: 'Concluído', Pedidos: orderStats['Concluído'] || 0, color: 'green.6' },
  ];

  return (
  <Container>
    <Title order={1} mb="xl">Dashboard</Title>
    
    {user && ['admin', 'vendedor'].includes(user.role) && (
      <Paper withBorder p="lg" mb="xl">
        <Title order={3} mb="md">Resumo de Orçamentos</Title>
        <BarChart h={300} data={quoteStatusData} dataKey="status" series={[{ name: 'Orçamentos' }]} tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />, cursor: false }} xAxisProps={{ angle: 0, textAnchor: 'end', fontSize: 11 }}>
        {quoteStatusData.map((item) => (<Cell key={item.status} fill={`var(--mantine-color-${item.color})`} />))}
        </BarChart>
      </Paper>
    )}
    
    <Paper withBorder p="lg" mb="xl">
      <Title order={3} mb="md">Resumo de Pedidos</Title>
      <BarChart h={300} data={orderStatusData} dataKey="status" series={[{ name: 'Pedidos' }]} tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />, cursor: false }} xAxisProps={{ angle: 0, textAnchor: 'end', fontSize: 11 }}>
      {orderStatusData.map((item) => (<Cell key={item.status} fill={`var(--mantine-color-${item.color.replace('.', '-')})`} />))}
      </BarChart>
    </Paper>
    
    {user && ['admin', 'vendedor'].includes(user.role) && (
      <Paper withBorder p="lg">
        <Title order={3} mb="md">Orçamentos Criados (Últimos 7 Dias)</Title>
        <AreaChart h={300} data={quotesOverTime} dataKey="date" series={[{ name: 'count', color: 'blue.6' }]} curveType="linear" tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} /> }} />
      </Paper>
    )}
  </Container>
  );
}

export default DashboardPage;