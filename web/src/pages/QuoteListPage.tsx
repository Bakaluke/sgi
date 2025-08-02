import { useEffect, useState } from 'react';
import { Table, Title, Container, Button, Group, Badge, Modal, Select, Grid, TextInput, Textarea, NumberInput, ActionIcon, Tooltip } from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEye, IconPrinter, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  role: string;
}
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
interface Quote {
  id: number;
  customer: Customer;
  user: User;
  status: string;
  total_amount: number;
  created_at: string;
  payment_method: string | null;
  delivery_method: string | null;
  delivery_datetime: string | null;
  discount_percentage: number;
  notes: string | null;
}
interface SelectOption {
  value: string;
  label: string;
}

const initialFormData = {
    customer_id: '',
    payment_method: '',
    delivery_method: '',
    delivery_date: null as Date | null,
    delivery_time: '',
    notes: '',
};

function QuoteListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState(initialFormData);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  
  useEffect(() => {
    fetchQuotes();
    api.get('/customers').then(res => {
      setCustomers(res.data.map((c: Customer) => ({ value: String(c.id), label: `${c.name} (${c.document})` })));
    });
  }, []);
  
  const fetchQuotes = () => {
    api.get('/quotes').then(response => { setQuotes(response.data); });
  };
  
  const handleCustomerSelect = (customerId: string | null) => {
    setFormData(prev => ({ ...prev, customer_id: customerId || '' }));
    if (customerId) {
      api.get(`/customers/${customerId}`).then(res => setCustomerDetails(res.data));
    } else {
      setCustomerDetails(null);
    }
  };

  const handleSaveQuote = (andNavigate: boolean) => {
    let finalDeliveryDateTime = null;
    if (formData.delivery_date && formData.delivery_time) {
        const date = new Date(formData.delivery_date);
        const [hours, minutes] = formData.delivery_time.split(':');
        date.setHours(Number(hours), Number(minutes));
        finalDeliveryDateTime = date.toISOString();
    }

    const payload = {
      customer_id: formData.customer_id,
      payment_method: formData.payment_method,
      delivery_method: formData.delivery_method,
      notes: formData.notes,
      delivery_datetime: finalDeliveryDateTime,
    };

    api.post('/quotes', payload)
    .then(response => {
        close();
        setFormData(initialFormData);
        fetchQuotes();
        notifications.show({ title: 'Sucesso!', message: 'Orçamento criado.', color: 'green' });
        if (andNavigate) {
            navigate(`/quotes/${response.data.id}`);
        }
    })
    .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível criar o orçamento.', color: 'red' }));
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
      case 'Negociação': return 'yellow';
      default: return 'blue';
    }
  };

  const rows = quotes.map((quote) => (
    <Table.Tr key={quote.id}>
      <Table.Td>{quote.id}</Table.Td>
      <Table.Td>{quote.customer.name}</Table.Td>
      <Table.Td>{quote.user.name}</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(quote.status)}>{quote.status}</Badge>
      </Table.Td>
      <Table.Td>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total_amount)}
      </Table.Td>
      <Table.Td>
        {new Date(quote.created_at).toLocaleDateString('pt-BR')}
      </Table.Td>
      <Table.Td>
        <Group gap="l">
          <Tooltip label="Ver Orçamento"><ActionIcon variant="light" color="blue" onClick={() => navigate(`/quotes/${quote.id}`)}><IconEye size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Imprimir Orçamento"><ActionIcon variant="light" color="gray" component="a" href={`${process.env.REACT_APP_API_BASE_URL?.replace('/api', '')}/quotes/${quote.id}/pdf`} target="_blank"><IconPrinter size={16} /></ActionIcon></Tooltip>
          {user?.role === 'admin' && ( <Tooltip label="Excluir Orçamento"><ActionIcon variant="light" color="red" onClick={() => handleDelete(quote.id)}><IconTrash size={16} /></ActionIcon></Tooltip>)}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container>
      <Modal opened={opened} onClose={close} title="Criar Novo Orçamento" size="xl">
        <Grid>
          <Grid.Col span={12}><Select label="Selecione o Cliente" placeholder="Digite para buscar..." data={customers} onChange={handleCustomerSelect} searchable required clearable /></Grid.Col>
            {customerDetails && (<>
                <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Telefone" value={customerDetails.phone || ''} readOnly /></Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Email" value={customerDetails.email || ''} readOnly /></Grid.Col>
            </>)}
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Forma de Pagamento" data={['PIX', 'Cartão de Crédito', 'Boleto']} onChange={(value) => setFormData(p => ({ ...p, payment_method: value || '' }))} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Forma de Entrega" data={['Retirada na Loja', 'Correios', 'Transportadora']} onChange={(value) => setFormData(p => ({ ...p, delivery_method: value || '' }))} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><DateInput label="Data da Entrega" value={formData.delivery_date} onChange={(date) => setFormData(p => ({ ...p, delivery_date: date }))} clearable /></Grid.Col>
          <Grid.Col span={12}><Textarea label="Observações" onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} /></Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={() => handleSaveQuote(false)}>Apenas Salvar</Button>
            <Button onClick={() => handleSaveQuote(true)}>Salvar e Adicionar Itens</Button>
        </Group>
    </Modal>

      <Group justify="space-between" my="lg">
        <Title order={1}>Orçamentos</Title>
        <Button onClick={open} leftSection={<IconPlus size={16} />}>Novo Orçamento</Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nº</Table.Th>
            <Table.Th>Cliente</Table.Th>
            <Table.Th>Vendedor</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Valor Total</Table.Th>
            <Table.Th>Data</Table.Th>
            <Table.Th>Ações</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Container>
  );
}

export default QuoteListPage;