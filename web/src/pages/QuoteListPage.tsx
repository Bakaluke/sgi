import { Fragment, useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Button, Group, Badge, Modal, Select, Grid, TextInput, Textarea, ActionIcon, Fieldset, Menu, Collapse, Paper, Pagination, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateTimePicker } from '@mantine/dates';
import { IconPlus, IconEye, IconPrinter, IconTrash, IconDotsVertical, IconMail, IconBrandWhatsapp, IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Address {
  id: number;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string | null;
  city: string;
  state: string;
}
interface Customer {
  id: number;
  name: string;
  document: string;
  type: string;
  email: string | null;
  phone: string | null;
  addresses: Address[];
}
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
interface Quote {
  id: number;
  customer: Customer;
  user: { name: string };
  status: string;
  total_amount: number;
  created_at: string;
  items: QuoteItem[];
}
interface SelectOption {
  value: string;
  label: string;
}

const initialFormData = {
  customer_id: '',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  customer_address: '',
  payment_method: '',
  delivery_method: '',
  delivery_datetime: '',
  notes: '',
};

const formatPhone = (phone: string = '') => {
  const cleaned = phone.replace(/\D/g, '').substring(0, 11);
  if (!cleaned) return '';
  const length = cleaned.length;
  if (length <= 2) return `(${cleaned}`;
  if (length <= 6) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
  if (length <= 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

function QuoteListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState(initialFormData);
  const [expandedQuoteIds, setExpandedQuoteIds] = useState<number[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery] = useState('');
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  
  const fetchQuotes = useCallback((page: number, search: string) => {
    api.get('/quotes', {
      params: { page, search }
    }).then(response => {
      setQuotes(response.data.data);
      setTotalPages(response.data.last_page);
    }).catch(error => {
      if (error.response?.status !== 403) {
        console.error('Houve um erro ao buscar os orçamentos!', error)
      }
    });
  }, []);
  
  useEffect(() => {
    fetchQuotes(activePage, searchQuery);
  }, [activePage, searchQuery, fetchQuotes]);
  
  useEffect(() => {
    setIsSearchingCustomers(true);
    const searchTimer = setTimeout(() => {
      api.get('/customers', { params: { search: customerSearch, per_page: 15 } })
      .then(res => {
        const customersData = res.data.data;
        setCustomerOptions(customersData.map((c: Customer) => ({ 
          value: String(c.id), 
          label: `${c.name} (${c.document})` 
        })));
      })
      .catch(err => console.error("Falha ao buscar clientes", err))
      .finally(() => setIsSearchingCustomers(false));
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [customerSearch]);
  
  const handleCustomerSelect = (customerId: string | null) => {
    if (!customerId) {
      setFormData(initialFormData);
      return;
    }
    api.get(`/customers/${customerId}`).then(res => {
      const customer: Customer = res.data;
      const address = customer.addresses?.[0];
      const addressString = address ? `${address.street}, nº ${address.number}, ${address.complement}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.cep}` : '';
      setFormData(prev => ({
        ...prev,
        customer_id: customerId,
        customer_name: customer.name,
        customer_phone: customer.phone || '',
        customer_email: customer.email || '',
        customer_address: addressString,
      }));
    });
  };

  const handleSaveQuote = (andNavigate: boolean) => {
    if (!formData.customer_id) {
      notifications.show({ title: 'Atenção', message: 'Selecione um cliente para continuar.', color: 'yellow' });
      return;
    }

    const payload = {
      customer_id: formData.customer_id,
      payment_method: formData.payment_method,
      delivery_method: formData.delivery_method,
      notes: formData.notes,
      delivery_datetime: formData.delivery_datetime,
    };

    api.post('/quotes', payload)
    .then(response => {
      close();
      setFormData(initialFormData);
      fetchQuotes(activePage, searchQuery);
      notifications.show({ title: 'Sucesso!', message: 'Orçamento criado.', color: 'green' });
      if (andNavigate) {
        navigate(`/quotes/${response.data.id}`);
      }
    })
    .catch((error) => {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join('\n');
        notifications.show({
          title: 'Por favor, corrija os seguintes erros:',
          message: errorMessages,
          color: 'red',
          autoClose: 10000,
        });
      } else {
        console.error("Erro ao criar orçamento:", error);
        notifications.show({ 
          title: 'Erro!', 
          message: 'Não foi possível criar o orçamento. Tente novamente.', 
          color: 'red' 
        });
      }
    });
  };

  const handleDelete = (quoteId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento permanentemente? Esta ação não pode ser desfeita.')) {
      api.delete(`/quotes/${quoteId}`)
      .then(() => {
        setQuotes(currentQuotes => currentQuotes.filter(q => q.id !== quoteId));
        notifications.show({
          title: 'Sucesso!',
          message: `Orçamento Nº ${quoteId} foi excluído.`,
          color: 'green',
        });
        fetchQuotes(activePage, searchQuery);
      })
      .catch(error => {
        console.error(`Erro ao excluir o orçamento ${quoteId}`, error);
        notifications.show({
          title: 'Erro!',
          message: 'Não foi possível excluir o orçamento.',
          color: 'red',
        });
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'green';
      case 'Cancelado': return 'red';
      case 'Negociação': return 'blue';
      default: return 'yellow';
    }
  };
  
  const rows = quotes.map((quote) => {
    const isExpanded = expandedQuoteIds.includes(quote.id);

    return (
      <Fragment key={quote.id}>
        <Table.Tr key={quote.id} onClick={() => navigate(`/quotes/${quote.id}`)} style={{ cursor: 'pointer' }}>
          <Table.Td>
            <ActionIcon onClick={(event) => { event.stopPropagation(); setExpandedQuoteIds((current) => isExpanded ? current.filter((id) => id !== quote.id) : [...current, quote.id]); }} disabled={quote.items.length === 0}>
              <IconChevronDown style={{ transition: 'transform 200ms ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', }} />
            </ActionIcon>
          </Table.Td>
          <Table.Td>{quote.id}</Table.Td>
          <Table.Td>{quote.customer.name}</Table.Td>
          {can('quotes.view_all') && <Table.Td>{quote.user.name}</Table.Td>}
          <Table.Td><Badge color={getStatusColor(quote.status)}>{quote.status}</Badge></Table.Td>
          <Table.Td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total_amount)}</Table.Td>
          <Table.Td>{quote.created_at ? new Date(quote.created_at).toLocaleDateString('pt-BR') : ''}</Table.Td>
          <Table.Td onClick={(e) => e.stopPropagation()}>
            <Menu shadow="md" width={220}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Ações do Orçamento</Menu.Label>
                <Menu.Item leftSection={<IconEye size={14} />} onClick={() => navigate(`/quotes/${quote.id}`)} >Ver / Editar</Menu.Item>
                <Menu.Item leftSection={<IconPrinter size={14} />} component="a" href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/quotes/${quote.id}/pdf`} target="_blank" >Imprimir Orçamento</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconMail size={14} />} disabled>Enviar por E-mail</Menu.Item>
                <Menu.Item leftSection={<IconBrandWhatsapp size={14} />} disabled>Enviar por WhatsApp</Menu.Item>
                {can('quotes.delete') && (<><Menu.Divider /><Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(quote.id)} >Apagar Orçamento</Menu.Item></>)}
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </Table.Tr>
          
          <Table.Tr>
            <Table.Td colSpan={8} style={{ padding: '0.05rem 0.10rem', border: 0 }}>
              <Collapse in={isExpanded}>
                <Paper p="md" withBorder bg="gray.0" radius={0}>
                  <Table verticalSpacing="xs" mt="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Produto</Table.Th>
                        <Table.Th>Qtd.</Table.Th>
                        <Table.Th>Preço Unit.</Table.Th>
                        <Table.Th>Total</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{quote.items.map(item => (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.product.name}</Table.Td>
                        <Table.Td>{item.quantity}</Table.Td>
                        <Table.Td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_sale_price)}</Table.Td>
                        <Table.Td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_price)}</Table.Td>
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
      <Modal opened={opened} onClose={close} title="Criar Novo Orçamento" size="xl">
        <Fieldset legend="Dados do Cliente" mt="md">
          <Grid>
            <Grid.Col span={12}><Select label="Selecione o Cliente" placeholder="Digite para buscar..." data={customerOptions} searchable required clearable value={formData.customer_id} onChange={handleCustomerSelect} onSearchChange={setCustomerSearch} searchValue={customerSearch} rightSection={isSearchingCustomers ? <Loader size="xs" /> : null} /></Grid.Col>
            {/*<Grid.Col span={{ base: 12, md: 11 }}><Select label="Selecione o Cliente" placeholder="Digite para buscar..." data={customerOptions} searchable required clearable value={formData.customer_id} onChange={handleCustomerSelect} onSearchChange={setCustomerSearch} searchValue={customerSearch} rightSection={isSearchingCustomers ? <Loader size="xs" /> : null} /></Grid.Col>*/}
            {/*<Grid.Col span={{ base: 12, md: 1 }}><Tooltip label="Cadastrar Cliente"><Button><IconUsersPlus size={16} /></Button></Tooltip></Grid.Col>*/}
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Email" value={formData.customer_email || ''} readOnly /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Telefone" value={formData.customer_phone ? formatPhone(formData.customer_phone) : ''} readOnly /></Grid.Col>
            <Grid.Col span={12}><TextInput label="Endereço" value={formData.customer_address || ''} readOnly /></Grid.Col>
          </Grid>
        </Fieldset>
        
        <Fieldset legend="Dados do Orçamento" mt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}><Select label="Forma de Pagamento" data={['PIX', 'Cartão de Crédito', 'Boleto Bancário', 'Dinheiro']} onChange={(value) => setFormData(p => ({ ...p, payment_method: value || '' }))} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><Select label="Opção de Entrega" data={['Retirada na Loja', 'Correios', 'Transportadora', 'Delivery']} onChange={(value) => setFormData(p => ({ ...p, delivery_method: value || '' }))} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><DateTimePicker label="Data/Hora da Entrega" value={formData.delivery_datetime ? new Date(formData.delivery_datetime) : null} onChange={(value) => setFormData(p => ({ ...p, delivery_datetime: value || '' }))} placeholder="Selecione a data e hora" clearable minDate={new Date()} /></Grid.Col>
            <Grid.Col span={12}><Textarea label="Observações" onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} /></Grid.Col>
          </Grid>
        </Fieldset>
        
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => handleSaveQuote(false)}>Salvar Orçamento</Button>
          <Button onClick={() => handleSaveQuote(true)}>Salvar e Adicionar Itens</Button>
        </Group>
      </Modal>
      
      <Group justify="space-between" my="lg">
        <Title order={1}>Orçamentos</Title>
        {can('quotes.create') && (<Button onClick={open} leftSection={<IconPlus size={16} />}>Novo Orçamento</Button>)}
      </Group>

      <TextInput label="Buscar Orçamento" placeholder="Digite o Nº, nome do cliente ou status..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />
      
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40} />
            <Table.Th>Nº</Table.Th>
            <Table.Th>Cliente</Table.Th>
            {can('quotes.view_all') && <Table.Th>Vendedor</Table.Th>}
            <Table.Th>Status</Table.Th>
            <Table.Th>Valor Total</Table.Th>
            <Table.Th>Data</Table.Th>
            <Table.Th>Ações</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows.length > 0 ? ( rows ) : ( 
          <Table.Tr>
            <Table.Td colSpan={8} align="center">Nenhum produto encontrado.</Table.Td>
          </Table.Tr>
        )}</Table.Tbody>
      </Table>

      <Group justify="center" mt="xl">
        <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
      </Group>
    </Container>
  );
}

export default QuoteListPage;