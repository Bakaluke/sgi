import { useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Pagination, Group, Badge, TextInput, Menu, ActionIcon, Modal, NumberInput, Button } from '@mantine/core';
import api from '../api/axios';
import type { AccountReceivable } from '../types';
import { IconCash, IconDotsVertical, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'paid': return { color: 'green', label: 'Pago' };
        case 'partially_paid': return { color: 'orange', label: 'Pago Parcial' };
        case 'overdue': return { color: 'red', label: 'Vencido' };
        case 'pending':
        default: return { color: 'yellow', label: 'Pendente' };
    }
};

function AccountsReceivablePage() {
    const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpened, { open, close }] = useDisclosure(false);
    const [editingReceivable, setEditingReceivable] = useState<AccountReceivable | null>(null);

    const paymentForm = useForm({
        initialValues: { paid_amount: 0, paid_at: new Date() },
        validate: {
            paid_amount: (value) => (value > 0 ? null : 'O valor deve ser maior que zero.'),
            paid_at: (value) => (value ? null : 'A data é obrigatória.'),
        },
    });

    const fetchReceivables = useCallback((page: number, search: string) => {
        api.get('/accounts-receivable', { params: { page, search } })
           .then(res => {
                setReceivables(res.data.data);
                setTotalPages(res.data.last_page);
           });
    }, []);

    useEffect(() => {
        fetchReceivables(activePage, searchQuery);
    }, [activePage, searchQuery, fetchReceivables]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setActivePage(1);
            setSearchQuery(searchTerm);
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleOpenPaymentModal = (receivable: AccountReceivable) => {
        setEditingReceivable(receivable);
        const remainingAmount = receivable.total_amount - receivable.paid_amount;
        paymentForm.setValues({
            paid_amount: remainingAmount > 0 ? remainingAmount : 0,
            paid_at: new Date(),
        });
        open();
    };

    const handlePaymentSubmit = (values: typeof paymentForm.values) => {
        if (!editingReceivable) return;
        
        api.post(`/accounts-receivable/${editingReceivable.id}/register-payment`, values)
            .then((res) => {
                setReceivables(current => current.map(item => item.id === editingReceivable.id ? res.data : item));
                close();
                notifications.show({ title: 'Sucesso!', message: 'Pagamento registrado.', color: 'green' });
            })
            .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível registrar o pagamento.', color: 'red' }));
    };
    
    const rows = receivables.map((item) => {
        const statusInfo = getStatusInfo(item.status);
        return (
            <Table.Tr key={item.id}>
                <Table.Td>{item.id}</Table.Td>
                <Table.Td>{item.customer.name}</Table.Td>
                <Table.Td>#{item.quote.id}</Table.Td>
                <Table.Td>{formatCurrency(item.total_amount)}</Table.Td>
                <Table.Td>{formatCurrency(item.paid_amount)}</Table.Td>
                <Table.Td>{new Date(item.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Table.Td>
                <Table.Td><Badge color={statusInfo.color}>{statusInfo.label}</Badge></Table.Td>
                <Table.Td>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon variant="subtle">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconCash size={14} />} onClick={() => handleOpenPaymentModal(item)} disabled={item.status === 'paid'} >Registrar Pagamento</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Container>
            <Modal opened={modalOpened} onClose={close} title={`Registrar Pagamento - Cód. #${editingReceivable?.id}`}>
                <form onSubmit={paymentForm.onSubmit(handlePaymentSubmit)}>
                    <NumberInput label="Valor Pago" decimalScale={2} fixedDecimalScale decimalSeparator="," thousandSeparator="." prefix="R$ " required {...paymentForm.getInputProps('paid_amount')} />
                    <DatePickerInput label="Data do Pagamento" placeholder="Selecione a data" valueFormat="DD/MM/YYYY" mt="md" required {...paymentForm.getInputProps('paid_at')} />
                    <Group justify="flex-end" mt="lg">
                        <Button variant="default" onClick={close}>Cancelar</Button>
                        <Button type="submit">Salvar Pagamento</Button>
                    </Group>
                </form>
            </Modal>
            
            <Title order={1} mb="xl">Contas a Receber</Title>
            <TextInput label="Buscar" placeholder="Digite o nome do cliente ou nº do orçamento..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>Cliente</Table.Th>
                        <Table.Th>Orçamento</Table.Th>
                        <Table.Th>Valor Total</Table.Th>
                        <Table.Th>Valor Pago</Table.Th>
                        <Table.Th>Vencimento</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows.length > 0 ? rows : 
                    <Table.Tr>
                        <Table.Td colSpan={8} align="center">Nenhuma conta a receber encontrada.</Table.Td>
                    </Table.Tr>}
                </Table.Tbody>
            </Table>
            
            <Group justify="center" mt="xl">
                <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
            </Group>
        </Container>
    );
}

export default AccountsReceivablePage;