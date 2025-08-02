import { useEffect, useState, useCallback } from 'react';
import { Table, Title, Container, Button, Modal, TextInput, Textarea, NumberInput, Group, Tooltip, Pagination, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconTrash, IconPlus, IconSearch } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface Product {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    cost_price: number;
    quantity_in_stock: number;
    description?: string;
}

type ProductFormData = Omit<Product, 'id'>;

function ProductPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '', sku: '', description: '', cost_price: 0, sale_price: 0, quantity_in_stock: 0,
    });
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = useCallback((page: number, search: string) => {
        api.get('/products', {
            params: {
                page: page,
                search: search,
            }
        }).then(response => {
            setProducts(response.data.data);
            setTotalPages(response.data.last_page);
        }).catch(error => {
            console.error('Houve um erro ao buscar os produtos!', error);
        });
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

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'cost_price' | 'sale_price') => {
        const digits = event.target.value.replace(/\D/g, '');
        if (digits === '') {
            setFormData(p => ({ ...p, [fieldName]: 0 }));
            return;
        }
        const numericValue = parseInt(digits, 10) / 100;
        setFormData(p => ({ ...p, [fieldName]: numericValue }));
    };

    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        open();
    };

    const handleOpenCreateModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', sku: '', description: '', cost_price: 0, sale_price: 0, quantity_in_stock: 0 });
        open();
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const promise = editingProduct
            ? api.put(`/products/${editingProduct.id}`, formData)
            : api.post('/products', formData);

        promise.then(response => {
            if (editingProduct) {
                setProducts(current => current.map(p => (p.id === editingProduct.id ? response.data : p)));
            } else {
                setProducts(current => [...current, response.data]);
            }
            close();
        }).catch(error => {
            console.error('Erro ao salvar produto!', error);
            if (error.response?.data?.errors) {
                notifications.show({
                    title: 'Erro de Validação',
                    message: 'O Código informado já existe em outro produto. Por favor, verifique os dados.',
                    color: 'red',
                });
            } else {
                notifications.show({
                    title: 'Erro de Validação',
                    message: 'Não foi possível salvar o produto.',
                    color: 'red',
                });
            }
        });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            api.delete(`/products/${id}`)
            .then(() => {
                setProducts(currentProducts => currentProducts.filter(product => product.id !== id));
                notifications.show({
                    title: 'Sucesso',
                    message: `Produto #${id} foi excluído.`,
                    color: 'green',
                });
            }).catch(error => {
                notifications.show({
                    title: 'Erro',
                    message: `Houve um erro ao excluir o produto ${id}!`,
                    color: 'red',
                });
            });
        }
    };

    const rows = products.map((product) => (
        <Table.Tr key={product.id}>
            <Table.Td>{product.id}</Table.Td>
            <Table.Td>{product.name}</Table.Td>
            <Table.Td>{product.sku}</Table.Td>
            <Table.Td>{formatCurrency(product.cost_price)}</Table.Td>
            <Table.Td>{formatCurrency(product.sale_price)}</Table.Td>
            <Table.Td>{product.quantity_in_stock.toLocaleString('pt-BR')}</Table.Td>
            <Table.Td>
                {user && (
                    <Group>
                        {['admin', 'vendedor', 'producao'].includes(user.role) && (
                            <Tooltip label="Editar Produto"><Button variant="light" color="blue" size="xs" onClick={() => handleOpenEditModal(product)}><IconPencil size={16} /></Button></Tooltip>
                        )}
                        {user.role === 'admin' && (
                            <Tooltip label="Excluir Produto"><Button variant="light" color="red" size="xs" onClick={() => handleDelete(product.id)}><IconTrash size={16} /></Button></Tooltip>
                        )}
                    </Group>
                )}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container>
            <Modal opened={opened} onClose={close} title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}>
                <form onSubmit={handleFormSubmit}>
                    <TextInput label="Nome do Produto" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} required />
                    <TextInput label="Código do Produto" value={formData.sku} onChange={(e) => setFormData(p => ({...p, sku: e.target.value}))} required mt="md" />
                    <TextInput label="Preço de Compra" placeholder="R$ 0,00" value={formatCurrency(formData.cost_price)} onChange={(event) => handlePriceChange(event, 'cost_price')} required mt="md" />
                    <TextInput label="Preço de Venda" placeholder="R$ 0,00" value={formatCurrency(formData.sale_price)} onChange={(event) => handlePriceChange(event, 'sale_price')} required mt="md" />
                    <NumberInput label="Quantidade em Estoque" value={formData.quantity_in_stock} required mt="md" onChange={(value) => setFormData(p => ({ ...p, quantity_in_stock: Number(String(value).replace(/\./g, '')) }))} allowDecimal={false} thousandSeparator="." decimalSeparator="," />
                    <Textarea label="Descrição (Opcional)" value={formData.description || ''} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} mt="md" autosize minRows={2} maxRows={4} />
                    <Group justify="flex-end" mt="lg">
                        <Button type="submit">Salvar</Button>
                    </Group>
                </form>
            </Modal>

            <Group justify="space-between" my="lg">
                <Title order={1}>Gestão de Produtos</Title>
                {user && ['admin', 'vendedor', 'producao'].includes(user.role) && (
                    <Button onClick={handleOpenCreateModal} leftSection={<IconPlus size={16} />}>Adicionar Produto</Button>
                )}
            </Group>

            <TextInput label="Buscar Produto" placeholder="Digite o nome ou SKU para buscar automaticamente..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />
            
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Produto</Table.Th>
                        <Table.Th>Código</Table.Th>
                        <Table.Th>Preço de Compra</Table.Th>
                        <Table.Th>Preço de Venda</Table.Th>
                        <Table.Th>Qtd Estoque</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows.length > 0 ? ( rows ) : ( 
                    <Table.Tr>
                        <Table.Td colSpan={7} align="center">Nenhum produto encontrado.</Table.Td>
                    </Table.Tr>
                )}</Table.Tbody>
            </Table>

            <Group justify="center" mt="xl">
                <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
            </Group>
        </Container>
    );
}

export default ProductPage;