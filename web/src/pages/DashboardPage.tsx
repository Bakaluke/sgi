import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Group } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Stats {
  quoteStats: { [key: string]: number };
  orderStats: { [key: string]: number };
}

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xl" fw={700} c={color}>{value}</Text>
      <Text size="sm" c="dimmed">{title}</Text>
    </Paper>
  );
};

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => console.error("Erro ao buscar estatísticas do dashboard", error));
  }, []);

  if (!stats) {
    return <Container><Title>Carregando dados...</Title></Container>;
  }

  const { quoteStats, orderStats } = stats;

  return (
    <Container>
      <Title order={1} mb="xl">Dashboard</Title>

      {/* Seção de Orçamentos - visível apenas para admin e vendedor */}
      {user && ['admin', 'vendedor'].includes(user.role) && (
        <Paper withBorder p="lg" mb="xl">
          <Title order={3} mb="md">Resumo de Orçamentos</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <StatCard title="Em Aberto" value={quoteStats['Aberto']} color="blue.6" />
            <StatCard title="Em Negociação" value={quoteStats['Negociação']} color="yellow.6" />
            <StatCard title="Aprovados" value={quoteStats['Aprovado']} color="green.6" />
            <StatCard title="Cancelados" value={quoteStats['Cancelado']} color="red.6" />
          </SimpleGrid>
        </Paper>
      )}

      {/* Seção de Pedidos - visível para admin, vendedor e produção */}
      <Paper withBorder p="lg">
        <Title order={3} mb="md">Resumo de Pedidos</Title>
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <StatCard title="Pendentes" value={orderStats['Pendente']} color="blue.6" />
          <StatCard title="Em Produção" value={orderStats['Em Produção']} color="yellow.6" />
          <StatCard title="Concluídos" value={orderStats['Concluído']} color="green.6" />
        </SimpleGrid>
      </Paper>
    </Container>
  );
}

export default DashboardPage;