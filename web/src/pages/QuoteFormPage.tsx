import { useEffect, useState, useRef } from 'react';
import { Container, Title, Select, Button, Group, Table, NumberInput, Paper, Grid, Textarea, Divider, ActionIcon, Tooltip, Fieldset, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrash, IconPrinter } from '@tabler/icons-react';
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
  unit_cost_price: number;
  unit_sale_price: number;
  discount_percentage: number;
  total_price: number;
}
interface Quote {
  id: number;
  customer_id: number;
  total_amount: number;
  discount_percentage: number;
  payment_method: string | null;
  delivery_method: string | null;
  delivery_datetime: string | null;
  status: string;
  notes: string | null;
  items: QuoteItem[];
  customer: Customer;
  user: { name: string };
}
interface SelectOption {
  value: string;
  label: string;
}

const formatPhone = (phone: string = '') => {
    const cleaned = phone.replace(/\D/g, '').substring(0, 11);
    if (!cleaned) return '';
    const length = cleaned.length;
    if (length <= 2) return `(${cleaned}`;
    if (length <= 6) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    if (length <= 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

const formatPercentage = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0,00';
  }
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calculateProfitMargin = (cost: number, sale: number): number => {
    if (sale === 0) return 0;
    return ((sale - cost) / sale) * 100;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

function QuoteFormPage() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const isCreating = quoteId === 'new';

  const [initialStatus, setInitialStatus] = useState<string | null>(null);

  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isSavingHeader, setIsSavingHeader] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.get('/customers').then(res => { setCustomers(res.data.map((c: Customer) => ({ value: String(c.id), label: `${c.name} (${c.document})` }))); });
    api.get('/products').then(res => { setProducts(res.data.map((p: Product) => ({ value: String(p.id), label: p.name }))); });
  }, []);
  
  useEffect(() => {
    if (quoteId && !isCreating) {
        api.get(`/quotes/${quoteId}`).then(res => {
            setQuote(res.data);
            setInitialStatus(res.data.status);
        });
    }
  }, [quoteId, isCreating]);

  const isLocked = initialStatus === 'Aprovado' || initialStatus === 'Cancelado';

  const handleCreateHeader = (customerId: string | null) => { if (!customerId) return; api.post('/quotes', { customer_id: customerId }).then(res => navigate(`/quotes/${res.data.id}`)); };

  const handleAddItem = () => { if (!selectedProduct || !quantity) return; api.post(`/quotes/${quoteId}/items`, { product_id: selectedProduct, quantity }).then(res => { setQuote(res.data); setSelectedProduct(null); setQuantity(1); }); };
  
  const handleUpdateItem = (itemId: number, field: keyof QuoteItem, value: any) => {
    if (!quote) return;
    const updatedItems = quote.items.map(item => {
        if (item.id === itemId) {
            return { ...item, [field]: value };
        }
        return item;
    });
    setQuote({ ...quote, items: updatedItems });
    
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
        api.put(`/quotes/${quote.id}/items/${itemId}`, { [field]: value })
        .then(res => {
            setQuote(res.data);
        })
        .catch(error => console.error("Erro ao atualizar item", error));
    }, 800);
  };

  const handleMarginChange = (item: QuoteItem, newMargin: number) => {
    if (newMargin >= 100) return;
    const marginDecimal = newMargin / 100;
    const newSalePrice = item.unit_cost_price / (1 - marginDecimal);
    handleUpdateItem(item.id, 'unit_sale_price', newSalePrice);
  };

  const handleRemoveItem = (itemId: number) => {
    if (!quote) return;
    api.delete(`/quotes/${quote.id}/items/${itemId}`)
    .then(res => setQuote(res.data));
  };

  const handleUpdateHeader = () => {
    if(!quote) return;
    setIsSavingHeader(true);
    api.put(`/quotes/${quoteId}`, {
        payment_method: quote.payment_method,
        delivery_method: quote.delivery_method,
        delivery_datetime: quote.delivery_datetime,
        discount_percentage: quote.discount_percentage,
        status: quote.status,
        notes: quote.notes,
    }).then(res => {
        const updatedQuote = res.data;
        setQuote(updatedQuote);
        setInitialStatus(updatedQuote.status);
        notifications.show({
            title: 'Sucesso!',
            message: 'As alterações no orçamento foram salvas.',
            color: 'green',
        });
    }).catch(() => {
        notifications.show({
            title: 'Erro!',
            message: 'Não foi possível salvar as alterações.',
            color: 'red',
        });
    }).finally(() => {
        setIsSavingHeader(false);
    });
  };

  const customerAddress = () => {
    const customerAddress = quote?.customer?.addresses?.[0] ? `${quote.customer.addresses[0].street}, nº ${quote.customer.addresses[0].number}, ${quote.customer.addresses[0].complement}, ${quote.customer.addresses[0].neighborhood}, ${quote.customer.addresses[0].city} - ${quote.customer.addresses[0].state}, ${quote.customer.addresses[0].cep}` : '';
    return `${customerAddress}`;
  };

  if (isCreating) {
    return (
      <Container>
        <Title order={2} mb="lg">Passo 1: Novo Orçamento</Title>
        <Select label="Selecione o Cliente" placeholder="Digite para buscar..." data={customers}
          onChange={handleCreateHeader} searchable required
        />
      </Container>
    );
  }

  const itemRows = quote?.items?.map((item) => {
    const profitMargin = calculateProfitMargin(item.unit_cost_price, item.unit_sale_price);
    return (
    <Table.Tr key={item.id}>
        <Table.Td>{item.product.name}</Table.Td>
        <Table.Td style={{ width: 120 }}><NumberInput value={item.quantity} onChange={(val) => handleUpdateItem(item.id, 'quantity', Number(val))} min={1} thousandSeparator="." decimalSeparator="," disabled={isLocked} /></Table.Td>
        <Table.Td style={{ width: 150 }}><TextInput value={formatCurrency(item.unit_sale_price)} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ''); const numericValue = Number(digits) / 100; handleUpdateItem(item.id, 'unit_sale_price', numericValue); }} disabled={isLocked} /></Table.Td>
        <Table.Td style={{ width: 150 }}><TextInput value={formatPercentage(profitMargin)} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ''); const numericValue = Number(digits) / 100; handleMarginChange(item, numericValue); }} rightSection={<span style={{fontSize: '12px', color: 'gray'}}>%</span>} disabled={isLocked} /></Table.Td>
        <Table.Td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_price)}</Table.Td>
        <Table.Td>
            <Tooltip label="Remover Item"><ActionIcon color="red" variant="light" onClick={() => handleRemoveItem(item.id)} disabled={isLocked}><IconTrash size={16} /></ActionIcon></Tooltip>
        </Table.Td>
    </Table.Tr>
    );
  });

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Orçamento Nº {quoteId}</Title>
      <Paper withBorder p="md">
        <Fieldset legend="Dados do Cliente" mt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Cliente" value={quote?.customer?.name || ''} readOnly /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="E-mail" value={quote?.customer?.email || ''} readOnly /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Telefone" value={quote?.customer?.phone ? formatPhone(quote.customer.phone) : ''} readOnly /></Grid.Col>
            <Grid.Col span={12}><TextInput label="Endereço" value={customerAddress()} readOnly /></Grid.Col>
          </Grid>
        </Fieldset>

        <Fieldset legend="Dados Gerais do Orçamento" mt="md">
            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select label="Status do Orçamento" value={quote?.status}
                        onChange={(value) => setQuote(q => q ? {...q, status: value || 'Aberto'} : null)}
                        data={['Aberto', 'Negociação', 'Aprovado', 'Cancelado']}
                        required
                        disabled={isLocked}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select label="Forma de Pagamento" value={quote?.payment_method}
                        onChange={(value) => setQuote(q => q ? {...q, payment_method: value} : null)}
                        data={['PIX', 'Cartão de Crédito', 'Boleto Bancário', 'Dinheiro']}
                        required
                        disabled={isLocked}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    label="Desconto Geral (%)"
                    value={formatPercentage(quote?.discount_percentage || 0)}
                    onChange={(event) => {
                      if (!quote) return;
                      const digits = event.target.value.replace(/\D/g, '');
                      const numericValue = Number(digits) / 100;
                      if (numericValue <= 100) {
                        setQuote({ ...quote, discount_percentage: numericValue });
                      }
                    }}
                    rightSection={<span style={{ fontSize: '12px', color: 'gray' }}>%</span>}
                    disabled={isLocked}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select label="Forma de Entrega" value={quote?.delivery_method}
                        onChange={(value) => setQuote(q => q ? {...q, delivery_method: value} : null)}
                        data={['Retirada na Loja', 'Correios', 'Transportadora', 'Delivery']}
                        required
                        disabled={isLocked}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <DateTimePicker
                        label="Data/Hora da Entrega"
                        placeholder="Selecione a data e hora"
                        value={quote?.delivery_datetime ? new Date(quote.delivery_datetime) : null}
                        onChange={(date) => setQuote(q => q ? {...q, delivery_datetime: date?.toString() || null} : null)}
                        clearable
                        disabled={isLocked}
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <Textarea label="Observações" placeholder="Adicione observações sobre o pedido..."
                        value={quote?.notes || ''}
                        onChange={(event) => setQuote(q => q ? {...q, notes: event.currentTarget.value} : null)}
                        autosize minRows={2}
                        disabled={isLocked}
                    />
                </Grid.Col>
            </Grid>
        </Fieldset>
        <Group justify="flex-end" mt="md">
          <Button component="a" href={`${process.env.REACT_APP_API_BASE_URL?.replace('/api', '')}/quotes/${quoteId}/pdf`} target="_blank" variant="default" leftSection={<IconPrinter size={16} />} disabled={!quote}>Imprimir</Button>
          <Button onClick={handleUpdateHeader} loading={isSavingHeader} disabled={isLocked}>Salvar Alterações</Button>
        </Group>
      </Paper>

      <Divider my="xl" />

      <Paper withBorder p="md">
        <Title order={4} mb="md">Adicionar Produto ao Orçamento</Title>
        <Group align="flex-end">
          <Select label="Produto" placeholder="Busque por nome ou SKU" data={products} value={selectedProduct}
            onChange={setSelectedProduct} searchable clearable style={{ flex: 1 }} disabled={isLocked}
          />
          <NumberInput label="Quantidade" value={quantity} onChange={setQuantity} min={1} style={{ width: 120 }} disabled={isLocked} />
          <Button onClick={handleAddItem} disabled={isLocked}>Adicionar</Button>
        </Group>
      </Paper>
      
      <Title order={3} mt="xl" mb="lg">Itens do Orçamento</Title>
      <Table>
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Produto</Table.Th>
                <Table.Th>Qtd.</Table.Th>
                <Table.Th>Preço Unit.</Table.Th>
                <Table.Th>Lucro (%)</Table.Th>
                <Table.Th>Subtotal</Table.Th>
                <Table.Th>Ações</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{itemRows}</Table.Tbody>
        <Table.Tfoot>
            <Table.Tr>
                <Table.Td colSpan={4}></Table.Td>
                <Table.Th>Total</Table.Th>
                <Table.Th>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote?.total_amount || 0)}</Table.Th>
            </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Container>
  );
}

export default QuoteFormPage;