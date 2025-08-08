import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Title, Container, Button, Modal, TextInput, Group, Tooltip, Select, Loader, Grid, Pagination } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconTrash, IconPlus, IconSearch } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { notifications } from '@mantine/notifications';

interface Address {
  id?: number;
  type?: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

interface Customer {
  id: number;
  type: 'fisica' | 'juridica';
  document: string;
  name: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  addresses: Address[];
}

type CustomerFormData = Omit<Customer, 'id' | 'addresses'> & {
  address: Omit<Address, 'id' | 'type' | 'customer_id'>;
};

const formatDocument = (doc: string = '') => {
  const cleaned = doc.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
  }
  return cleaned.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);
};

const formatPhone = (phone: string = '') => {
  const cleaned = phone.replace(/\D/g, '').substring(0, 11);
  const length = cleaned.length;
  if (length <= 2) return `(${cleaned}`;
  if (length <= 6) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
  if (length <= 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

function CustomerPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isCnpjLoading, setIsCnpjLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialFormData: CustomerFormData = {
    type: 'fisica', document: '', name: '', legal_name: null, email: '', phone: '',
    address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
  };

  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

  const fetchCustomers = useCallback((page: number, search: string) => {
    api.get('/customers', {
      params: { page, search }
    }).then(response => {
      setCustomers(response.data.data);
      setTotalPages(response.data.last_page);
    }).catch(error => console.error('Houve um erro ao buscar os clientes!', error));
  }, []);

  useEffect(() => {
    fetchCustomers(activePage, searchQuery);
  }, [activePage, searchQuery, fetchCustomers]);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setActivePage(1);
      setSearchQuery(searchTerm);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  
  const handleCepBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setIsCepLoading(true);
    axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`)
      .then(response => {
        const { street, neighborhood, city, state } = response.data;
        setFormData(prev => ({
          ...prev,
          address: { ...prev.address, street, neighborhood, city, state },
        }));
      })
      .catch(error => console.error("Erro ao buscar CEP", error))
      .finally(() => setIsCepLoading(false));
  };

  const handleDocumentBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (formData.type !== 'juridica') return;
    const cnpj = event.target.value.replace(/\D/g, '');
    if (cnpj.length !== 14) return;

    setIsCnpjLoading(true);
    axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
      .then(response => {
        const { 
          nome_fantasia, razao_social, 
          ddd_telefone_1, email, complemento,
          cep, logradouro, numero, bairro, municipio, uf 
        } = response.data;
        
        setFormData(prev => ({
          ...prev,
          name: nome_fantasia || prev.name,
          legal_name: razao_social || prev.legal_name,
          phone: ddd_telefone_1 ? ddd_telefone_1.replace(/\D/g, '') : prev.phone,
          email: email || prev.email,
          address: {
            ...prev.address,
            cep: cep?.replace(/\D/g, '') || prev.address.cep,
            street: logradouro || prev.address.street,
            number: numero || prev.address.number,
            complement: complemento || prev.address.complement,
            neighborhood: bairro || prev.address.neighborhood,
            city: municipio || prev.address.city,
            state: uf || prev.address.state,
          }
        }));
      })
      .catch(error => {
          console.error("Erro ao buscar CNPJ", error);
          alert('CNPJ não encontrado ou inválido.');
      })
      .finally(() => setIsCnpjLoading(false));
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData(initialFormData);
    open();
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    const primaryAddress = customer.addresses?.[0] || initialFormData.address;
    setFormData({
      type: customer.type,
      document: customer.document,
      name: customer.name,
      legal_name: customer.legal_name,
      email: customer.email,
      phone: customer.phone,
      address: primaryAddress,
    });
    open();
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const promise = editingCustomer
    ? api.put(`/customers/${editingCustomer.id}`, formData)
    : api.post('/customers', formData);
    promise.then(() => {
      fetchCustomers(activePage, searchQuery);
      close();
      notifications.show({
        title: 'Sucesso!',
        message: `Cliente ${editingCustomer ? 'atualizado' : 'cadastrado'} com sucesso.`,
        color: 'green',
      });
    }).catch(error => {
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join('\n');
        notifications.show({
          title: 'Erro de Validação',
          message: errorMessages,
          color: 'red',
        });
      } else {
        console.error('Erro ao salvar cliente!', error);
        notifications.show({
          title: 'Erro!',
          message: 'Não foi possível salvar o cliente. Ocorreu um erro inesperado.',
          color: 'red',
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      api.delete(`/customers/${id}`)
      .then(() => {
        setCustomers(current => current.filter(c => c.id !== id)); 
        notifications.show({
          title: 'Sucesso!',
          message: `Cliente #${id} foi excluído.`,
          color: 'green',
        });
        fetchCustomers(activePage, searchQuery);
      })
      .catch(error => {
        console.error(`Houve um erro ao excluir o cliente ${id}!`, error);
        notifications.show({
          title: 'Erro!',
          message: 'Não foi possível excluir o cliente.',
          color: 'red',
        });
      });
    }
  };
  
  const rows = customers.map((customer) => (
    <Table.Tr key={customer.id}>
      <Table.Td>{customer.id}</Table.Td>
      <Table.Td>{customer.name}</Table.Td>
      <Table.Td>{customer.document ? formatDocument(customer.document) : 'N/A'}</Table.Td>
      <Table.Td>{customer.email}</Table.Td>
      <Table.Td>{customer.phone ? formatPhone(customer.phone) : 'N/A'}</Table.Td>
      <Table.Td>
        {user && (
          <Group>
            {['admin', 'vendedor', 'producao'].includes(user.role) && (
              <Tooltip label="Editar Cliente"><Button variant="light" color="blue" size="xs" onClick={() => handleOpenEditModal(customer)}><IconPencil size={16} /></Button></Tooltip>
            )}
            {user.role === 'admin' && (
              <Tooltip label="Excluir Cliente"><Button variant="light" color="red" size="xs" onClick={() => handleDelete(customer.id)}><IconTrash size={16} /></Button></Tooltip>
            )}
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container>
      <Modal opened={opened} onClose={close} title={editingCustomer ? 'Editar Cliente' : 'Adicionar Novo Cliente'} size="xl">
        <form onSubmit={handleFormSubmit}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}><Select label="Tipo de Cliente" value={formData.type} onChange={(value) => setFormData(p => ({ ...p, type: value as 'fisica' | 'juridica', document: '' }))} data={[{ value: 'fisica', label: 'Pessoa Física' }, { value: 'juridica', label: 'Pessoa Jurídica' }]} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label={formData.type === 'fisica' ? 'CPF' : 'CNPJ'} value={formatDocument(formData.document)} onChange={(e) => setFormData(p => ({ ...p, document: e.target.value.replace(/\D/g, '') }))} required onBlur={handleDocumentBlur} rightSection={isCnpjLoading ? <Loader size="xs" /> : null} /></Grid.Col>
            <Grid.Col span={12}><TextInput label={formData.type === 'fisica' ? 'Nome Completo' : 'Nome Fantasia'} value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required /></Grid.Col>
            {formData.type === 'juridica' && (<Grid.Col span={12}><TextInput label="Razão Social" value={formData.legal_name || ''} onChange={(e) => setFormData(p => ({ ...p, legal_name: e.target.value }))} required /></Grid.Col>)}
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="E-mail" type="email" value={formData.email || ''} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Telefone" placeholder="(XX) XXXXX-XXXX" value={formatPhone(formData.phone || '')} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} maxLength={15} required /></Grid.Col>
            
            <Grid.Col span={12}><Title order={5} mt="md">Endereço Principal</Title></Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="CEP" value={formData.address.cep} onChange={(e) => setFormData(p => ({...p, address: {...p.address, cep: e.target.value.replace(/\D/g, '')}}))} onBlur={handleCepBlur} rightSection={isCepLoading ? <Loader size="xs" /> : null} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}><TextInput label="Rua / Logradouro" value={formData.address.street} onChange={(e) => setFormData(p => ({...p, address: {...p.address, street: e.target.value}}))} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Número" value={formData.address.number} onChange={(e) => setFormData(p => ({...p, address: {...p.address, number: e.target.value}}))} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}><TextInput label="Complemento" value={formData.address.complement || ''} onChange={(e) => setFormData(p => ({...p, address: {...p.address, complement: e.target.value}}))} /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}><TextInput label="Bairro" value={formData.address.neighborhood} onChange={(e) => setFormData(p => ({...p, address: {...p.address, neighborhood: e.target.value}}))} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}><TextInput label="Cidade" value={formData.address.city} onChange={(e) => setFormData(p => ({...p, address: {...p.address, city: e.target.value}}))} required /></Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}><TextInput label="UF" value={formData.address.state} onChange={(e) => setFormData(p => ({...p, address: {...p.address, state: e.target.value}}))} required /></Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="lg"><Button type="submit">Salvar</Button></Group>
        </form>
      </Modal>

      <Group justify="space-between" my="lg">
        <Title order={1}>Gestão de Clientes</Title>
        {user && ['admin', 'vendedor', 'producao'].includes(user.role) && (
          <Button onClick={handleOpenCreateModal} leftSection={<IconPlus size={16} />}>Adicionar Cliente</Button>
        )}
      </Group>

      <TextInput label="Buscar Cliente" placeholder="Digite o nome, documento ou e-mail..." value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} leftSection={<IconSearch size={16} />} mb="md" />
      
      <Table>
        <Table.Thead>
            <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Documento</Table.Th>
                <Table.Th>E-mail</Table.Th>
                <Table.Th>Telefone</Table.Th>
                <Table.Th>Ações</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows.length > 0 ? ( rows ) : ( 
          <Table.Tr>
            <Table.Td colSpan={5} align="center">Nenhum cliente encontrado.</Table.Td>
          </Table.Tr>
        )}</Table.Tbody>
      </Table>

      <Group justify="center" mt="xl">
        <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
      </Group>
    </Container>
  );
}

export default CustomerPage;