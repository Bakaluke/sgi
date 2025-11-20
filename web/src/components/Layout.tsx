import { useEffect } from 'react';
import { AppShell, Burger, Group, NavLink, Title, Text, Menu, Avatar, Tooltip, Button, Center, ActionIcon } from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IconHome, IconUsers, IconLogout, IconSettings, IconLayoutSidebarLeftCollapse, IconFileDescription, IconBuildingFactory, IconBox, IconBuildingWarehouse, IconBusinessplan, IconReportAnalytics, IconUser, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const NAVBAR_WIDTH_OPEN = 280;
const NAVBAR_WIDTH_COLLAPSED = 80;

export function Layout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopCollapsed, setDesktopCollapsed] = useLocalStorage({
    key: 'sgi-sidebar-collapsed',
    defaultValue: false,
  })
  const { logout, user, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.company_fantasy_name) {
      document.title = `${settings.company_fantasy_name} - SGI by Drav Dev`;
    }
  }, [settings]);

  const navItems = [
    { label: 'Dashboard', icon: IconHome, path: '/' },
    { label: 'Orçamentos', icon: IconFileDescription, path: '/quotes', permission: 'quotes.view' },
    { label: 'Produção', icon: IconBuildingFactory, path: '/production', permission: 'production_orders.view' },
    { label: 'Produtos', icon: IconBox, path: '/products', permission: 'products.view' },
    { label: 'Estoque', icon: IconBuildingWarehouse, path: '/stock', permission: 'stock.manage' },
    { label: 'Clientes', icon: IconUsers, path: '/customers', permission: 'customers.view' },
    { label: 'Relatórios', icon: IconReportAnalytics, path: '/reports', permission: 'reports.view' },
    { label: 'Financeiro', icon: IconBusinessplan, path: '/finance', permission: 'finance.view_receivables',
      children: [
        { label: 'Contas a Receber', path: '/accounts-receivable', permission: 'finance.view_receivables' },
        { label: 'Contas a Pagar', path: '/accounts-payable', permission: 'finance.view_payables' },
      ]
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const RenderNavItem = (item: any) => {
      if (item.permission && !can(item.permission)) return null;
      const hasChildren = item.children && item.children.length > 0;
      
      const linkContent = (
        <NavLink
            key={item.path}
            label={desktopCollapsed ? null : item.label}
            leftSection={<item.icon size={20} stroke={1.5} />}
            active={isActive(item.path)}
            defaultOpened={hasChildren && isActive(item.path)}
            onClick={() => {
                if (!hasChildren) {
                    navigate(item.path);
                    if (mobileOpened) toggleMobile();
                } else if (desktopCollapsed) {
                    setDesktopCollapsed(false);
                }
            }}
            variant="filled"
            color="blue"
        >
            {!desktopCollapsed && hasChildren && item.children.map((child: any) => (
                (child.permission && !can(child.permission)) ? null : (
                    <NavLink
                        key={child.path}
                        label={child.label}
                        active={location.pathname === child.path}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(child.path);
                            if (mobileOpened) toggleMobile();
                        }}
                    />
                )
            ))}
        </NavLink>
      );

      if (desktopCollapsed) {
        return (
            <Tooltip label={item.label} position="right" key={item.path} transitionProps={{ duration: 0 }}>
                {linkContent}
            </Tooltip>
        );
      }

      return linkContent;
  };

  return (
    <AppShell header={{ height: 60 }} navbar={{
        width: desktopCollapsed ? NAVBAR_WIDTH_COLLAPSED : NAVBAR_WIDTH_OPEN,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }} footer={{ height: 40 }} padding="md" styles={{
          navbar: { transition: 'width 0.3s ease' },
          main: { transition: 'padding-left 0.3s ease', background: '#f8f9fa' }
      }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          {settings?.logo_path ? (
                 <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${settings.logo_path}`} alt="Logo" style={{ maxHeight: 40 }} />
            ) : (
                <Title order={3}>{settings?.company_fantasy_name || 'SGI'}</Title>
            )}
            </Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="subtle" color="gray" leftSection={<Avatar src={null} alt={user?.name} radius="xl" color="blue">{user?.name?.charAt(0)}</Avatar>}>
                <Text visibleFrom="xs">{user?.name}</Text>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Minha Conta</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
                Meu Perfil
              </Menu.Item>
              {can('settings.manage') && (
                  <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate('/settings')}>
                    Configurações da Empresa
                  </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={logout}>
                Sair
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
            {navItems.map(item => RenderNavItem(item))}
        </AppShell.Section>

        <AppShell.Section style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '1rem' }}>
            <Group justify={desktopCollapsed ? 'center' : 'flex-end'}>
                <Tooltip label={desktopCollapsed ? "Expandir Menu" : "Recolher Menu"} position="right">
                    <ActionIcon 
                        variant="light" 
                        color="gray" 
                        size="lg" 
                        onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                    >
                        {desktopCollapsed ? <IconLayoutSidebarLeftExpand size={20} /> : <IconLayoutSidebarLeftCollapse size={20} />}
                    </ActionIcon>
                </Tooltip>
            </Group>
            
            {!desktopCollapsed && (
                <Center mt="xs">
                    <Text size="xs" c="dimmed">SGI v1.0 • Drav Dev</Text>
                </Center>
            )}
        </AppShell.Section>
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