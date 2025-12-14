import { Container, Title, Text, Button, Group, Image, SimpleGrid, ThemeIcon, Card, Badge, List, rem, Stack, Box, ActionIcon } from '@mantine/core';
import { IconCheck, IconRocket, IconAssembly, IconLock, IconDeviceDesktopAnalytics, IconCurrencyReal, IconLayoutKanban, IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  
  const goToLogin = () => navigate('/login');
  
  return (
  <Box>
    <Box bg="var(--mantine-color-gray-9)" c="white" py={120} style={{ position: 'relative', overflow: 'hidden' }}>
      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" ta="center" gap="xl">
          <Badge variant="filled" color="blue" size="lg" radius="xl">Versão 1.5 Lançada 🚀</Badge>
          <Title order={1} style={{ fontSize: rem(64), fontWeight: 900, lineHeight: 1.1 }}>A Revolução na Gestão de <br />
            <Text span inherit variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>Manufatura e Serviços</Text>
          </Title>
          <Text size="xl" maw={600} c="dimmed">Abandone as planilhas. O SGI Drav Dev é a plataforma Multi-Tenant completa para controlar orçamentos, produção e estoque com inteligência e segurança.</Text>
          <Group>
            <Button size="xl" radius="xl" color="blue" onClick={goToLogin} leftSection={<IconRocket />}>Começar Agora</Button>
            <Button size="xl" radius="xl" variant="outline" color="gray" c="white" onClick={() => window.open('https://wa.me/5586995567270', '_blank')}>Falar com Consultor</Button>
          </Group>
          <Box mt={60} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Image src="/assets/lp/1.png" alt="Dashboard SGI" />
          </Box>
        </Stack>
      </Container>
    </Box>
    
    <Container size="lg" py={80}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80} verticalSpacing={80}>
        <Stack justify="center">
          <ThemeIcon size={50} radius="md" variant="light" color="orange"><IconLayoutKanban size={30} /></ThemeIcon>
          <Title order={2}>Vendas Visuais com Kanban</Title>
          <Text c="dimmed" size="lg">Transforme sua lista de orçamentos em um quadro interativo. Arraste cards de "Negociação" para "Aprovado" e veja a mágica acontecer: o sistema valida os dados e dispara a produção automaticamente.</Text>
          <List mt={30} spacing="sm" size="md" icon={ <ThemeIcon color="orange" size={24} radius="xl"> <IconCheck size={16} /></ThemeIcon> }>
            <List.Item>Validação automática de requisitos</List.Item>
            <List.Item>Cálculo instantâneo de lucro</List.Item>
            <List.Item>Geração de O.P. ao aprovar</List.Item>
          </List>
        </Stack>
        <Box style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <Image src="/assets/lp/4.png" alt="Kanban de Vendas" />
        </Box>
        <Box style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <Image src="/assets/lp/7.png" alt="Controle de Estoque" />
        </Box>
        <Stack justify="center">
          <ThemeIcon size={50} radius="md" variant="light" color="green"><IconAssembly size={30} /></ThemeIcon>
          <Title order={2}>Engenharia de Produto & Estoque</Title>
          <Text c="dimmed" size="lg">Defina a "receita" dos seus serviços. Quando uma ordem de produção inicia, o SGI baixa automaticamente as matérias-primas necessárias. Sem erros manuais, sem furos no estoque.</Text>
          <List mt={30} spacing="sm" size="md" icon={ <ThemeIcon color="green" size={24} radius="xl"><IconCheck size={16} /></ThemeIcon> }>
            <List.Item>Composição de produtos (Receita)</List.Item>
            <List.Item>Baixa automática por eventos</List.Item>
            <List.Item>Alertas de estoque mínimo</List.Item>
          </List>
        </Stack>
      </SimpleGrid>
    </Container>
    
    <Box bg="var(--mantine-color-gray-0)" py={80}>
      <Container size="lg">
        <Title order={2} ta="center" mb={60}>Tudo o que sua empresa precisa</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          <FeatureCard icon={IconDeviceDesktopAnalytics} title="Dashboard Executivo" description="Acompanhe vendas, faturamento e produção em tempo real com gráficos intuitivos." color="blue" />
          <FeatureCard icon={IconLock} title="Segurança Multi-Tenant" description="Seus dados isolados. Arquitetura robusta onde cada empresa vê apenas o que é seu." color="red" />
          <FeatureCard icon={IconCurrencyReal} title="Financeiro Integrado" description="Contas a pagar e receber geradas automaticamente a partir dos pedidos." color="green" />
        </SimpleGrid>
      </Container>
    </Box>
    
    <Box bg="blue" c="white" py={100}>
      <Container size="md" ta="center">
        <Title order={1} mb="xl">Pronto para organizar sua empresa?</Title>
        <Text size="xl" mb={40} style={{ opacity: 0.9 }}>Junte-se às empresas que já estão escalando com o SGI Drav Dev.</Text>
        <Button size="xl" variant="white" color="blue" onClick={goToLogin}>Acessar Sistema</Button>
      </Container>
    </Box>
    
    <Box bg="var(--mantine-color-dark-8)" c="dimmed" py="xl">
      <Container size="lg">
        <Group justify="space-between">
          <Text fw={500} c="white">Sistema de Gestão Integrado</Text>
          <Text size="sm">SGI &copy; Drav Dev 2025. Todos os direitos reservados.</Text>
          <Group gap={0} justify="flex-end" wrap="nowrap">
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandTwitter size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandYoutube size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandInstagram size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </Box>
  </Box>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <ThemeIcon size={50} radius="md" variant="light" color={color} mb="md"><Icon size={28} /></ThemeIcon>
      <Text fw={700} size="lg" mb="xs">{title}</Text>
      <Text size="sm" c="dimmed">{description}</Text>
    </Card>
  );
}