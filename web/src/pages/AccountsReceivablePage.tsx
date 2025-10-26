import { Fragment, useCallback, useEffect, useState } from 'react';
import { Table, Title, Container, Pagination, Group, Badge, TextInput, ActionIcon, Modal, Button, Collapse, Paper, Text } from '@mantine/core';
import api from '../api/axios';
import type { AccountReceivable, ReceivableInstallment } from '../types';
import { IconCash, IconChevronDown, IconFileExport, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'paid': return { color: 'green', label: 'Pago' };
        case 'partially_paid': return { color: 'orange', label: 'Pago Parcial' };
        case 'overdue': return { color: 'red', label: 'Vencido' };
        case 'pending': default: return { color: 'yellow', label: 'Pendente' };
    }
};

function AccountsReceivablePage() {
    const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentModalOpened, { open: openPaymentModal, close: closePaymentModal }] = useDisclosure(false);
    const [editingInstallment, setEditingInstallment] = useState<ReceivableInstallment | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const paymentForm = useForm({
        initialValues: { paid_at: new Date() },
        validate: { paid_at: (value) => (value ? null : 'A data é obrigatória.') },
    });

    const fetchReceivables = useCallback((page: number, search: string) => {
        api.get('/accounts-receivable', { params: { page, search, with: 'installments,customer,quote' } })
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

    const handleOpenPaymentModal = (installment: ReceivableInstallment) => {
        setEditingInstallment(installment);
        paymentForm.setValues({ paid_at: new Date() });
        openPaymentModal();
    };

    const handlePaymentSubmit = (values: typeof paymentForm.values) => {
        if (!editingInstallment) return;
        api.post(`/receivable-installments/${editingInstallment.id}/register-payment`, values)
        .then((res) => {
            const updatedAccountReceivable = res.data;
            setReceivables(current => current.map(item => item.id === updatedAccountReceivable.id ? updatedAccountReceivable : item));
            closePaymentModal();
            notifications.show({ title: 'Sucesso!', message: 'Pagamento de parcela registrado.', color: 'green' });
        })
        .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível registrar o pagamento.', color: 'red' }));
    };

    const handleExport = () => {
        setIsExporting(true);
        api.get('/accounts-receivable/export', { responseType: 'blob' })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contas-a-receber.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        })
        .finally(() => setIsExporting(false));
    };
    
    const rows = receivables.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        const statusInfo = getStatusInfo(item.status);
        return (
            <Fragment key={item.id}>
                <Table.Tr>
                    <Table.Td>
                        <ActionIcon onClick={() => setExpandedIds(current => isExpanded ? current.filter(id => id !== item.id) : [...current, item.id])}>
                            <IconChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </ActionIcon>
                    </Table.Td>
                    <Table.Td>{item.customer.name}</Table.Td>
                    <Table.Td>{item.quote?.internal_id ?? 'N/A'}</Table.Td>
                    <Table.Td>{formatCurrency(item.total_amount)}</Table.Td>
                    <Table.Td>{formatCurrency(item.paid_amount)}</Table.Td>
                    <Table.Td>{new Date(item.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Table.Td>
                    <Table.Td><Badge color={statusInfo.color}>{statusInfo.label}</Badge></Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td colSpan={9} style={{ padding: 0, border: 0 }}>
                        <Collapse in={isExpanded}>
                            <Paper p="md" bg="gray.0">
                                <Text fw={700} mb="xs">Parcelas</Text>
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Nº</Table.Th>
                                            <Table.Th>Vencimento</Table.Th>
                                            <Table.Th>Valor</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                            <Table.Th>Pago em</Table.Th>
                                            <Table.Th>Ações</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {item.installments.map(installment => {
                                            const instStatus = getStatusInfo(installment.status);
                                            return (
                                                <Table.Tr key={installment.id}>
                                                    <Table.Td>{installment.installment_number}</Table.Td>
                                                    <Table.Td>{new Date(installment.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</Table.Td>
                                                    <Table.Td>{formatCurrency(installment.amount)}</Table.Td>
                                                    <Table.Td><Badge color={instStatus.color}>{instStatus.label}</Badge></Table.Td>
                                                    <Table.Td>{installment.paid_at ? format(new Date(installment.paid_at), 'dd/MM/yyyy') : 'N/A'}</Table.Td>
                                                    <Table.Td><Button size="xs" variant="light" leftSection={<IconCash size={14}/>} onClick={() => handleOpenPaymentModal(installment)} disabled={installment.status === 'paid'}>Confirmar Pagamento</Button></Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
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
            <Modal opened={paymentModalOpened} onClose={closePaymentModal} title={`Confirmar Pagamento da Parcela #${editingInstallment?.installment_number}`}>
                <Text>Confirmar o pagamento de {formatCurrency(editingInstallment?.amount || 0)}?</Text>
                <form onSubmit={paymentForm.onSubmit(handlePaymentSubmit)}>
                    <DatePickerInput label="Data do Pagamento" placeholder="Selecione a data" valueFormat="DD/MM/YYYY" mt="md" required {...paymentForm.getInputProps('paid_at')} />
                    <Group justify="flex-end" mt="lg">
                        <Button variant="default" onClick={closePaymentModal}>Cancelar</Button>
                        <Button type="submit" color="green">Confirmar Pagamento</Button>
                    </Group>
                </form>
            </Modal>
            
            <Group justify="space-between" mb="xl">
                <Title order={1}>Contas a Receber</Title>
                <Button onClick={handleExport} loading={isExporting} color="green" leftSection={<IconFileExport size={16} />}>Exportar</Button>
            </Group>
            <TextInput label="Buscar" placeholder="Digite o nome do cliente ou nº do orçamento..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th w={20} />
                        <Table.Th>Cliente</Table.Th>
                        <Table.Th>Orçam. Nº</Table.Th>
                        <Table.Th>Valor Total</Table.Th>
                        <Table.Th>Valor Pago</Table.Th>
                        <Table.Th>Vencimento</Table.Th>
                        <Table.Th>Status</Table.Th>
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
