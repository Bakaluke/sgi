import { Link } from 'react-router-dom';
import {  Anchor,  BackgroundImage,  Badge,  Box,  Button,  Card,  Container,  Divider,  Grid,  Group,  List,  SimpleGrid,  Stack,  Text,  ThemeIcon,  Title } from '@mantine/core';
import {  IconBriefcase2,  IconBuildingFactory2,  IconBulb,  IconCash,  IconClipboardList,  IconDeviceAnalytics,  IconMail,  IconPrinter,  IconShieldCheck,  IconUsers } from '@tabler/icons-react';

const featureCards = [
  {
    title: 'Orçamentos que fecham mais negócios',
    description:
      'Modelos prontos para o segmento gráfico, cálculo ágil de insumos e histórico de propostas para negociar com segurança.',
    icon: IconClipboardList,
  },
  {
    title: 'Ordens de produção sem gargalos',
    description:
      'Organize etapas, acompanhe status em tempo real e comunique a equipe com avisos automáticos a cada mudança.',
    icon: IconBuildingFactory2,
  },
  {
    title: 'Estoque e compras integrados',
    description:
      'Controle entradas e saídas, reserve insumos para cada OP e evite paradas por falta de material.',
    icon: IconPrinter,
  },
  {
    title: 'Financeiro preparado para o pós-venda',
    description:
      'Fluxos de contas a pagar e receber conectados às vendas e produções, para enxergar margem e prazo em um só lugar.',
    icon: IconCash,
  },
  {
    title: 'Equipe na mesma página',
    description:
      'Cadastre clientes, fornecedores e colaboradores, definindo permissões e trilhas de aprovação conforme sua operação.',
    icon: IconUsers,
  },
  {
    title: 'Indicadores para decisões rápidas',
    description:
      'Dashboards de produtividade, eficiência de materiais e rentabilidade por produto, cliente ou linha de produção.',
    icon: IconDeviceAnalytics,
  },
];

const highlights = [
  'Construído para gráficas e indústrias de impressão.',
  'Fluxo completo: orçamento → OP → estoque → financeiro → relatório.',
  'Hospedagem pronta para uso ou implantação on-premise.',
  'Suporte em português, treinamentos e onboarding guiado.',
];

const workflow = [
  'Receba a demanda do cliente e gere um orçamento profissional em minutos.',
  'Converta em Ordem de Produção com materiais reservados automaticamente.',
  'Acompanhe cada etapa no chão de fábrica com atualizações em tempo real.',
  'Confirme entrega, fature e integre o financeiro com poucos cliques.',
];

function MarketingPage() {
  return (
    <BackgroundImage src="https://images.unsplash.com/photo-1478104718532-efe04cc3ff7f?auto=format&fit=crop&w=1600&q=80" radius="md" style={{ minHeight: '100vh' }}>
      <Box style={{ backdropFilter: 'blur(3px)', background: 'rgba(11, 18, 43, 0.82)', minHeight: '100vh' }}>
        <Container size="lg" py={60}>
          <Group justify="space-between" align="flex-start" mb={40}>
            <Stack gap="sm" maw={720}>
              <Group gap="xs">
                <Badge color="blue" variant="light">SGI para gráficas</Badge>
                <Badge color="grape" variant="light">Versão 1.5</Badge>
              </Group>
              <Title order={1} c="white" style={{ lineHeight: 1.1 }}>
                O sistema feito para quem vive de imprimir, produzir e entregar resultados.
              </Title>
              <Text c="gray.1" size="lg">
                Centralize orçamentos, ordens de produção, estoque, clientes e financeiro em um só lugar.
                O SGI foi desenhado para operações gráficas que precisam de controle, velocidade e previsibilidade.
              </Text>
              <Group>
                <Button size="md" variant="white" component={Link} to="/login">
                  Já sou cliente: acessar o sistema
                </Button>
                <Button
                  size="md"
                  color="yellow"
                  component="a"
                  href="mailto:comercial@sgi.com?subject=Quero%20conhecer%20o%20SGI&body=Conte-nos%20sobre%20sua%20gr%C3%A1fica%20e%20o%20que%20voc%C3%AA%20precisa."
                >
                  Solicitar orçamento
                </Button>
              </Group>
            </Stack>
            <Card shadow="lg" radius="md" p="xl" w={340} bg="rgba(255,255,255,0.9)">
              <Stack gap="md">
                <Group gap="xs">
                  <ThemeIcon color="blue" radius="xl" variant="light">
                    <IconShieldCheck size={20} />
                  </ThemeIcon>
                  <Text fw={600}>Pronto para operação</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  Implante rápido com parametrizações pré-configuradas para gráficas, incluindo centros de custo, tipos de impressão
                  e cadastros de materiais mais usados.
                </Text>
                <Divider />
                <Text size="sm" fw={600}>Benefícios imediatos</Text>
                <List spacing="xs" size="sm" icon={<ThemeIcon color="blue" radius="xl" variant="light"><IconBulb size={16} /></ThemeIcon>}>
                  <List.Item>Visão unificada de pedidos, OPs e estoques.</List.Item>
                  <List.Item>Alertas sobre prazos e uso de materiais.</List.Item>
                  <List.Item>Relatórios prontos para diretoria e clientes.</List.Item>
                </List>
              </Stack>
            </Card>
          </Group>

          <Card radius="md" p="xl" withBorder bg="rgba(255,255,255,0.9)" mb="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {featureCards.map((feature) => (
                <Card key={feature.title} shadow="sm" radius="md" p="lg" withBorder>
                  <Group gap="sm" mb="sm">
                    <ThemeIcon color="blue" size={36} radius="md" variant="light">
                      <feature.icon size={20} />
                    </ThemeIcon>
                    <Text fw={700}>{feature.title}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">{feature.description}</Text>
                </Card>
              ))}
            </SimpleGrid>
          </Card>

          <Grid gutter="lg" mb="xl">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Card radius="md" p="xl" withBorder bg="rgba(255,255,255,0.9)" mb="lg">
                <Group gap="xs" mb="sm">
                  <Badge color="green" variant="light">Fluxo de ponta a ponta</Badge>
                  <ThemeIcon color="green" variant="light" radius="xl"><IconBriefcase2 size={18} /></ThemeIcon>
                </Group>
                <Title order={3}>Metodologia alinhada ao seu dia a dia</Title>
                <Text c="dimmed" mt="sm">
                  Do orçamento à entrega, o SGI espelha os processos que já acontecem na sua gráfica. Sem passos a mais e sem lacunas
                  entre equipes: tudo flui com rastreabilidade, apontamentos de produção e reservas de materiais.
                </Text>
                <List spacing="sm" size="sm" mt="md" icon={<ThemeIcon color="green" radius="xl" variant="light"><IconClipboardList size={16} /></ThemeIcon>}>
                  {workflow.map((step) => (<List.Item key={step}>{step}</List.Item>))}
                </List>
              </Card>

              <Card radius="md" p="xl" withBorder bg="rgba(255,255,255,0.9)">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Title order={4}>Precisa personalizar?</Title>
                    <Text c="dimmed" mt="xs">
                      APIs para integrar com ERP financeiro, BI e e-commerce B2B. Nosso time ajuda a mapear processos e replicar suas
                      regras de negócio no SGI.
                    </Text>
                  </div>
                  <ThemeIcon color="indigo" size={46} radius="md" variant="light">
                    <IconBulb size={24} />
                  </ThemeIcon>
                </Group>
                <Group mt="md">
                  <Button component="a" href="mailto:comercial@sgi.com" leftSection={<IconMail size={16} />}>
                    Falar com o time comercial
                  </Button>
                  <Button variant="light" component={Link} to="/login">
                    Acessar como cliente
                  </Button>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card radius="md" p="xl" withBorder bg="rgba(255,255,255,0.9)">
                <Group gap="xs" mb="sm">
                  <Badge color="orange" variant="light">Suporte dedicado</Badge>
                  <ThemeIcon color="orange" variant="light" radius="xl"><IconShieldCheck size={18} /></ThemeIcon>
                </Group>
                <Title order={4}>Como contratar</Title>
                <Text c="dimmed" mt="xs">
                  Conte sobre o porte da sua gráfica, quantas linhas de produção e usuários ativos. Em seguida, agendamos uma demonstração
                  personalizada e já configuramos seu ambiente piloto.
                </Text>
                <List spacing="sm" size="sm" mt="md" icon={<ThemeIcon color="orange" radius="xl" variant="light"><IconDeviceAnalytics size={16} /></ThemeIcon>}>
                  <List.Item>Implantação assistida com templates de orçamento e OP.</List.Item>
                  <List.Item>Treinamento para equipes comercial, produção e estoque.</List.Item>
                  <List.Item>Monitoramento inicial e acompanhamento de resultados.</List.Item>
                </List>
                <Divider my="md" />
                <Stack gap="xs">
                  <Text fw={600}>Canais de contato</Text>
                  <Anchor href="mailto:comercial@sgi.com" target="_blank" rel="noreferrer">
                    comercial@sgi.com
                  </Anchor>
                  <Anchor href="tel:+5511999999999">+55 (11) 99999-9999</Anchor>
                  <Text size="sm" c="dimmed">Atendimento de segunda a sexta, das 9h às 18h (BRT).</Text>
                  <Button component="a" href="mailto:comercial@sgi.com?subject=Quero%20um%20or%C3%A7amento%20do%20SGI" color="orange" mt="sm">
                    Solicitar orçamento agora
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Card radius="md" p="xl" withBorder bg="rgba(255,255,255,0.9)">
            <Group gap="xs" mb="sm">
              <Badge color="teal" variant="light">Por que escolher o SGI?</Badge>
              <ThemeIcon color="teal" variant="light" radius="xl"><IconPrinter size={18} /></ThemeIcon>
            </Group>
            <Title order={3}>Feito sob medida para gráficas e indústrias de impressão</Title>
            <Text c="dimmed" mt="sm">
              Enquanto ERPs genéricos exigem meses de adaptação, o SGI já nasce falando a língua do seu time: políticas de chapa, cálculo
              de tinta, controle de refugo, apontamento de hora-máquina e rastreabilidade por lote de papel.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
              {highlights.map((item) => (
                <Group key={item} align="flex-start">
                  <ThemeIcon color="teal" radius="xl" variant="light"><IconBulb size={16} /></ThemeIcon>
                  <Text c="dimmed">{item}</Text>
                </Group>
              ))}
            </SimpleGrid>
            <Group mt="lg">
              <Button component={Link} to="/login" color="teal" leftSection={<IconShieldCheck size={16} />}>
                Entrar no sistema
              </Button>
              <Button variant="light" color="teal" component="a" href="mailto:comercial@sgi.com">
                Falar com vendas
              </Button>
            </Group>
          </Card>
        </Container>
      </Box>
    </BackgroundImage>
  );
}

export default MarketingPage;