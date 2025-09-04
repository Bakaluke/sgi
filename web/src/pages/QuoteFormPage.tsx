import { useEffect, useState } from 'react';
import { Container, Title, Select, Button, Group, Table, NumberInput, Paper, Grid, Textarea, Divider, ActionIcon, Tooltip, Fieldset, TextInput, Text, Modal, FileInput, Anchor } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { IconTrash, IconPrinter, IconPencil, IconUpload, IconFile } from '@tabler/icons-react';
import api from '../api/axios';
import type { SelectOption, Status, Customer, Product, Quote, QuoteItem } from '../types';

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

const formatPercentage = (value: number | undefined | null): string => (value ? `${value.toFixed(2)}%` : '0.00%');

const calculateProfitMargin = (cost: number, sale: number): number => {
  if (sale <= 0 || cost > sale || cost <= 0) return 0;
  return parseFloat((((sale - cost) / sale) * 100).toFixed(2));
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
  const [paymentMethods, setPaymentMethods] = useState<SelectOption[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<SelectOption[]>([]);
  const [quoteStatuses, setQuoteStatuses] = useState<SelectOption[]>([]);
  const [negotiationSources, setNegotiationSources] = useState<SelectOption[]>([]);
  const [itemModalOpened, { open: openItemModal, close: closeItemModal }] = useDisclosure(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const isLocked = initialStatus === 'Aprovado' || initialStatus === 'Cancelado';
  
  const _dummyCustomer: Customer | null = null;
  // eslint-disable-next-line no-constant-condition
  if (false) console.log(_dummyCustomer);

  const itemForm = useForm({
    initialValues: {
      quantity: 1, unit_sale_price: 0, discount_percentage: 0,
      profit_margin: 0, notes: '', file: null as File | null,
    },
  });

  useEffect(() => {
    if (!editingItem) return;
    const cost = Number(editingItem.unit_cost_price);
    const sale = Number(itemForm.values.unit_sale_price);
    itemForm.setFieldValue('profit_margin', calculateProfitMargin(cost, sale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemForm.values.unit_sale_price]);
    
    useEffect(() => {
      if (!editingItem) return;
      const cost = Number(editingItem.unit_cost_price);
      const margin = Number(itemForm.values.profit_margin);
      if (margin < 100 && cost > 0) {
        const newSalePrice = cost / (1 - (margin / 100));
        if (itemForm.values.unit_sale_price.toFixed(2) !== newSalePrice.toFixed(2)) {
          itemForm.setFieldValue('unit_sale_price', newSalePrice);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemForm.values.profit_margin]);
  
  useEffect(() => {
    api.get('/products', { params: { per_page: 1000 } }).then(res => {
      setProducts(res.data.data.map((p: Product) => ({ value: String(p.id), label: `${p.name} (Código: ${p.sku})` })));
    });
    api.get('/payment-methods').then(res => setPaymentMethods(res.data.map((pm: {id: number, name: string}) => ({ value: String(pm.id), label: pm.name }))));
    api.get('/delivery-methods').then(res => setDeliveryMethods(res.data.map((dm: {id: number, name: string}) => ({ value: String(dm.id), label: dm.name }))));
    api.get('/quote-statuses').then(res => setQuoteStatuses(res.data.map((qs: Status) => ({ value: String(qs.id), label: qs.name }))));
    api.get('/negotiation-sources').then(res => setNegotiationSources(res.data.map((ns: {id: number, name: string}) => ({ value: String(ns.id), label: ns.name }))));
  }, []);
  
  useEffect(() => {
    if (quoteId) {
      api.get(`/quotes/${quoteId}`).then(res => {
        const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
        setQuote(enrichedQuote);
        setInitialStatus(enrichedQuote.status?.name || null);
      });
    }
  }, [quoteId]);
  
  const updateQuoteField = (field: keyof Quote, value: string | number | Date | null) => {
    setQuote(currentQuote => {
      if (!currentQuote) return null;
      return { ...currentQuote, [field]: value };
    });
  };

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
      payment_method_id: quote.payment_method_id,
      delivery_method_id: quote.delivery_method_id,
      status_id: quote.status_id,
      negotiation_source_id: quote.negotiation_source_id,
      delivery_datetime: quote.delivery_datetime,
      discount_percentage: quote.discount_percentage,
      status: quote.status,
      notes: quote.notes,
    })
    .then(res => {
      const enrichedQuote = enrichQuoteWithProfitMargin(res.data);
      setQuote(enrichedQuote);
      setInitialStatus(enrichedQuote.status?.name || null);
      notifications.show({ title: 'Sucesso!', message: 'Alterações salvas.', color: 'green' });
    })
    .catch((error) => {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join('\n');
        notifications.show({
          title: 'Por favor, corrija os seguintes erros:',
          message: errorMessages,
          color: 'red',
        });
      } else {
        console.error("Erro ao salvar alterações:", error);
        notifications.show({ 
          title: 'Erro!', 
          message: 'Não foi possível salvar as alterações.', 
          color: 'red' 
        });
      }
    })
    .finally(() => {
      setIsSavingHeader(false);
    });
  };
  
  const handleOpenEditItemModal = (item: QuoteItem) => {
    setEditingItem(item);
    itemForm.setValues({
        quantity: item.quantity,
        unit_sale_price: item.unit_sale_price,
        discount_percentage: item.discount_percentage,
        profit_margin: item.profit_margin || 0,
        notes: item.notes || '',
        file: null,
    });
    openItemModal();
  };
  
  const handleItemUpdate = (values: typeof itemForm.values) => {
    if (!quote || !editingItem) return;
    const data = new FormData();
    data.append('quantity', String(values.quantity));
    data.append('unit_sale_price', String(values.unit_sale_price));
    data.append('discount_percentage', String(values.discount_percentage));
    data.append('profit_margin', String(values.profit_margin));
    data.append('notes', values.notes);
    if (values.file) { data.append('file', values.file); }
    data.append('_method', 'PUT');
    api.post(`/quotes/${quote.id}/items/${editingItem.id}`, data)
    .then(res => {
      setQuote(enrichQuoteWithProfitMargin(res.data));
      closeItemModal();
      notifications.show({ title: 'Sucesso!', message: 'Item atualizado.', color: 'green'});
    })
    .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível atualizar o item.', color: 'red'}));
  };

  const handleRemoveItem = (itemId: number) => {
    if (!quote) return;
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      api.delete(`/quotes/${quote.id}/items/${itemId}`)
      .then(res => {
        setQuote(enrichQuoteWithProfitMargin(res.data));
        notifications.show({ title: 'Sucesso!', message: 'Item removido.', color: 'green'});
      })
      .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível remover o item.', color: 'red' }));
    }
  };
  
  const itemRows = quote?.items?.map((item) => (
  <Table.Tr key={item.id}>
    <Table.Td>
    {item.product.name}
    {item.notes && <Text size="xs" c="dimmed">Obs: {item.notes}</Text>}
    {item.file_path && (
    <Anchor href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${item.file_path}`} target="_blank" size="xs">
      <Group gap="xs" mt={4}> <IconFile size={14} /> Ver Anexo </Group>
    </Anchor>
    )}
    </Table.Td>
    <Table.Td>{item.quantity}</Table.Td>
    <Table.Td>{formatCurrency(item.unit_sale_price)}</Table.Td>
    <Table.Td>{formatPercentage(item.profit_margin)}</Table.Td>
    <Table.Td>{item.discount_percentage}%</Table.Td>
    <Table.Td>{formatCurrency(item.total_price)}</Table.Td>
    <Table.Td>
      <Group gap="xs">
        <Tooltip label="Editar Item"><ActionIcon color="blue" variant="light" onClick={() => handleOpenEditItemModal(item)} disabled={isLocked}><IconPencil size={16} /></ActionIcon></Tooltip>
        <Tooltip label="Remover Item"><ActionIcon color="red" variant="light" onClick={() => handleRemoveItem(item.id)} disabled={isLocked}><IconTrash size={16} /></ActionIcon></Tooltip>
      </Group>
    </Table.Td>
  </Table.Tr>
  ));

  if (!quote) {
    return <Container><Title>Carregando Orçamento...</Title></Container>;
  }

  return (
    <Container size="xl">
      <Modal opened={itemModalOpened} onClose={closeItemModal} title={`Editar Item: ${editingItem?.product.name}`}>
        <form onSubmit={itemForm.onSubmit(handleItemUpdate)}>
          <Grid>
            <Grid.Col span={4}><NumberInput label="Quantidade" min={1} {...itemForm.getInputProps('quantity')} /></Grid.Col>
            <Grid.Col span={4}><TextInput label="Preço Unit." value={formatCurrency(itemForm.values.unit_sale_price)} onChange={(e) => itemForm.setFieldValue('unit_sale_price', Number(e.target.value.replace(/\D/g, ''))/100)} /></Grid.Col>
            <Grid.Col span={4}><NumberInput label="Lucro (%)" min={0} max={99.99} decimalScale={2} {...itemForm.getInputProps('profit_margin')} /></Grid.Col>
            <Grid.Col span={4}><NumberInput label="Desconto (%)" min={0} max={100} {...itemForm.getInputProps('discount_percentage')} /></Grid.Col>
          </Grid>
          <Textarea mt="md" label="Observações de Personalização" placeholder="Detalhes de personalização, medidas, cores, etc." minRows={3} {...itemForm.getInputProps('notes')} />
          <FileInput mt="md" label="Arquivo de Arte/Referência" placeholder="Anexe um arquivo (PDF, JPG, PNG, ZIP...)" leftSection={<IconUpload size={14} />} {...itemForm.getInputProps('file')} clearable />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={closeItemModal}>Cancelar</Button>
            <Button type="submit">Salvar Item</Button>
          </Group>
        </form>
      </Modal>
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
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Status" value={String(quote.status_id || '')} onChange={(value) => updateQuoteField('status_id', value ? Number(value) : null)} data={quoteStatuses} disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Forma de Pagamento" value={String(quote.payment_method_id || '')} onChange={(value) => updateQuoteField('payment_method_id', value ? Number(value) : null)} data={paymentMethods} disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><NumberInput label="Desconto Geral (%)" value={quote.discount_percentage || 0} onChange={(value) => updateQuoteField('discount_percentage', Number(value) || 0)} min={0} max={99} allowDecimal={false} rightSection="%" disabled={isLocked} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Opção de Entrega" value={String(quote.delivery_method_id || '')} onChange={(value) => updateQuoteField('delivery_method_id', value ? Number(value) : null)} data={deliveryMethods} disabled={isLocked} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><DateTimePicker label="Data/Hora da Entrega" placeholder="Selecione data e hora" value={quote.delivery_datetime ? new Date(quote.delivery_datetime) : null} onChange={(date) => updateQuoteField('delivery_datetime', date?.toString() || null)} disabled={isLocked} clearable required minDate={new Date()} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Origem da Negociação" placeholder="Selecione..." value={String(quote.negotiation_source_id || '')} onChange={(value) => updateQuoteField('negotiation_source_id', value ? Number(value) : null)} data={negotiationSources} disabled={isLocked} required clearable /></Grid.Col>
            <Grid.Col span={12}><Textarea label="Observações" placeholder="Adicione observações sobre o pedido..." value={quote.notes || ''} onChange={(event) => updateQuoteField('notes', event.currentTarget.value)} disabled={isLocked} autosize minRows={2} /></Grid.Col>
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
            <Select label="Produto" placeholder="Busque por nome ou código" data={products} value={selectedProduct} onChange={setSelectedProduct} searchable clearable style={{ flex: 1 }} />
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