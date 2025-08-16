import { useState } from 'react';
import api from '../api/axios';
import { Container, Title, TextInput, Button, Paper, PasswordInput, Alert } from '@mantine/core';
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
        message: 'Login realizado com sucesso.',
        color: 'green',
      });
      navigate('/dashboard');
    })
    .catch(err => {
      console.error('Erro no login:', err);
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
    });
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Bem-vindo!</Title>
      <Title ta="center" order={4}>Faça seu acesso para continuar</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          {error && (<Alert withCloseButton onClose={() => setError('')} title="Erro de Autenticação" color="red" icon={<IconAlertCircle />}>{error}</Alert>)}
          <TextInput label="E-mail" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required mt="md" />
          <PasswordInput label="Senha" placeholder="Sua senha" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required mt="md" />
          <Button type="submit" fullWidth mt="xl">Entrar</Button>
        </form>
      </Paper>
    </Container>
  );
}

export default LoginPage;