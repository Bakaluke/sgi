import { Container, Title, Paper, Tabs, TextInput, PasswordInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';

const formatPhone = (phone: string = '') => {
  const cleaned = phone.replace(/\D/g, '').substring(0, 11);
  const length = cleaned.length;
  if (length <= 2) return `(${cleaned}`;
  if (length <= 6) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
  if (length <= 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

function ProfilePage() {
    const { user, login, logout } = useAuth();

    const profileForm = useForm({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        },
        validate: {
            name: (value) => (value.trim().length < 2 ? 'O nome deve ter pelo menos 2 caracteres' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'E-mail inválido'),
        }
    });

    const passwordForm = useForm({
        initialValues: { current_password: '', password: '', password_confirmation: '' },
        validate: {
            password: (val) => (val.length < 8 ? 'A nova senha deve ter pelo menos 8 caracteres' : null),
            password_confirmation: (val, values) => (val !== values.password ? 'As senhas não conferem' : null),
        }
    });

    const handleProfileUpdate = (values: typeof profileForm.values) => {
        api.post('/user/profile', values)
            .then(res => {
                const updatedUser = res.data;
                login(updatedUser, localStorage.getItem('authToken') || '');
                notifications.show({ title: 'Sucesso!', message: 'Perfil atualizado.', color: 'green'});
            })
            .catch(error => {
                const message = error.response?.data?.message || 'Não foi possível atualizar o perfil.';
                notifications.show({ title: 'Erro!', message, color: 'red'});
            });
    };
    
    const handlePasswordUpdate = (values: typeof passwordForm.values) => {
        api.put('/user/password', values)
            .then(() => {
                passwordForm.reset();
                notifications.show({ title: 'Sucesso!', message: 'Senha atualizada. Faça seu acesso novamente!', color: 'green'});
                setTimeout(() => {
                    logout();
                }, 1500);
            })
            .catch(error => {
                const message = error.response?.data?.errors?.current_password?.[0] || 'Não foi possível atualizar a senha.';
                notifications.show({ title: 'Erro!', message, color: 'red'});
            });
    };

    return (
        <Container>
            <Title order={1} mb="xl">Meu Perfil</Title>
            <Paper withBorder p="lg">
                <Tabs defaultValue="profile">
                    <Tabs.List>
                        <Tabs.Tab value="profile">Dados Pessoais</Tabs.Tab>
                        <Tabs.Tab value="password">Alterar Senha</Tabs.Tab>
                    </Tabs.List>
                    
                    <Tabs.Panel value="profile" pt="md">
                        <form onSubmit={profileForm.onSubmit(handleProfileUpdate)}>
                            <TextInput label="Nome" required {...profileForm.getInputProps('name')} />
                            <TextInput label="E-mail" type="email" required mt="md" {...profileForm.getInputProps('email')} />
                            <TextInput label="Telefone" placeholder="(XX) XXXXX-XXXX" mt="md" value={formatPhone(profileForm.values.phone || '')} onChange={(event) => profileForm.setFieldValue('phone', event.currentTarget.value.replace(/\D/g, ''))} error={profileForm.errors.phone} />
                            <Group justify="flex-end" mt="lg"><Button type="submit">Salvar Alterações</Button></Group>
                        </form>
                    </Tabs.Panel>

                    <Tabs.Panel value="password" pt="md">
                        <form onSubmit={passwordForm.onSubmit(handlePasswordUpdate)}>
                            <PasswordInput label="Senha Atual" required {...passwordForm.getInputProps('current_password')} />
                            <PasswordInput label="Nova Senha" required mt="md" {...passwordForm.getInputProps('password')} />
                            <PasswordInput label="Confirmar Nova Senha" required mt="md" {...passwordForm.getInputProps('password_confirmation')} />
                            <Group justify="flex-end" mt="lg"><Button type="submit">Alterar Senha</Button></Group>
                        </form>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Container>
    );
}

export default ProfilePage;