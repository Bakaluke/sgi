import { Fragment, useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Group, Badge, Pagination, TextInput, Select, Tooltip, ActionIcon, Collapse, Paper, Menu } from '@mantine/core';
import { IconChevronDown, IconDotsVertical, IconFileText, IconPrinter, IconSearch, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
}
interface QuoteItem {
  id: number;
  product: Product;
  quantity: number;
  unit_sale_price: number;
  total_price: number;
}
interface ProductionOrder {
    id: number;
    quote_id: number;
    customer: { name: string };
    status: string;
    created_at: string;
    quote: {
        items: QuoteItem[];
    };
}

function ProductionPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  
  const fetchOrders = useCallback((page: number, search: string) => {
    api.get('/production-orders', { params: { page, search } })
    .then(response => {
      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
    })
    .catch(error => console.error('Houve um erro!', error));
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

  const handleStatusChange = (orderId: number, newStatus: string | null) => {
    if (!newStatus) return;
    api.put(`/production-orders/${orderId}`, { status: newStatus })
    .then(response => {
      setOrders(currentOrders => currentOrders.map(order => 
        order.id === orderId ? response.data : order
      ));
      notifications.show({
        title: 'Sucesso!',
        message: `Status do Pedido Nº ${orderId} atualizado para "${newStatus}".`,
        color: 'green',
      });
    })
    .catch(() => {
      notifications.show({
        title: 'Erro!',
        message: 'Não foi possível atualizar o status do pedido.',
        color: 'red',
      });
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'green';
      case 'Em Produção': return 'yellow';
      default: return 'blue';
    }
  };

  const handleDelete = (orderId: number) => {
    if (window.confirm('Tem certeza que deseja apagar esta ordem de produção? Esta ação não pode ser desfeita.')) {
      api.delete(`/production-orders/${orderId}`)
      .then(() => {
        notifications.show({
          title: 'Sucesso',
          message: `Ordem de Produção Nº ${orderId} foi apagada.`,
          color: 'green',
        });
        fetchOrders(activePage, searchQuery);
      })
      .catch(error => {
        console.error(`Erro ao apagar a ordem ${orderId}`, error);
        notifications.show({
          title: 'Erro!',
          message: 'Não foi possível apagar a ordem de produção.',
          color: 'red',
        });
      });
    }
  };

  
  const rows = orders.map((order) => {
    const isExpanded = expandedOrderIds.includes(order.id);
    return (
    <Fragment key={order.id}>
      <Table.Tr>
        <Table.Td><ActionIcon onClick={() => setExpandedOrderIds(current => isExpanded ? current.filter(id => id !== order.id) : [...current, order.id])} disabled={order.quote.items.length === 0} ><IconChevronDown style={{ transition: 'transform 200ms ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} /></ActionIcon></Table.Td>
        <Table.Td>{order.id}</Table.Td>
        <Table.Td>{order.quote_id}</Table.Td>
        <Table.Td>{order.customer.name}</Table.Td>
        <Table.Td style={{ width: 200 }}><Select value={order.status} onChange={(value) => handleStatusChange(order.id, value)} data={['Pendente', 'Em Produção', 'Concluído']} variant="unstyled" styles={(theme, { value }) => { const color = getStatusColor(value || 'Pendente'); return { input: { backgroundColor: theme.colors[color][1], color: theme.colors[color][9], fontWeight: 700, textAlign: 'center', border: `1px solid ${theme.colors[color][2]}`, paddingRight: '1.75rem', }, }; }} /></Table.Td>
        <Table.Td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</Table.Td>
        <Table.Td>
            <Menu shadow="md" width={250}>
                <Menu.Target>
                    <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Ações do Pedido</Menu.Label>
                    <Menu.Item
                        leftSection={<IconPrinter size={14} />}
                        component="a"
                        href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/production-orders/${order.id}/work-order`}
                        target="_blank"
                    >
                        Imprimir Ordem de Serviço
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<IconFileText size={14} />}
                        component="a"
                        href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/production-orders/${order.id}/delivery-protocol`}
                        target="_blank"
                    >
                        Imprimir Protocolo de Entrega
                    </Menu.Item>
                    {user?.role === 'admin' && (
                        <>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDelete(order.id)}
                            >
                                Apagar Ordem de Produção
                            </Menu.Item>
                        </>
                    )}
                </Menu.Dropdown>
            </Menu>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td colSpan={7} style={{ padding: '0.05rem 0.10rem', border: 0 }}>
          <Collapse in={isExpanded}>
          <Paper p="md" withBorder bg="gray.0" radius={0}>
            <Title order={6}>Itens do Pedido</Title>
            <Table verticalSpacing="xs" mt="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Produto</Table.Th>
                  <Table.Th>Qtd.</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{order.quote.items.map(item => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.product.name}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                </Table.Tr>
              ))}</Table.Tbody>
            </Table>
          </Paper>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </Fragment>
    );
  });
  
  return (
  <Container>
    <Group justify="space-between" my="lg">
      <Title order={1}>Ordens de Produção</Title>
      </Group>
    <TextInput label="Buscar Ordem de Produção" placeholder="Digite o Nº, nome do cliente ou status..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={40} />
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
        </Table.Tr> )}
      </Table.Tbody>
    </Table>
    <Group justify="center" mt="xl">
      <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
    </Group>
  </Container>
  );
}

export default ProductionPage;