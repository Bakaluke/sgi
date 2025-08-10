import { useEffect, useState, useRef } from 'react';
import { Container, Title, Paper, Grid, Select, Button, Group, NumberInput, Textarea, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';

interface Product { id: number; name: string; sku: string; }
interface SelectOption { value: string; label: string; }

const initialFormData = {
    product_id: '',
    type: '',
    quantity: 0,
    notes: '',
};

const movementTypes = [
    { value: 'Compra/Reposição', label: 'Entrada: Compra/Reposição' },
    { value: 'Entrada Inicial', label: 'Entrada: Carga Inicial' },
    { value: 'Ajuste Manual - Entrada', label: 'Entrada: Ajuste Manual' },
    { value: 'Perda de Produção', label: 'Saída: Perda de Produção' },
    { value: 'Defeito de Fabricação', label: 'Saída: Defeito de Fabricação' },
    { value: 'Ajuste Manual - Saída', label: 'Saída: Ajuste Manual' },
];

function StockPage() {
    const [formData, setFormData] = useState(initialFormData);
    const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const notesRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setIsSearching(true);
        const searchTimer = setTimeout(() => {
            api.get('/products', { params: { search: productSearch, per_page: 20 } })
                .then(res => {
                    setProductOptions(res.data.data.map((p: Product) => ({ 
                        value: String(p.id), 
                        label: `${p.name} (SKU: ${p.sku})` 
                    })));
                })
                .catch(error => {
                    console.error("Erro ao buscar produtos:", error);
                    notifications.show({
                        title: "Erro de Rede",
                        message: "Não foi possível carregar a lista de produtos.",
                        color: 'red',
                    });
                })
                .finally(() => setIsSearching(false));
        }, 500);
        return () => clearTimeout(searchTimer);
    }, [productSearch]);

    const handleSubmit = () => {
        if (!formData.product_id || !formData.type || !formData.quantity) {
            notifications.show({ title: 'Atenção', message: 'Preencha todos os campos obrigatórios.', color: 'yellow' });
            return;
        }
        const payload = {
            ...formData,
            notes: notesRef.current?.value || '',
        };
        setIsSaving(true);
        api.post('/stock-movements', payload)
            .then(() => {
                notifications.show({ title: 'Sucesso!', message: 'Movimentação registrada.', color: 'green' });
                setFormData(initialFormData);
                setProductSearch('');
                if (notesRef.current) {
                    notesRef.current.value = '';
                }
            })
            .catch(error => {
                const message = error.response?.data?.message || 'Não foi possível registrar a movimentação.';
                notifications.show({ title: 'Erro!', message, color: 'red' });
            })
            .finally(() => setIsSaving(false));
    };

    return (
        <Container>
            <Title order={1} mb="xl">Registrar Movimentação de Estoque</Title>
            <Paper withBorder p="lg">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select label="Tipo de Movimentação" placeholder="Selecione o tipo" data={movementTypes} value={formData.type} onChange={(value) => setFormData(p => ({ ...p, type: value || '' }))} required />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Select label="Produto" placeholder="Digite para buscar..." data={productOptions} value={formData.product_id} onChange={(value) => setFormData(p => ({ ...p, product_id: value || '' }))} searchValue={productSearch} onSearchChange={setProductSearch} searchable required clearable nothingFoundMessage="Nenhum produto encontrado" rightSection={isSearching ? <Loader size="xs" /> : null} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput label="Quantidade" value={formData.quantity} onChange={(value) => setFormData(p => ({ ...p, quantity: Number(value) || 0 }))} min={1} allowDecimal={false} thousandSeparator="." decimalSeparator="," required />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Textarea label="Observações (Opcional)" placeholder="Ex: Compra do Fornecedor X, NF 123..." ref={notesRef} autosize minRows={2} />
                    </Grid.Col>
                </Grid>
                <Group justify="flex-end" mt="xl">
                    <Button onClick={handleSubmit} loading={isSaving}>Registrar Movimentação</Button>
                </Group>
            </Paper>
        </Container>
    );
}

export default StockPage;