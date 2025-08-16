import { useEffect } from 'react';
import { AppShell, Burger, Group, NavLink, Title, Text, Menu, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, NavLink as RouterNavLink } from 'react-router-dom';
import { IconHome, IconUsers, IconPackage, IconLogout, IconFileInvoice, IconTools, IconSettings, IconClipboardList, IconUsersGroup, IconUserCircle, IconChevronDown } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    const firstInitial = parts[0].charAt(0);
    if (parts.length > 1) {
        const lastInitial = parts[parts.length - 1].charAt(0);
        return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    return firstInitial.toUpperCase();
};

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout, can } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.company_fantasy_name) {
      document.title = `${settings.company_fantasy_name} - SGI`;
    }
  }, [settings]);

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }} footer={{ height: 40 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3}>{settings?.company_fantasy_name || 'SGI Cake Web Dev'}</Title>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                <Avatar color="blue" radius="xl">{getInitials(user?.name)}</Avatar>
                <Text size="sm" fw={500}>{user?.name}</Text>
                <IconChevronDown size={14} />
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUserCircle size={14} />}component={RouterNavLink} to="/profile">Meu Perfil</Menu.Item>
              {can('users.manage') && (<Menu.Item leftSection={<IconUsersGroup size={14} />} component={RouterNavLink} to="/users">Usuários</Menu.Item>)}
              {can('settings.manage') && (<Menu.Item leftSection={<IconSettings size={14} />} component={RouterNavLink} to="/settings">Configurações</Menu.Item>)}
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={logout}>Sair</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" component={RouterNavLink} to="/dashboard" leftSection={<IconHome size="1rem" />} />
        {can('quotes.view') && (<NavLink label="Orçamentos" component={RouterNavLink} to="/quotes" leftSection={<IconFileInvoice size="1rem" />} />)}
        <NavLink label="Produção" component={RouterNavLink} to="/production" leftSection={<IconTools size="1rem" />} />
        <NavLink label="Produtos" component={RouterNavLink} to="/products" leftSection={<IconPackage size="1rem" />} />
        <NavLink label="Estoque" component={RouterNavLink} to="/stock" leftSection={<IconClipboardList size="1rem" />} />
        <NavLink label="Clientes" component={RouterNavLink} to="/customers" leftSection={<IconUsers size="1rem" />} />
      </AppShell.Navbar>

      <AppShell.Footer p="xs" style={{ background: 'var(--mantine-color-body)' }}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed"></Text>
          <Text size="xs" c="dimmed">{settings?.company_fantasy_name || 'SGI'} &copy; {new Date().getFullYear()} Feito com ❤️ por Cake Web Dev.</Text>
        </Group>
      </AppShell.Footer>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}