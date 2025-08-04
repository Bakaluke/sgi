import { useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Group, Badge, Pagination, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import api from '../api/axios';

interface ProductionOrder {
  id: number;
  quote_id: number;
  customer: { name: string };
  status: string;
  created_at: string;
}

function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchOrders = useCallback((page: number, search: string) => {
    api.get('/production-orders', {
      params: { page, search }
    }).then(response => {
      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
    }).catch(error => {
      console.error('Houve um erro ao buscar as ordens de produção!', error);
    });
  }, []);
  
  useEffect(() => {
    fetchOrders(activePage, searchQuery);
  }, [activePage, searchQuery, fetchOrders]);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setActivePage(1);setSearchQuery(searchTerm);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'green';
      case 'Em Produção': return 'yellow';
      default: return 'blue';
    }
  };
  
  const rows = orders.map((order) => (
  <Table.Tr key={order.id}>
    <Table.Td>{order.id}</Table.Td>
    <Table.Td>{order.quote_id}</Table.Td>
    <Table.Td>{order.customer.name}</Table.Td>
    <Table.Td><Badge color={getStatusColor(order.status)}>{order.status}</Badge></Table.Td>
    <Table.Td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</Table.Td>
    <Table.Td>{/* Ações como "Mudar Status" virão aqui */}</Table.Td>
  </Table.Tr>
  ));
  
  return (
  <Container>
    <Group justify="space-between" my="lg">
      <Title order={1}>Ordens de Produção</Title>
    </Group>

    <TextInput label="Buscar Ordem de Produção" placeholder="Digite o Nº do pedido, nome do cliente ou status..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />
    
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nº do Pedido</Table.Th>
          <Table.Th>Nº do Orçamento</Table.Th>
          <Table.Th>Cliente</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Data de Criação</Table.Th>
          <Table.Th>Ações</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows.length > 0 ? rows : (
        <Table.Tr>
          <Table.Td colSpan={6} align="center">Nenhuma ordem de produção encontrada.</Table.Td>
        </Table.Tr>
      )}</Table.Tbody>
    </Table>
    
    <Group justify="center" mt="xl">
      <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
    </Group>
  </Container>
  );
}

export default ProductionPage;