import { AppShell, Burger, Group, NavLink, Button, Title, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, NavLink as RouterNavLink } from 'react-router-dom';
import { IconHome, IconUsers, IconPackage, IconLogout, IconFileInvoice, IconTools, IconSettings } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }} footer={{ height: 40 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={4}>SGI - by Cake Web Dev</Title>
          <Group>
            <Title order={5}>Olá, {user?.name}</Title>
            <Button variant="light" size="xs" onClick={logout} leftSection={<IconLogout size={14}/>}>Sair</Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" component={RouterNavLink} to="/dashboard" leftSection={<IconHome size="1rem" />} />
        {user && ['admin', 'vendedor'].includes(user.role) && (<NavLink label="Orçamentos" component={RouterNavLink} to="/quotes" leftSection={<IconFileInvoice size="1rem" />} />)}
        <NavLink label="Produção" component={RouterNavLink} to="/production" leftSection={<IconTools size="1rem" />} />
        <NavLink label="Produtos" component={RouterNavLink} to="/products" leftSection={<IconPackage size="1rem" />} />
        <NavLink label="Clientes" component={RouterNavLink} to="/customers" leftSection={<IconUsers size="1rem" />} />
        {user && ['admin'].includes(user.role) && (<NavLink label="Configurações" component={RouterNavLink} to="/settings" leftSection={<IconSettings size="1rem" />} />)}
      </AppShell.Navbar>

      <AppShell.Footer p="xs" style={{ background: 'var(--mantine-color-body)' }}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed"></Text>
          <Text size="xs" c="dimmed">SGI &copy; {new Date().getFullYear()} Feito com ❤️ por Cake Web Dev.</Text>
        </Group>
      </AppShell.Footer>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}