import { useEffect, useState } from 'react';
import { Container, Title, Paper, Grid, TextInput, Button, Group, FileInput, Image, Loader, Tabs, Table, ActionIcon, Tooltip, Modal, Checkbox, ColorInput, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconUpload, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import api from '../api/axios';
import axios from 'axios';
import type { SettingsData, Permission, Role, QuoteStatus, ProductionStatus, NegotiationSource, DeliveryMethod, PaymentMethod } from '../types';

const formatCnpj = (cnpj: string = '') => {
    return cnpj
    .replace(/\D/g, '')
    .substring(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPhone = (phone: string = '') => {
    const cleaned = phone.replace(/\D/g, '').substring(0, 11);
    const length = cleaned.length;
    if (length <= 2) return `(${cleaned}`;
    if (length <= 6) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    if (length <= 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

const groupTranslations: { [key: string]: string } = {
    'users': 'Usuários',
    'settings': 'Configurações',
    'products': 'Produtos',
    'customers': 'Clientes',
    'quotes': 'Orçamentos',
    'production_orders': 'Ordens de Produção',
    'stock': 'Estoque',
    'categories': 'Categorias',
};

const permissionTranslations: { [key: string]: string } = {
    'users.manage': 'Gerenciar Usuários',
    'settings.manage': 'Gerenciar Configurações da Empresa',
    'products.view': 'Visualizar Produtos',
    'products.create': 'Criar Produtos',
    'products.edit': 'Editar Produtos',
    'products.delete': 'Excluir Produtos',
    'customers.view': 'Visualizar Clientes',
    'customers.create': 'Criar Clientes',
    'customers.edit': 'Editar Clientes',
    'customers.delete': 'Excluir Clientes',
    'quotes.view': 'Ver próprios Orçamentos',
    'quotes.view_all': 'Ver TODOS os Orçamentos',
    'quotes.create': 'Criar Orçamentos',
    'quotes.edit': 'Editar Orçamentos',
    'quotes.delete': 'Excluir Orçamentos',
    'quotes.approve': 'Aprovar Orçamentos',
    'production_orders.view': 'Ver próprias Ordens de Produção',
    'production_orders.view_all': 'Ver TODAS as Ordens de Produção',
    'production_orders.update_status': 'Atualizar Status da Produção',
    'production_orders.delete': 'Excluir Ordens de Produção',
    'stock.manage': 'Gerenciar Estoque',
    'categories.manage': 'Gerenciar Categorias',
};

function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCnpjLoading, setIsCnpjLoading] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
    const [pmModalOpened, { open: openPmModal, close: closePmModal }] = useDisclosure(false);
    const [dmModalOpened, { open: openDmModal, close: closeDmModal }] = useDisclosure(false);
    const [editingPm, setEditingPm] = useState<PaymentMethod | null>(null);
    const [editingDm, setEditingDm] = useState<DeliveryMethod | null>(null);
    const [quoteStatuses, setQuoteStatuses] = useState<QuoteStatus[]>([]);
    const [qsModalOpened, { open: openQsModal, close: closeQsModal }] = useDisclosure(false);
    const [editingQs, setEditingQs] = useState<QuoteStatus | null>(null);
    const [productionStatuses, setProductionStatuses] = useState<ProductionStatus[]>([]);
    const [psModalOpened, { open: openPsModal, close: closePsModal }] = useDisclosure(false);
    const [editingPs, setEditingPs] = useState<ProductionStatus | null>(null);
    const [negotiationSources, setNegotiationSources] = useState<NegotiationSource[]>([]);
    const [nsModalOpened, { open: openNsModal, close: closeNsModal }] = useDisclosure(false);
    const [editingNs, setEditingNs] = useState<NegotiationSource | null>(null);
    
    const pmForm = useForm({ initialValues: { name: '' }, validate: { name: (value: string) => (value.trim().length < 2 ? 'O nome é obrigatório.' : null) } });
    const dmForm = useForm({ initialValues: { name: '' }, validate: { name: (value: string) => (value.trim().length < 2 ? 'O nome é obrigatório.' : null) } });
    const qsForm = useForm({ initialValues: { name: '', color: '#868e96' }, validate: { name: (value: string) => (value.trim().length < 2 ? 'O nome é obrigatório.' : null) }, });
    const psForm = useForm({ initialValues: { name: '', color: '#868e96' }, validate: { name: (value: string) => (value.trim().length < 2 ? 'O nome é obrigatório.' : null) }, });
    const nsForm = useForm({ initialValues: { name: '' }, validate: { name: (value: string) => (value.trim().length < 2 ? 'O nome é obrigatório.' : null) } });

    const roleForm = useForm({
        initialValues: { display_name: '', permissions: [] as string[] },
        validate: { display_name: (value: string) => (value.trim().length < 2 ? 'O nome da função é obrigatório.' : null) },
    });

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data));
        api.get('/roles').then(res => setRoles(res.data));
        api.get('/permissions').then(res => setPermissions(res.data));
        fetchPaymentMethods();
        fetchDeliveryMethods();
        fetchQuoteStatuses();
        fetchProductionStatuses();
        fetchNegotiationSources();
    }, []);

    const fetchRoles = () => {
        api.get('/roles').then(res => setRoles(res.data));
    };

    const fetchPaymentMethods = () => {
        api.get('/payment-methods').then(res => setPaymentMethods(res.data));
    };
    
    const fetchDeliveryMethods = () => {
        api.get('/delivery-methods').then(res => setDeliveryMethods(res.data));
    };

    const fetchQuoteStatuses = () => {
        api.get('/quote-statuses').then(res => setQuoteStatuses(res.data));
    };

    const fetchProductionStatuses = () => {
        api.get('/production-statuses').then(res => setProductionStatuses(res.data));
    };
    
    const fetchNegotiationSources = () => {
        api.get('/negotiation-sources').then(res => setNegotiationSources(res.data));
    };
    
    const handleCnpjBlur = () => {
        if (!settings || !settings.cnpj) return;
        
        const cnpj = settings.cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14) return;

        setIsCnpjLoading(true);
        axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
            .then(response => {
                const { razao_social, nome_fantasia, ddd_telefone_1, email, logradouro, numero, bairro, municipio, uf, cep, complemento } = response.data;

                setSettings(prev => prev ? ({
                    ...prev,
                    legal_name: razao_social || prev.legal_name,
                    company_fantasy_name: nome_fantasia || prev.company_fantasy_name,
                    phone: ddd_telefone_1 || prev.phone,
                    email: email || prev.email,
                    cep: cep?.replace(/\D/g, '') || prev.cep,
                    street: logradouro || prev.street,
                    number: numero || prev.number,
                    complement: complemento || prev.complement,
                    neighborhood: bairro || prev.neighborhood,
                    city: municipio || prev.city,
                    state: uf || prev.state,
                }) : null);

                notifications.show({ title: 'Sucesso!', message: 'Dados da empresa encontrados.', color: 'teal' });
            })
            .catch(() => notifications.show({ title: 'Aviso', message: 'CNPJ não encontrado na base de dados pública.', color: 'yellow' }))
            .finally(() => setIsCnpjLoading(false));
    };

    const handleCepBlur = () => {
        if (!settings || !settings.cep) return;
        const cep = settings.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setIsCepLoading(true);
        axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`)
            .then(response => {
                const { street, neighborhood, city, state } = response.data;
                setSettings(prev => prev ? ({
                    ...prev,
                    street: street || prev.street,
                    neighborhood: neighborhood || prev.neighborhood,
                    city: city || prev.city,
                    state: state || prev.state,
                }) : null);
            })
            .catch(() => notifications.show({ title: 'Aviso', message: 'CEP não encontrado.', color: 'yellow' }))
            .finally(() => setIsCepLoading(false));
    };

    const handleSave = () => {
        if (!settings) return;
        setIsSaving(true);
        
        const formDataToSubmit = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            if (key !== 'logo_path' && value !== null) {
                formDataToSubmit.append(key, value);
            }
        });

        if (logoFile) {
            formDataToSubmit.append('logo', logoFile);
        }

        api.post('/settings', formDataToSubmit, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
            setSettings(res.data);
            setLogoFile(null);
            notifications.show({ title: 'Sucesso!', message: 'Configurações salvas.', color: 'green' });
        })
        .catch(() => notifications.show({ title: 'Erro!', message: 'Não foi possível salvar as configurações.', color: 'red' }))
        .finally(() => setIsSaving(false));
    };

    const handleOpenCreateRoleModal = () => {
        setEditingRole(null); roleForm.reset(); openModal();
    };

    const handleOpenEditRoleModal = (role: Role) => {
        setEditingRole(role);
        roleForm.setValues({
            display_name: role.display_name,
            permissions: role.permissions.map(p => p.name),
        });
        openModal();
    };

    const handleRoleSubmit = (values: { display_name: string, permissions: string[] }) => {
        const promise = editingRole
            ? api.put(`/roles/${editingRole.id}`, values)
            : api.post('/roles', values);
        promise.then(() => {
            closeModal();
            notifications.show({ title: 'Sucesso!', message: `Função ${editingRole ? 'atualizada' : 'criada'}.`, color: 'green' });
            fetchRoles();
        }).catch(error => {
            const message = error.response?.data?.message || 'Não foi possível salvar a função.';
            notifications.show({ title: 'Erro!', message, color: 'red' });
        });
    };
    
    const handleRoleDelete = (role: Role) => {
        if (window.confirm(`Tem certeza que deseja apagar a função "${role.name}"?`)) {
            api.delete(`/roles/${role.id}`).then(() => {
                notifications.show({ title: 'Sucesso', message: 'Função excluída.', color: 'green' });
                fetchRoles();
            });
        }
    };

    const handleOpenCreatePmModal = () => {
        setEditingPm(null);
        pmForm.reset();
        openPmModal();
    };

    const handleOpenEditPmModal = (pm: PaymentMethod) => {
        setEditingPm(pm);
        pmForm.setValues({ name: pm.name });
        openPmModal();
    };

    const handlePmSubmit = (values: { name: string }) => {
        const promise = editingPm ? api.put(`/payment-methods/${editingPm.id}`, values) : api.post('/payment-methods', values);
        promise.then(() => {
            closePmModal();
            notifications.show({ title: 'Sucesso!', message: `Forma de pagamento salva.`, color: 'green' });
            fetchPaymentMethods();
        });
    };

    const handlePmDelete = (id: number) => {
        if (window.confirm('Tem certeza?'))
            api.delete(`/payment-methods/${id}`)
        .then(() => {
            notifications.show({ title: 'Sucesso', message: 'Excluído.', color: 'green' });
            fetchPaymentMethods();
        })
        .catch(error => {
            const message = error.response?.data?.message || 'Não foi possível excluir.';
            notifications.show({ title: 'Ação Bloqueada', message: message, color: 'red' });
        })
    };

    const handleOpenCreateDmModal = () => {
        setEditingDm(null); dmForm.reset();
        openDmModal();
    };

    const handleOpenEditDmModal = (dm: DeliveryMethod) => {
        setEditingDm(dm);
        dmForm.setValues({ name: dm.name });
        openDmModal();
    };

    const handleDmSubmit = (values: { name: string }) => {
        const promise = editingDm ? api.put(`/delivery-methods/${editingDm.id}`, values) : api.post('/delivery-methods', values);
        promise.then(() => {
            closeDmModal();
            notifications.show({ title: 'Sucesso!', message: `Forma de entrega salva.`, color: 'green' });
            fetchDeliveryMethods();
        });
    };

    const handleDmDelete = (id: number) => {
        if (window.confirm('Tem certeza?'))
            api.delete(`/delivery-methods/${id}`)
        .then(() => {
            notifications.show({ title: 'Sucesso', message: 'Excluído.', color: 'green' });
            fetchDeliveryMethods();
        })
        .catch(error => {
            const message = error.response?.data?.message || 'Não foi possível excluir.';
            notifications.show({ title: 'Ação Bloqueada', message: message, color: 'red' });
        })
    };

    const handleOpenCreateQsModal = () => {
        setEditingQs(null); qsForm.reset();
        openQsModal();
    };

    const handleOpenEditQsModal = (qs: QuoteStatus) => {
        setEditingQs(qs);
        qsForm.setValues({ name: qs.name, color: qs.color });
        openQsModal();
    };

    const handleQsSubmit = (values: {name: string, color: string }) => {
        const promise = editingQs ? api.put(`/quote-statuses/${editingQs.id}`, values) : api.post('/quote-statuses', values);
        promise.then(() => {
            closeQsModal();
            notifications.show({ title: 'Sucesso!', message: 'Status salvo.', color: 'green' });
            fetchQuoteStatuses();
        });
    };

    const handleQsDelete = (id: number) => {
        if (window.confirm('Tem certeza?'))
            api.delete(`/quote-statuses/${id}`)
        .then(() => {
            notifications.show({ title: 'Sucesso', message: 'Excluído.', color: 'green' });
            fetchQuoteStatuses();
        })
        .catch(error => {
            const message = error.response?.data?.message || 'Não foi possível excluir.';
            notifications.show({ title: 'Ação Bloqueada', message: message, color: 'red' });
        })
    };

    const handleOpenCreatePsModal = () => {
        setEditingPs(null);
        psForm.reset();
        openPsModal();
    };

    const handleOpenEditPsModal = (ps: ProductionStatus) => {
        setEditingPs(ps);
        psForm.setValues({ name: ps.name, color: ps.color });
        openPsModal();
    };

    const handlePsSubmit = (values: { name: string, color: string }) => {
        const promise = editingPs ? api.put(`/production-statuses/${editingPs.id}`, values) : api.post('/production-statuses', values);
        promise.then(() => {
            closePsModal();
            notifications.show({ title: 'Sucesso!', message: 'Status salvo.', color: 'green' });
            fetchProductionStatuses();
        });
    };

    const handlePsDelete = (id: number) => {
        if (window.confirm('Tem certeza?'))
            api.delete(`/production-statuses/${id}`)
        .then(() => {
            notifications.show({ title: 'Sucesso', message: 'Excluído.', color: 'green' });
            fetchProductionStatuses();
        })
        .catch(error => {
            const message = error.response?.data?.message || 'Não foi possível excluir.';
            notifications.show({ title: 'Ação Bloqueada', message: message, color: 'red' });
        })
    };

    const handleOpenCreateNsModal = () => {
        setEditingNs(null);
        nsForm.reset(); openNsModal();
    };

    const handleOpenEditNsModal = (ns: NegotiationSource) => {
        setEditingNs(ns);
        nsForm.setValues({ name: ns.name });
        openNsModal();
    };

    const handleNsSubmit = (values: { name: string }) => {
        const promise = editingNs ? api.put(`/negotiation-sources/${editingNs.id}`, values) : api.post('/negotiation-sources', values);
        promise.then(() => {
            closeNsModal();
            notifications.show({ title: 'Sucesso!', message: 'Origem salva.', color: 'green' });
            fetchNegotiationSources();
        });
    };
    
    const handleNsDelete = (id: number) => {
        if (window.confirm('Tem certeza?'))
            api.delete(`/negotiation-sources/${id}`)
        .then(() => {
            notifications.show({ title: 'Sucesso', message: 'Excluído.', color: 'green' });
            fetchNegotiationSources();
        })
        .catch(error => {
            const message = error.response?.data?.message || 'Não foi possível excluir.';
            notifications.show({ title: 'Ação Bloqueada', message: message, color: 'red' });
        })
    };
    
    const roleRows = roles.map((role) => (
        <Table.Tr key={role.id}>
            <Table.Td fw={700}>{role.display_name}</Table.Td>
            <Table.Td style={{ maxWidth: '400px', whiteSpace: 'normal' }}>
                {role.permissions.map(p => permissionTranslations[p.name] || p.name).join(', ')}
            </Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Tooltip label="Editar Função"><ActionIcon variant="light" color="blue" onClick={() => handleOpenEditRoleModal(role)}><IconPencil size={16} /></ActionIcon></Tooltip>
                    <Tooltip label="Excluir Função"><ActionIcon variant="light" color="red" onClick={() => handleRoleDelete(role)}><IconTrash size={16} /></ActionIcon></Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));
    
    const groupedPermissions = permissions.reduce((acc, p) => {
        const [group] = p.name.split('.');
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (!settings) {
        return <Container><Title>Carregando...</Title></Container>;
    }
    
    const logoUrl = settings.logo_path ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${settings.logo_path}` : null;
    
    return (
        <Container>
            <Title order={1} mb="xl">Configurações do Sistema</Title>

            <Tabs defaultValue="company">
                <Tabs.List>
                    <Tabs.Tab value="company">Dados da Empresa</Tabs.Tab>
                    <Tabs.Tab value="roles">Funções & Permissões</Tabs.Tab>
                    <Tabs.Tab value="quote_data">Ajustes de Orçamento</Tabs.Tab>
                    <Tabs.Tab value="productions">Ajustes da Produção</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="company" pt="md">
                    <Paper withBorder p="lg">
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 8 }}>
                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="CNPJ" value={formatCnpj(settings.cnpj)} onChange={(e) => setSettings({...settings, cnpj: e.currentTarget.value})} onBlur={handleCnpjBlur} rightSection={isCnpjLoading ? <Loader size="xs" /> : null} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Nome Fantasia" value={settings.company_fantasy_name} onChange={(e) => setSettings({...settings, company_fantasy_name: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={12}><TextInput label="Razão Social" value={settings.legal_name} onChange={(e) => setSettings({...settings, legal_name: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Telefone" value={formatPhone(settings.phone)} onChange={(e) => setSettings({...settings, phone: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="E-mail de Contato" value={settings.email} onChange={(e) => setSettings({...settings, email: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Site" placeholder="https://www.suaempresa.com" value={settings.website || ''} onChange={(e) => setSettings({...settings, website: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={12}><Title order={5} mt="sm">Endereço</Title></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="CEP" value={settings.cep} onChange={(e) => setSettings({...settings, cep: e.currentTarget.value})} onBlur={handleCepBlur} rightSection={isCepLoading ? <Loader size="xs" /> : null} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 8 }}><TextInput label="Rua / Logradouro" value={settings.street} onChange={(e) => setSettings({...settings, street: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Número" value={settings.number} onChange={(e) => setSettings({...settings, number: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 8 }}><TextInput label="Complemento" value={settings.complement || ''} onChange={(e) => setSettings({...settings, complement: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 5 }}><TextInput label="Bairro" value={settings.neighborhood} onChange={(e) => setSettings({...settings, neighborhood: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 5 }}><TextInput label="Cidade" value={settings.city} onChange={(e) => setSettings({...settings, city: e.currentTarget.value})} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 2 }}><TextInput label="UF" value={settings.state} onChange={(e) => setSettings({...settings, state: e.currentTarget.value})} /></Grid.Col>
                                </Grid>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Title order={5} mb="xs">Logotipo</Title>
                                {logoUrl && <Image radius="md" h={120} w="auto" fit="contain" src={logoUrl} mb="md" />}
                                <FileInput label="Alterar logotipo" placeholder="Escolha uma imagem" leftSection={<IconUpload size={14} />} value={logoFile} onChange={setLogoFile} accept="image/png,image/jpeg" />
                            </Grid.Col>
                        </Grid>
                        <Group justify="flex-end" mt="xl"><Button onClick={handleSave} loading={isSaving}>Salvar Configurações</Button></Group>
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="roles" pt="md">
                    <Modal opened={modalOpened} onClose={closeModal} title={editingRole ? 'Editar Função' : 'Nova Função'} size="lg">
                        <form onSubmit={roleForm.onSubmit(handleRoleSubmit)}>
                            <TextInput label={editingRole ? "Nome da Função" : "Nome da Função (Ex: Gerente)"} required {...roleForm.getInputProps('display_name')} />
                            <Title order={5} mt="lg" mb="sm">Permissões</Title>
                            <Checkbox.Group {...roleForm.getInputProps('permissions')}>
                                <Grid>
                                    {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                                        <Grid.Col span={{ base: 12, md: 4 }} key={groupName}>
                                            <Paper withBorder p="sm">
                                                <Title order={6} mb="xs" style={{textTransform: 'capitalize'}}>{groupTranslations[groupName] || groupName}</Title>
                                                {perms.map(p => <Checkbox key={p.name} value={p.name} label={permissionTranslations[p.name] || p.name} mb="xs" />)}
                                            </Paper>
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            </Checkbox.Group>
                            <Group justify="flex-end" mt="lg"><Button type="submit">Salvar Função</Button></Group>
                        </form>
                    </Modal>

                    <Group justify="flex-end" mb="md">
                        <Button onClick={handleOpenCreateRoleModal} leftSection={<IconPlus size={16}/>}>Adicionar Função</Button>
                    </Group>
                    
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Função</Table.Th>
                                <Table.Th>Permissões</Table.Th>
                                <Table.Th>Ações</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{roleRows}</Table.Tbody>
                    </Table>
                </Tabs.Panel>

                <Tabs.Panel value="quote_data" pt="md">
                    <Tabs defaultValue="payment">
                        <Tabs.List>
                            <Tabs.Tab value="payment">Formas de Pagamento</Tabs.Tab>
                            <Tabs.Tab value="delivery">Formas de Entrega</Tabs.Tab>
                            <Tabs.Tab value="statuses">Status do Orçamento</Tabs.Tab>
                            <Tabs.Tab value="sources">Origens da Negociação</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="payment" pt="md">
                            <Modal opened={pmModalOpened} onClose={closePmModal} title={editingPm ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}>
                                <form onSubmit={pmForm.onSubmit(handlePmSubmit)}>
                                    <TextInput label="Nome" required {...pmForm.getInputProps('name')} />
                                    <Group justify="flex-end" mt="lg"><Button type="submit">Salvar</Button></Group>
                                </form>
                            </Modal>

                            <Group justify="flex-end" mb="md">
                                <Button onClick={handleOpenCreatePmModal} leftSection={<IconPlus size={16}/>}>Adicionar</Button>
                            </Group>

                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Nome</Table.Th>
                                        <Table.Th w={120}>Ações</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{paymentMethods.map(pm => (
                                    <Table.Tr key={pm.id}>
                                        <Table.Td>{pm.name}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon onClick={() => handleOpenEditPmModal(pm)}><IconPencil size={16}/></ActionIcon>
                                                <ActionIcon color="red" onClick={() => handlePmDelete(pm.id)}><IconTrash size={16}/></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>))}
                                </Table.Tbody>
                            </Table>
                        </Tabs.Panel>

                        <Tabs.Panel value="delivery" pt="md">
                             <Modal opened={dmModalOpened} onClose={closeDmModal} title={editingDm ? 'Editar Forma de Entrega' : 'Nova Forma de Entrega'}>
                                <form onSubmit={dmForm.onSubmit(handleDmSubmit)}>
                                    <TextInput label="Nome" required {...dmForm.getInputProps('name')} />
                                    <Group justify="flex-end" mt="lg"><Button type="submit">Salvar</Button></Group>
                                </form>
                            </Modal>
                            <Group justify="flex-end" mb="md"><Button onClick={handleOpenCreateDmModal} leftSection={<IconPlus size={16}/>}>Adicionar</Button></Group>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Nome</Table.Th>
                                        <Table.Th w={120}>Ações</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{deliveryMethods.map(dm => (
                                    <Table.Tr key={dm.id}>
                                        <Table.Td>{dm.name}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon onClick={() => handleOpenEditDmModal(dm)}><IconPencil size={16}/></ActionIcon>
                                                <ActionIcon color="red" onClick={() => handleDmDelete(dm.id)}><IconTrash size={16}/></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>))}
                                </Table.Tbody>
                            </Table>
                        </Tabs.Panel>

                        <Tabs.Panel value="statuses" pt="md">
                            <Modal opened={qsModalOpened} onClose={closeQsModal} title={editingQs ? 'Editar Status' : 'Novo Status'}>
                                <form onSubmit={qsForm.onSubmit(handleQsSubmit)}>
                                    <TextInput label="Nome do Status" required {...qsForm.getInputProps('name')} />
                                    <ColorInput label="Cor do Status" placeholder="Escolha uma cor" mt="md" {...qsForm.getInputProps('color')} />
                                    <Group justify="flex-end" mt="lg"><Button type="submit">Salvar</Button></Group>
                                </form>
                            </Modal>
                            <Group justify="flex-end" mb="md"><Button onClick={handleOpenCreateQsModal} leftSection={<IconPlus size={16}/>}>Adicionar Status</Button></Group>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Nome</Table.Th>
                                        <Table.Th>Cor</Table.Th>
                                        <Table.Th w={120}>Ações</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{quoteStatuses.map(qs => (
                                    <Table.Tr key={qs.id}>
                                        <Table.Td>{qs.name}</Table.Td>
                                        <Table.Td><Badge color={qs.color} size="lg" /></Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon onClick={() => handleOpenEditQsModal(qs)}><IconPencil size={16}/></ActionIcon>
                                                <ActionIcon color="red" onClick={() => handleQsDelete(qs.id)}><IconTrash size={16}/></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                                </Table.Tbody>
                            </Table>
                        </Tabs.Panel>

                        <Tabs.Panel value="sources" pt="md">
                            <Modal opened={nsModalOpened} onClose={closeNsModal} title={editingNs ? 'Editar Origem' : 'Nova Origem'}>
                                <form onSubmit={nsForm.onSubmit(handleNsSubmit)}>
                                    <TextInput label="Nome" required {...nsForm.getInputProps('name')} />
                                    <Group justify="flex-end" mt="lg"><Button type="submit">Salvar</Button></Group>
                                </form>
                            </Modal>
                            <Group justify="flex-end" mb="md"><Button onClick={handleOpenCreateNsModal} leftSection={<IconPlus size={16}/>}>Adicionar</Button></Group>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Nome</Table.Th>
                                        <Table.Th w={120}>Ações</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{negotiationSources.map(ns => (
                                    <Table.Tr key={ns.id}>
                                        <Table.Td>{ns.name}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon onClick={() => handleOpenEditNsModal(ns)}><IconPencil size={16}/></ActionIcon>
                                                <ActionIcon color="red" onClick={() => handleNsDelete(ns.id)}><IconTrash size={16}/></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>))}
                                </Table.Tbody>
                            </Table>
                        </Tabs.Panel>
                    </Tabs>
                </Tabs.Panel>

                <Tabs.Panel value="productions" pt="md">
                    <Tabs defaultValue="statuses">
                        <Tabs.List>
                            <Tabs.Tab value="statuses">Status da Produção</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="statuses" pt="md">
                            <Modal opened={psModalOpened} onClose={closePsModal} title={editingPs ? 'Editar Status' : 'Novo Status'}>
                                <form onSubmit={psForm.onSubmit(handlePsSubmit)}>
                                    <TextInput label="Nome do Status" required {...psForm.getInputProps('name')} />
                                    <ColorInput label="Cor do Status" placeholder="Escolha uma cor" mt="md" {...psForm.getInputProps('color')} />
                                    <Group justify="flex-end" mt="lg"><Button type="submit">Salvar</Button></Group>
                                </form>
                            </Modal>
                            <Group justify="flex-end" mb="md"><Button onClick={handleOpenCreatePsModal} leftSection={<IconPlus size={16}/>}>Adicionar Status</Button></Group>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Nome</Table.Th>
                                        <Table.Th>Cor</Table.Th>
                                        <Table.Th w={120}>Ações</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{productionStatuses.map(ps => (
                                    <Table.Tr key={ps.id}>
                                        <Table.Td>{ps.name}</Table.Td>
                                        <Table.Td><Badge color={ps.color} size="lg" /></Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon onClick={() => handleOpenEditPsModal(ps)}><IconPencil size={16}/></ActionIcon>
                                                <ActionIcon color="red" onClick={() => handlePsDelete(ps.id)}><IconTrash size={16}/></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        </Tabs.Panel>
                    </Tabs>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}

export default SettingsPage;