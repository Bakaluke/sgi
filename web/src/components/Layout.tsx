import { useEffect, useState } from 'react';
import { AppShell, Burger, Group, NavLink, Title, Text, Menu, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom';
import { IconHome, IconUsers, IconPackage, IconLogout, IconFileInvoice, IconTools, IconSettings, IconClipboardList, IconUsersGroup, IconUserCircle, IconChevronDown, IconCash, IconChartBar } from '@tabler/icons-react';
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
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const [financeMenuOpened, setFinanceMenuOpened] = useState(false);

  useEffect(() => {
    if (settings?.company_fantasy_name) {
      document.title = `${settings.company_fantasy_name} - SGI by Drav Dev`;
    }
  }, [settings]);

  useEffect(() => {
    if (!pathname.startsWith('/financial')) {
      setFinanceMenuOpened(false);
    }
  }, [pathname]);

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }} footer={{ height: 40 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3}>{settings?.company_fantasy_name || 'SGI'}</Title>
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
        {can('reports.view') && (<NavLink label="Relatórios" component={RouterNavLink} to="/reports" leftSection={<IconChartBar size="1rem" />} />)}
        {(can('finance.view_receivables') || can('finance.view_payables')) && (
          <NavLink label="Financeiro" leftSection={<IconCash size="1rem" />} childrenOffset={28} active={pathname.startsWith('/financial')} opened={pathname.startsWith('/financial') || financeMenuOpened} onChange={setFinanceMenuOpened} >
            {can('finance.view_receivables') && <NavLink label="Contas a Receber" component={RouterNavLink} to="/financial/accounts-receivable" />}
            {can('finance.view_payables') && <NavLink label="Contas a Pagar" component={RouterNavLink} to="/financial/accounts-payable" />}
          </NavLink>
        )}
      </AppShell.Navbar>

      <AppShell.Footer p="xs" style={{ background: 'var(--mantine-color-body)' }}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed"></Text>
          <Text size="xs" c="dimmed">{settings?.company_fantasy_name || 'SGI'} &copy; {new Date().getFullYear()} Feito por Drav Dev.</Text>
        </Group>
      </AppShell.Footer>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}