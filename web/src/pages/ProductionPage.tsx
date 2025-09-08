import { Fragment, useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Group, Pagination, TextInput, Select, ActionIcon, Collapse, Paper, Text, Menu, Anchor } from '@mantine/core';
import { IconChevronDown, IconDotsVertical, IconFile, IconFileText, IconPrinter, IconSearch, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { ProductionOrder, ProductionStatus, SelectOption, QuoteItem } from '../types';

function ProductionPage() {
  const { can } = useAuth();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [productionStatuses, setProductionStatuses] = useState<SelectOption[]>([]);
  
  const fetchOrders = useCallback((page: number, search: string) => {
    api.get('/production-orders', { params: { page, search } })
    .then(response => {
      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
    })
    .catch(error => console.error('Houve um erro!', error));
  }, []);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setActivePage(1);setSearchQuery(searchTerm);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    fetchOrders(activePage, searchQuery);
    api.get('/production-statuses').then(res => {
      setProductionStatuses(res.data.map((ps: ProductionStatus) => ({ value: String(ps.id), label: ps.name })));
    });
  }, [activePage, searchQuery, fetchOrders]);

  const handleStatusChange = (orderId: number, newStatusId: string | null) => {
    if (!newStatusId) return;
    const statusObj = productionStatuses.find(s => s.value === newStatusId);
    const newStatusName = statusObj ? statusObj.label : newStatusId;
    api.put(`/production-orders/${orderId}`, { status_id: newStatusId })
    .then(response => {
      setOrders(currentOrders => currentOrders.map(order => 
        order.id === orderId ? response.data : order
      ));
      notifications.show({
        title: 'Sucesso!',
        message: `Status do Pedido Nº ${orderId} atualizado para "${newStatusName}".`,
        color: 'green',
      });
    })
    .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível atualizar o status.', color: 'red' }));
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
        <Table.Td>
          <ActionIcon onClick={() => setExpandedOrderIds((current) => isExpanded ? current.filter((id) => id !== order.id) : [...current, order.id])} disabled={order.quote.items.length === 0}>
            <IconChevronDown style={{ transition: 'transform 200ms ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', }} />
          </ActionIcon>
        </Table.Td>
        <Table.Td>{order.id}</Table.Td>
        <Table.Td>{order.quote_id}</Table.Td>
        <Table.Td>{order.customer?.name || 'N/A'}</Table.Td>
        {can('production_orders.view_all') && <Table.Td>{order.user?.name || 'N/A'}</Table.Td>}
        <Table.Td style={{ width: 200 }}>
          <Select value={String(order.status_id || '')} onChange={(value) => handleStatusChange(order.id, value)} data={productionStatuses} variant="unstyled" styles={(theme) => { const color = order.status?.color || 'gray'; if (!theme.colors[color]) return {}; return { input: { backgroundColor: theme.colors[color][1], color: theme.colors[color][9], fontWeight: 700, textAlign: 'center', border: `1px solid ${theme.colors[color][2]}`, paddingRight: '1.75rem', }, }; }} />
        </Table.Td>
        <Table.Td>{order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}</Table.Td>
        <Table.Td>
          <Menu shadow="md" width={250}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Ações do Pedido</Menu.Label>
              <Menu.Item leftSection={<IconPrinter size={14} />} component="a" href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/production-orders/${order.id}/work-order`} target="_blank">Ordem de Serviço</Menu.Item>
              <Menu.Item leftSection={<IconFileText size={14} />} component="a" href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/production-orders/${order.id}/delivery-protocol`} target="_blank">Protocolo de Entrega</Menu.Item>
              {can('production_orders.delete') && (<><Menu.Divider /><Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(order.id)}>Apagar Ordem de Produção</Menu.Item></>)}
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td colSpan={8} style={{ padding: '0.05rem 0.10rem', border: 0 }}>
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
              <Table.Tbody>{order.quote.items.map((item: QuoteItem) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    {item.product.name}
                    {item.notes && <Text size="xs" c="dimmed" mt={4}>Obs: {item.notes}</Text>}
                    {item.file_path && (
                      <Anchor href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${item.file_path}`} target="_blank" size="xs">
                        <Group gap="xs" mt={4}><IconFile size={14} /> Ver Anexo</Group>
                      </Anchor>
                    )}
                  </Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                </Table.Tr>))}
              </Table.Tbody>
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
          {can('production_orders.view_all') && <Table.Th>Vendedor</Table.Th>}
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