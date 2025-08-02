import { AppShell, Burger, Group, NavLink, Button, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, NavLink as RouterNavLink } from 'react-router-dom';
import { IconUsers, IconPackage, IconLogout, IconFileInvoice } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={4}>SGI - Cake Web Dev</Title>
          <Group>
            <Title order={5}>Olá, {user?.name}</Title>
            <Button variant="light" size="xs" onClick={logout} leftSection={<IconLogout size={14}/>}>
              Sair
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {user && ['admin', 'vendedor'].includes(user.role) && (
          <NavLink
          label="Orçamentos"
          component={RouterNavLink}
          to="/quotes"
          leftSection={<IconFileInvoice size="1rem" />}
          />
        )}
        <NavLink
          label="Produtos"
          component={RouterNavLink}
          to="/products"
          leftSection={<IconPackage size="1rem" />}
        />
        <NavLink
          label="Clientes"
          component={RouterNavLink}
          to="/customers"
          leftSection={<IconUsers size="1rem" />}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}