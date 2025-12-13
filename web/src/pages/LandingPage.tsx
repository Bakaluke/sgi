import { Container, Title, Text, Button, Group, SimpleGrid, ThemeIcon, rem, List, Image, Box } from '@mantine/core';
import { IconCheck, IconPrinter, IconFileInvoice, IconBuildingWarehouse, IconUsers, IconChartDots, IconDeviceLaptop } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'; 

const features = [
  {
    icon: IconFileInvoice,
    title: 'Orçamentos em Segundos',
    description: 'Chega de planilhas. Gere orçamentos complexos com cálculo de margem, envio por e-mail e PDF automático.',
  },
  {
    icon: IconPrinter,
    title: 'Controle de Produção',
    description: 'Acompanhe cada etapa, da arte final à entrega. Saiba exatamente o que está em impressão, acabamento ou expedido.',
  },
  {
    icon: IconBuildingWarehouse,
    title: 'Estoque Inteligente',
    description: 'Baixa automática de insumos ao aprovar pedidos. Nunca mais deixe faltar papel ou tinta na sua gráfica.',
  },
  {
    icon: IconUsers,
    title: 'CRM e Clientes',
    description: 'Histórico completo de pedidos, arquivos e negociações de cada cliente. Fidelize com atendimento profissional.',
  },
  {
    icon: IconChartDots,
    title: 'Relatórios Gerenciais',
    description: 'Visão clara do financeiro, vendas por período e produtividade da equipe. Tome decisões baseadas em dados.',
  },
  {
    icon: IconDeviceLaptop,
    title: '100% Online e Seguro',
    description: 'Acesse de qualquer lugar. Seus dados estão protegidos na nuvem com backups diários e segurança de ponta.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 50em)');

  const handleContact = () => {
    window.open('https://wa.me/5500000000000?text=Olá, gostaria de conhecer o SGI da DravDev.', '_blank');
  };

  return (
    <Box>
      <div style={{ position: 'relative', height: 600, display: 'flex', alignItems: 'center', backgroundColor: '#000' }}>
        <Image src={HERO_IMAGE} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
        <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: 600 }}>
            <Title style={{ color: '#fff', fontSize: isMobile ? 36 : 62, lineHeight: 1.1, fontWeight: 900, marginBottom: 20 }}>
              A Gestão que sua <span style={{ color: '#4dabf7' }}>Gráfica</span> Precisa.
            </Title>
            <Text size="xl" c="gray.3" mt="xl" mb={40}>
              Centralize orçamentos, produção e estoque em um único sistema. 
              Feito sob medida para gráficas, comunicação visual e bureaus de impressão.
            </Text>
            <Group>
              <Button size="xl" radius="xl" color="blue" onClick={handleContact}>
                Solicitar Demonstração
              </Button>
              <Button size="xl" radius="xl" variant="white" onClick={() => navigate('/login')}>
                Já sou Cliente
              </Button>
            </Group>
          </div>
        </Container>
      </div>

      <Container size="xl" py={80} id="features">
        <Title order={2} ta="center" mt="sm" mb={50}>
          Tudo o que você precisa para crescer
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={50} verticalSpacing={50}>
          {features.map((feature) => (
            <div key={feature.title}>
              <ThemeIcon size={50} radius="md" variant="light" color="blue" mb="md">
                <feature.icon style={{ width: rem(28), height: rem(28) }} stroke={1.5} />
              </ThemeIcon>
              <Text mt="sm" mb={7} fw={700} fz="lg">
                {feature.title}
              </Text>
              <Text size="sm" c="dimmed" lh={1.6}>
                {feature.description}
              </Text>
            </div>
          ))}
        </SimpleGrid>
      </Container>

      <Box bg="gray.0" py={80}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={80}>
            <div>
              <Title order={2} mb="md">Por que escolher o SGI da DravDev?</Title>
              <Text c="dimmed" mb="xl">
                Diferente de sistemas genéricos, nós entendemos a dor do setor gráfico. 
                Sabemos que um milímetro errado ou um atraso na aprovação custa dinheiro.
              </Text>
              <List
                spacing="sm" size="md" center icon={
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCheck style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                <List.Item>Multi-empresa (Gerencie filiais ou franquias)</List.Item>
                <List.Item>Suporte técnico especializado</List.Item>
                <List.Item>Implantação rápida e treinamento incluso</List.Item>
                <List.Item>Atualizações constantes sem custo extra</List.Item>
              </List>
              
              <Button mt={40} size="lg" onClick={handleContact}>Falar com um Consultor Agora</Button>
            </div>
            
            <div style={{ backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <Text ta="center" c="dimmed" fs="italic">
                [Espaço para Print da Tela de Dashboard do SGI]
                <br />
                Mostre a beleza do seu sistema aqui.
              </Text>
            </div>
          </SimpleGrid>
        </Container>
      </Box>
      
      <Box bg="dark.8" c="gray.5" py="xl">
        <Container size="xl">
          <Group justify="space-between" align="center">
            <div>
              <Title order={4} c="white" mb={5}>Drav Dev Tecnologia</Title>
              <Text size="xs">Transformando o mercado gráfico.</Text>
            </div>
            <Group gap="xs">
              <Text size="xs">© 2025 Drav Dev. Todos os direitos reservados.</Text>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}