import { useEffect, useState } from 'react';
import { Container, Title, Paper, Grid, TextInput, Button, Group, FileInput, Image, Loader, Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import api from '../api/axios';
import axios from 'axios';

interface SettingsData {
    legal_name: string;
    company_fantasy_name: string;
    cnpj: string;
    email: string;
    phone: string;
    cep: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    logo_path: string | null;
}

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

function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCnpjLoading, setIsCnpjLoading] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data));
    }, []);

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
                    <Tabs.Tab value="roles">Cargos e Funções</Tabs.Tab>
                    <Tabs.Tab value="quotes">Ajustes do Orçamento</Tabs.Tab>
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
                    <Group justify="flex-end" mb="md"></Group>
                </Tabs.Panel>

                <Tabs.Panel value="quotes" pt="md">
                    <Group justify="flex-end" mb="md"></Group>
                </Tabs.Panel>

                <Tabs.Panel value="productions" pt="md">
                    <Group justify="flex-end" mb="md"></Group>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}

export default SettingsPage;