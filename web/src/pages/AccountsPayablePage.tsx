import { useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Pagination, Group, Badge, TextInput, Menu, ActionIcon, Modal, Button, NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconDotsVertical, IconCash, IconPlus, IconPencil, IconTrash, IconFileExport } from '@tabler/icons-react';
import api from '../api/axios';
import type { AccountPayable } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'paid': return { color: 'green', label: 'Pago' };
        case 'partially_paid': return { color: 'orange', label: 'Pago Parcial' };
        case 'overdue': return { color: 'red', label: 'Vencido' };
        case 'pending':
        default:
            return { color: 'yellow', label: 'Pendente' };
    }
};

function AccountsPayablePage() {
    const [payables, setPayables] = useState<AccountPayable[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');    
    const [crudModalOpened, { open: openCrudModal, close: closeCrudModal }] = useDisclosure(false);
    const [paymentModalOpened, { open: openPaymentModal, close: closePaymentModal }] = useDisclosure(false);    
    const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const crudForm = useForm({
        initialValues: { description: '', supplier: '', total_amount: 0, due_date: new Date() },
        validate: {
            description: (value) => (value.trim().length < 3 ? 'Descrição muito curta.' : null),
            total_amount: (value) => (value > 0 ? null : 'O valor deve ser maior que zero.'),
            due_date: (value) => (value ? null : 'A data de vencimento é obrigatória.'),
        },
    });

    const paymentForm = useForm({
        initialValues: { paid_amount: 0, paid_at: new Date() },
        validate: {
            paid_amount: (value) => (value > 0 ? null : 'O valor pago deve ser maior que zero.'),
            paid_at: (value) => (value ? null : 'A data do pagamento é obrigatória.'),
        },
    });

    const fetchPayables = useCallback((page: number, search: string) => {
        api.get('/accounts-payable', { params: { page, search } }).then(res => {
            setPayables(res.data.data);
            setTotalPages(res.data.last_page);
        });
    }, []);

    useEffect(() => {
        fetchPayables(activePage, searchQuery);
    }, [activePage, searchQuery, fetchPayables]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setActivePage(1);
            setSearchQuery(searchTerm);
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);
    
    const handleOpenCreateModal = () => { setEditingPayable(null); crudForm.reset(); openCrudModal(); };
    const handleOpenEditModal = (payable: AccountPayable) => {
        setEditingPayable(payable);
        crudForm.setValues({
            description: payable.description,
            supplier: payable.supplier || '',
            total_amount: payable.total_amount,
            due_date: new Date(payable.due_date),
        });
        openCrudModal();
    };

    const handleSubmit = (values: typeof crudForm.values) => {
        const promise = editingPayable
            ? api.put(`/accounts-payable/${editingPayable.id}`, values)
            : api.post('/accounts-payable', values);
        promise.then(() => {
            closeCrudModal();
            fetchPayables(activePage, searchQuery);
            notifications.show({ title: 'Sucesso!', message: 'Conta a pagar salva com sucesso.', color: 'green' });
        }).catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível salvar a conta.', color: 'red'}));
    };
    
    const handleDelete = (id: number) => {
        if(window.confirm('Tem certeza que deseja excluir esta conta?')) {
            api.delete(`/accounts-payable/${id}`).then(() => {
                fetchPayables(activePage, searchQuery);
                notifications.show({ title: 'Sucesso', message: 'Conta a pagar excluída.', color: 'green' });
            });
        }
    };

    const handleOpenPaymentModal = (payable: AccountPayable) => {
        setEditingPayable(payable);
        const remaining = payable.total_amount - payable.paid_amount;
        paymentForm.setValues({ paid_amount: remaining > 0 ? remaining : 0, paid_at: new Date() });
        openPaymentModal();
    };

    const handlePaymentSubmit = (values: typeof paymentForm.values) => {
        if (!editingPayable) return;
        api.post(`/accounts-payable/${editingPayable.id}/register-payment`, values).then((res) => {
            setPayables(current => current.map(item => item.id === editingPayable.id ? res.data : item));
            closePaymentModal();
            notifications.show({ title: 'Sucesso!', message: 'Pagamento registrado.', color: 'green' });
        });
    };

    const handleExport = () => {
        setIsExporting(true);
        api.get('/accounts-payable/export', { responseType: 'blob' })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contas-a-pagar.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        })
        .finally(() => setIsExporting(false));
    };

    const rows = payables.map((item) => {
        const statusInfo = getStatusInfo(item.status);
        return (
            <Table.Tr key={item.id}>
                <Table.Td>{item.description}</Table.Td>
                <Table.Td>{item.supplier || 'N/A'}</Table.Td>
                <Table.Td>{formatCurrency(item.total_amount)}</Table.Td>
                <Table.Td>{formatCurrency(item.paid_amount)}</Table.Td>
                <Table.Td>{new Date(item.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Table.Td>
                <Table.Td><Badge color={statusInfo.color}>{statusInfo.label}</Badge></Table.Td>
                <Table.Td>
                    <Menu shadow="md" width={200}>
                        <Menu.Target><ActionIcon variant="subtle"><IconDotsVertical size={16} /></ActionIcon></Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconCash size={14} />} onClick={() => handleOpenPaymentModal(item)} disabled={item.status === 'paid'}>Registrar Pagamento</Menu.Item>
                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleOpenEditModal(item)}>Editar</Menu.Item>
                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(item.id)}>Excluir</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Container>
            <Modal opened={crudModalOpened} onClose={closeCrudModal} title={editingPayable ? 'Editar Conta' : 'Nova Conta a Pagar'}>
                <form onSubmit={crudForm.onSubmit(handleSubmit)}>
                    <TextInput label="Descrição" placeholder="Ex: Aluguel do Escritório" required {...crudForm.getInputProps('description')} />
                    <TextInput label="Fornecedor / Credor" placeholder="Ex: Imobiliária Silva" mt="md" {...crudForm.getInputProps('supplier')} />
                    <NumberInput label="Valor Total" mt="md" required decimalScale={2} fixedDecimalScale thousandSeparator="." decimalSeparator="," prefix="R$ " {...crudForm.getInputProps('total_amount')} />
                    <DatePickerInput label="Data de Vencimento" mt="md" required valueFormat="DD/MM/YYYY" {...crudForm.getInputProps('due_date')} />
                    <Group justify="flex-end" mt="lg">
                        <Button variant="default" onClick={closeCrudModal}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </Group>
                </form>
            </Modal>

            <Modal opened={paymentModalOpened} onClose={closePaymentModal} title={`Registrar Pagamento - #${editingPayable?.id}`}>
                <form onSubmit={paymentForm.onSubmit(handlePaymentSubmit)}>
                    <NumberInput label="Valor Pago" required decimalScale={2} fixedDecimalScale thousandSeparator="." decimalSeparator="," prefix="R$ " {...paymentForm.getInputProps('paid_amount')} />
                    <DatePickerInput label="Data do Pagamento" mt="md" required valueFormat="DD/MM/YYYY" {...paymentForm.getInputProps('paid_at')} />
                    <Group justify="flex-end" mt="lg">
                        <Button variant="default" onClick={closePaymentModal}>Cancelar</Button>
                        <Button type="submit">Salvar Pagamento</Button>
                    </Group>
                </form>
            </Modal>
            
            <Group justify="space-between" mb="xl">
                <Title order={1}>Contas a Pagar</Title>
                <Group>
                    <Button onClick={handleExport} loading={isExporting} color="green" leftSection={<IconFileExport size={16} />}>Exportar</Button>
                    <Button onClick={handleOpenCreateModal} leftSection={<IconPlus size={16}/>}>Adicionar Despesa</Button>
                </Group>
            </Group>

            <TextInput label="Buscar" placeholder="Digite a descrição ou fornecedor..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Descrição</Table.Th>
                        <Table.Th>Fornecedor</Table.Th>
                        <Table.Th>Valor Total</Table.Th>
                        <Table.Th>Valor Pago</Table.Th>
                        <Table.Th>Vencimento</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{payables.length > 0 ? rows : <Table.Tr><Table.Td colSpan={7} align="center">Nenhuma conta a pagar encontrada.</Table.Td></Table.Tr>}</Table.Tbody>
            </Table>
            
            <Group justify="center" mt="xl">
                <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
            </Group>
        </Container>
    );
}

export default AccountsPayablePage;