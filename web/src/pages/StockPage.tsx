import { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Title, Container, Group, Pagination, TextInput, Button, Tooltip, Modal, Tabs, NumberInput, Select, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconHistory, IconArrowsTransferUp } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';

interface Product {
    id: number;
    name: string;
    sku: string;
    quantity_in_stock: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const entryTypes = [ 'Entrada Inicial', 'Compra/Reposição', 'Ajuste Manual - Entrada' ];
const exitTypes = [ 'Perda de Produção', 'Defeito de Fabricação', 'Ajuste Manual - Saída' ];

const initialMovementFormData = { type: '', quantity: 0, cost_price: 0 };

function StockPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [movementFormData, setMovementFormData] = useState(initialMovementFormData);
    const [isSaving, setIsSaving] = useState(false);
    const notesRef = useRef<HTMLTextAreaElement>(null);

    const fetchProducts = useCallback((page: number, search: string) => {
        api.get('/products', { params: { page, search } }).then(response => {
            setProducts(response.data.data);
            setTotalPages(response.data.last_page);
        }).catch(error => console.error('Houve um erro ao buscar os produtos!', error));
    }, []);

    useEffect(() => {
        fetchProducts(activePage, searchQuery);
    }, [activePage, searchQuery, fetchProducts]);
    
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setActivePage(1);
            setSearchQuery(searchTerm);
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleOpenMovementModal = (product: Product) => {
        setSelectedProduct(product);
        setMovementFormData(initialMovementFormData);
        if(notesRef.current) notesRef.current.value = '';
        openModal();
    };

    const handleSaveMovement = () => {
        const isEntry = entryTypes.includes(movementFormData.type);
        if (!selectedProduct || !movementFormData.type || !movementFormData.quantity || (isEntry && movementFormData.cost_price <= 0)) {
            notifications.show({ title: 'Atenção', message: 'Preencha todos os campos obrigatórios (Tipo, Quantidade e Custo para entradas).', color: 'yellow' });
            return;
        }
        setIsSaving(true);
        const payload = {
            product_id: selectedProduct.id,
            type: movementFormData.type,
            quantity: movementFormData.quantity,
            notes: notesRef.current?.value || '',
            cost_price: isEntry ? movementFormData.cost_price : null,
        };
        api.post('/stock-movements', payload)
        .then(() => {
            closeModal();
            notifications.show({ title: 'Sucesso!', message: 'Movimentação registrada.', color: 'green' });
            fetchProducts(activePage, searchQuery);
        })
        .catch(error => {
            const message = error.response?.data?.message || 'Não foi possível registrar a movimentação.';
            notifications.show({ title: 'Erro!', message, color: 'red' });
        })
        .finally(() => setIsSaving(false));
    };

    const rows = products.map((product) => (
        <Table.Tr key={product.id}>
            <Table.Td>{product.name}</Table.Td>
            <Table.Td>{product.sku}</Table.Td>
            <Table.Td fw={700}>{product.quantity_in_stock}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Tooltip label="Registrar Movimentação">
                        <Button variant="light" size="xs" leftSection={<IconArrowsTransferUp size={16} />} onClick={() => handleOpenMovementModal(product)}>Movimentar</Button>
                    </Tooltip>
                    <Tooltip label="Ver Histórico (em breve)">
                        <Button variant="light" color="gray" size="xs" leftSection={<IconHistory size={16} />} disabled>Histórico</Button>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container>
            <Modal opened={modalOpened} onClose={closeModal} title={`Movimentar Estoque: ${selectedProduct?.name}`}>
                <Tabs defaultValue="entry" onChange={() => setMovementFormData(initialMovementFormData)}>
                    <Tabs.List>
                        <Tabs.Tab value="entry">Entrada</Tabs.Tab>
                        <Tabs.Tab value="exit">Saída</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="entry" pt="md">
                        <Select label="Tipo de Entrada" placeholder="Selecione..." data={entryTypes} onChange={(value) => setMovementFormData(p => ({ ...p, type: value || '' }))} required />
                        <TextInput mt="md" label="Preço de Compra Unitário (R$)" placeholder="R$ 0,00" value={formatCurrency(movementFormData.cost_price)} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ''); setMovementFormData(p => ({ ...p, cost_price: Number(digits) / 100 })); }} required />
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="exit" pt="md">
                        <Select label="Motivo da Saída" placeholder="Selecione..." data={exitTypes} onChange={(value) => setMovementFormData(p => ({ ...p, type: value || '' }))} required />
                    </Tabs.Panel>
                </Tabs>

                <NumberInput mt="md" label="Quantidade" value={movementFormData.quantity} onChange={(value) => setMovementFormData(p => ({ ...p, quantity: Number(value) || 0 }))} min={1} allowDecimal={false} thousandSeparator="." decimalSeparator="," required />
                <Textarea mt="md" label="Observações (Opcional)" ref={notesRef} autosize minRows={2} />
                <Group justify="flex-end" mt="xl">
                    <Button onClick={handleSaveMovement} loading={isSaving}>Registrar</Button>
                </Group>
            </Modal>

            <Group justify="space-between" my="lg">
                <Title order={1}>Gestão de Estoque</Title>
            </Group>

            <TextInput label="Buscar Produto" placeholder="Digite o nome ou SKU para buscar automaticamente..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Produto</Table.Th><Table.Th>SKU</Table.Th>
                        <Table.Th>Estoque Atual</Table.Th><Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows.length > 0 ? rows : (
                        <Table.Tr><Table.Td colSpan={4} align="center">Nenhum produto encontrado.</Table.Td></Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            <Group justify="center" mt="xl">
                <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
            </Group>
        </Container>
    );
}

export default StockPage;