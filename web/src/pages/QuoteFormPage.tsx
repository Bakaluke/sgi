import { useEffect, useState, useRef } from 'react';
import { Container, Title, Select, Button, Group, Table, NumberInput, Paper, Grid, Textarea, Divider, ActionIcon, Tooltip, Fieldset, TextInput, Loader } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrash, IconPrinter, IconPlus, IconEye } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface SelectOption { 
  value: string; 
  label: string; 
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
interface Product {
  id: number;
  name: string;
  sku: string;
  sale_price: string;
}
interface QuoteItem {
  id: number; 
  product: Product; 
  quantity: number;
  unit_cost_price: number;
  unit_sale_price: number; 
  discount_percentage: number; 
  total_price: number;
  profit_margin?: number;
}
interface User {
  id: number;
  name: string;
  role: string;
}
interface CustomerDataSnapshot {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
}
interface Quote {
  id: number;
  customer: Customer;
  user: User;
  status: string;
  total_amount: number;
  created_at: string;
  items: QuoteItem[];
  discount_percentage: number;
  payment_method: string | null;
  delivery_method: string | null;
  delivery_datetime: string | null;
  notes: string | null;
  customer_data: CustomerDataSnapshot;
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercentage = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) return '0,00';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calculateProfitMargin = (cost: number, sale: number): number => {
  const nCost = parseFloat(String(cost));
  const nSale = parseFloat(String(sale));
  if (nSale <= 0 || nCost > nSale || nCost <= 0) return 0;
  return parseFloat((((nSale - nCost) / nSale) * 100).toFixed(2));
};

const enrichQuoteWithProfitMargin = (quoteData: Quote): Quote => {
  if (quoteData && quoteData.items) {
    quoteData.items = quoteData.items.map((item) => ({
      ...item,
      profit_margin: calculateProfitMargin(item.unit_cost_price, item.unit_sale_price),
    }));
  }
  return quoteData;
};

function QuoteFormPage() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | null>(null);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const debounceTimers = useRef<{ [itemId: number]: number }>({});
  const isLocked = initialStatus === 'Aprovado' || initialStatus === 'Cancelado';

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data.data.map((p: Product) => ({ 
        value: String(p.id), 
        label: `${p.name} (SKU: ${p.sku})` 
      })));
    }).catch(err => console.error("Falha ao buscar produtos", err));
  }, []);

  useEffect(() => {
    if (quoteId && quoteId !== 'new') {
      api.get(`/quotes/${quoteId}`).then(res => {
        const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
        setQuote(enrichedQuote);
        setInitialStatus(enrichedQuote.status);
      });
    }
  }, [quoteId]);

  const handleAddItem = () => {
    if (!selectedProduct || !quantity) return;
    api.post(`/quotes/${quoteId}/items`, { product_id: selectedProduct, quantity }).then(res => {
      const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
      setQuote(enrichedQuote);
      setSelectedProduct(null);
      setQuantity(1);
      notifications.show({ title: 'Sucesso!', message: 'Item adicionado.', color: 'green' });
    }).catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível adicionar o item.', color: 'red' }));
  };

  const handleUpdateHeader = () => {
    if (!quote) return;
    setIsSavingHeader(true);
    api.put(`/quotes/${quoteId}`, {
      payment_method: quote.payment_method, delivery_method: quote.delivery_method,
      delivery_datetime: quote.delivery_datetime, discount_percentage: quote.discount_percentage,
      status: quote.status, notes: quote.notes,
    }).then(res => {
      const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
      setQuote(enrichedQuote);
      setInitialStatus(enrichedQuote.status);
      notifications.show({ title: 'Sucesso!', message: 'Alterações salvas.', color: 'green' });
    }).catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível salvar.', color: 'red' }))
    .finally(() => setIsSavingHeader(false));
  };
  
  const handleItemChange = (itemId: number, field: any, value: any) => {
    if (!quote) return;
    const updatedItems = quote.items.map(item => {
      if (item.id === itemId) {
        let quantity = Number(item.quantity);
        let salePrice = Number(item.unit_sale_price);
        let discountPercentage = Number(item.discount_percentage);
        let profitMargin = Number(item.profit_margin);
        const costPrice = Number(item.unit_cost_price);
        
        if (field === 'quantity') {
          quantity = value;
        } else if (field === 'discount_percentage') {
          discountPercentage = value;
        } else if (field === 'unit_sale_price') {
          salePrice = value;
          profitMargin = calculateProfitMargin(costPrice, salePrice);
        } else if (field === 'profit_margin') {
          profitMargin = value;
          if (value < 100 && costPrice > 0) {
            salePrice = costPrice / (1 - (profitMargin / 100));
          }
        }
        
        const discountAmount = salePrice * (discountPercentage / 100);
        const priceWithDiscount = salePrice - discountAmount;
        const totalPrice = quantity * priceWithDiscount;
        
        return { ...item, quantity, unit_sale_price: salePrice, discount_percentage: discountPercentage, profit_margin: profitMargin, total_price: totalPrice };
      }
      return item;
    });
    
    setQuote(q => q ? { ...q, items: updatedItems } : null);
    
    if (debounceTimers.current[itemId]) clearTimeout(debounceTimers.current[itemId]);
    debounceTimers.current[itemId] = setTimeout(() => {
      const itemToUpdate = updatedItems.find(i => i.id === itemId);
      if (!itemToUpdate) return;
      const payload = {
        quantity: itemToUpdate.quantity,
        unit_sale_price: itemToUpdate.unit_sale_price,
        discount_percentage: itemToUpdate.discount_percentage
      };
      api.put(`/quotes/${quote.id}/items/${itemToUpdate.id}`, payload)
      .then(res => {
        const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
        setQuote(enrichedQuote);
      });
    }, 2000);
  };

  const handleRemoveItem = (itemId: number) => {
    if (!quote) return;
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      api.delete(`/quotes/${quote.id}/items/${itemId}`)
      .then(res => {
        const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
        setQuote(enrichedQuote);
        notifications.show({ title: 'Sucesso!', message: 'Item removido.', color: 'green'});
      })
      .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível remover o item.', color: 'red' }));
    }
  };

  const itemRows = quote?.items?.map((item) => (
  <Table.Tr key={item.id}>
    <Table.Td>{item.product.name}</Table.Td>
    <Table.Td style={{ width: 120 }}><NumberInput value={item.quantity} onChange={(val) => handleItemChange(item.id, 'quantity', Number(val))} min={1} disabled={isLocked} /></Table.Td>
    <Table.Td style={{ width: 150 }}><TextInput value={formatCurrency(item.unit_sale_price)} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ''); handleItemChange(item.id, 'unit_sale_price', Number(digits) / 100); }} disabled={isLocked} /></Table.Td>
    <Table.Td style={{ width: 150 }}><NumberInput value={item.profit_margin} onChange={(val) => handleItemChange(item.id, 'profit_margin', Number(val))} decimalScale={2} min={0} max={99.99} rightSection="%" disabled={isLocked} thousandSeparator="." decimalSeparator="," /></Table.Td>
    <Table.Td style={{ width: 150 }}><NumberInput value={item.discount_percentage} onChange={(val) => handleItemChange(item.id, 'discount_percentage', Number(val))} min={0} max={100} allowDecimal={false} rightSection="%" disabled={isLocked} /></Table.Td>
    <Table.Td>{formatCurrency(item.total_price)}</Table.Td>
    <Table.Td><Tooltip label="Remover Item"><ActionIcon color="red" variant="light" onClick={() => handleRemoveItem(item.id)} disabled={isLocked}><IconTrash size={16} /></ActionIcon></Tooltip></Table.Td>
  </Table.Tr>
  ));

  if (!quote) {
    return <Container><Title>Carregando Orçamento...</Title></Container>;
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Orçamento Nº {quote.id}</Title>
      
      <Paper withBorder p="md">
        <Fieldset legend="Dados do Cliente">
          <Grid>
            <Grid.Col span={12}><TextInput label="Cliente" value={quote.customer_data?.name || ''} readOnly disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="E-mail" value={quote.customer_data?.email || ''} readOnly disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Telefone" value={quote.customer_data?.phone ? formatPhone(quote.customer_data.phone) : ''} readOnly disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={12}><TextInput label="Endereço" value={quote.customer_data?.address || ''} readOnly disabled={isLocked} required /></Grid.Col>
          </Grid>
        </Fieldset>

        <Fieldset legend="Dados Gerais do Orçamento" mt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Status" value={quote.status} onChange={(value) => setQuote(q => q ? {...q, status: value || 'Aberto'} : null)} data={['Aberto', 'Negociação', 'Aprovado', 'Cancelado']} disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Forma de Pagamento" value={quote.payment_method} onChange={(value) => setQuote(q => q ? {...q, payment_method: value} : null)} data={['PIX', 'Cartão de Crédito', 'Boleto Bancário', 'Dinheiro']} disabled={isLocked} allowDeselect /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><NumberInput label="Desconto Geral (%)" value={quote?.discount_percentage || 0} onChange={(value) => { if (!quote) return; setQuote({ ...quote, discount_percentage: Number(value) || 0 }); }} min={0} max={99} allowDecimal={false} rightSection="%" disabled={isLocked} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><Select label="Opção de Entrega" value={quote.delivery_method} onChange={(value) => setQuote(q => q ? {...q, delivery_method: value} : null)} data={['Retirada na Loja', 'Correios', 'Transportadora', 'Delivery']} disabled={isLocked} allowDeselect /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><DateTimePicker label="Data/Hora da Entrega" placeholder="Selecione a data e hora" value={quote.delivery_datetime ? new Date(quote.delivery_datetime) : null} onChange={(date) => setQuote(q => q ? {...q, delivery_datetime: date?.toString() || null} : null)} disabled={isLocked} clearable /></Grid.Col>
            <Grid.Col span={12}><Textarea label="Observações" placeholder="Adicione observações sobre o pedido..." value={quote.notes || ''} onChange={(event) => setQuote(q => q ? {...q, notes: event.currentTarget.value} : null)} disabled={isLocked} autosize minRows={2} /></Grid.Col>
          </Grid>
        </Fieldset>
        <Group justify="flex-end" mt="md">
          <Button component="a" href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/quotes/${quote.id}/pdf`} target="_blank" variant="default" leftSection={<IconPrinter size={16} />}>Imprimir</Button>
          <Button onClick={handleUpdateHeader} loading={isSavingHeader} disabled={isLocked}>Salvar Alterações</Button>
        </Group>
      </Paper>

      <Divider my="xl" label="Itens do Orçamento" labelPosition="center" />

      {!isLocked && (
        <Paper withBorder p="md" mb="xl">
          <Title order={4} mb="md">Adicionar Produto ao Orçamento</Title>
          <Group align="flex-end">
            <Select label="Produto" placeholder="Busque por nome ou SKU" data={products} value={selectedProduct} onChange={setSelectedProduct} searchable clearable style={{ flex: 1 }} />
            <NumberInput label="Quantidade" value={quantity} onChange={setQuantity} min={1} allowDecimal={false} style={{ width: 120 }} />
            <Button onClick={handleAddItem}>Adicionar</Button>
          </Group>
        </Paper>
      )}

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th>Qtd.</Table.Th>
            <Table.Th>Preço Unit.</Table.Th>
            <Table.Th>Lucro (%)</Table.Th>
            <Table.Th>Desconto (%)</Table.Th>
            <Table.Th>Total do Item</Table.Th>
            <Table.Th>Ações</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{itemRows && itemRows.length > 0 ? itemRows : 
          <Table.Tr>
            <Table.Td colSpan={7} align="center">Nenhum item adicionado a este orçamento.</Table.Td>
          </Table.Tr> }
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={5}></Table.Td>
            <Table.Th>Total do Orçamento:</Table.Th>
            <Table.Th>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total_amount)}</Table.Th>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Container>
  );
}

export default QuoteFormPage;