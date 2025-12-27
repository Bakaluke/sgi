import { useState } from 'react';
import api from '../api/axios';
import { Container, Title, TextInput, Button, Paper, PasswordInput, Alert, Stack, Text, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    api.post('/login', { email, password })
    .then(response => {
      const { user, token } = response.data;
      login(user, token);
      notifications.show({
        title: `Bem-vindo de volta, ${user.name}!`,
        message: 'Acesso realizado com sucesso.',
        color: 'green',
      });
      navigate('/dashboard');
    })
    .catch(err => {
      console.error('Erro no acesso:', err);
      const backendMessage = err.response?.data?.message;
      if (backendMessage) {
        setError(backendMessage);
        notifications.show({
          title: 'Acesso Negado',
          message: backendMessage,
          color: 'red',
        });
      } else {
        setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      }
    });
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Bem-vindo!</Title>
      <Title ta="center" order={4}>Faça seu acesso para continuar</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          <form onSubmit={handleSubmit}>
            {error && (<Alert withCloseButton onClose={() => setError('')} title="Erro de Autenticação" color="red" icon={<IconAlertCircle />}>{error}</Alert>)}
            <TextInput label="E-mail" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required mt="md" />
            <PasswordInput label="Senha" placeholder="Sua senha" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required mt="md" />
            <Button type="submit" fullWidth mt="xl">Entrar</Button>
          </form>
          <Stack gap={4} align="center">
            <Text size="sm" c="dimmed">Ainda não conhece o SGI?</Text>
            <Group>
              <Button component="a" href="/" variant="light" color="blue" fullWidth>Ver apresentação do sistema</Button>
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default LoginPage;