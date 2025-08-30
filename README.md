# SGI Cake Web Dev - Sistema de Gestão Integrado

Um Sistema de Gestão Integrado (ERP/CRM) moderno, construído do zero com uma stack full-stack, projetado para ser flexível e atender às necessidades de pequenas e médias empresas. Este projeto, desenvolvido como parte do portfólio da **Cake Web Dev**, demonstra a criação de uma aplicação robusta, segura e com uma experiência de usuário rica.

O sistema foi modelado para ser altamente customizável, com um foco inicial nas necessidades de uma **gráfica**, lidando com produtos físicos, serviços e um fluxo de produção completo.

---

## ✨ Funcionalidades Principais

O SGI conta com um conjunto completo de módulos integrados para gerenciar as operações de um negócio do início ao fim.

### 🔑 **Autenticação & Permissões Dinâmicas**
- Sistema de login seguro com autenticação via API (Laravel Sanctum).
- **Sistema de Funções e Permissões** dinâmico (baseado em Spatie), permitindo que o administrador crie novos cargos (ex: "Gerente") e defina permissões granulares para cada ação no sistema (ver/criar/editar/deletar produtos, etc.).

### 📊 **Dashboard Inteligente**
- Painel de controle inicial com visão geral do negócio através de gráficos.
- As estatísticas e gráficos se adaptam automaticamente ao perfil do usuário logado:
  - **Admin:** Visão completa de todos os dados da empresa.
  - **Vendedor:** Foco em seus próprios orçamentos e pedidos.
  - **Produção:** Foco no andamento das ordens de produção.

### 📦 **Módulo de Produtos**
- CRUD completo para **produtos físicos** (com plano de expansão para serviços).
- Gestão de **Categorias de Produtos**, permitindo uma organização refinada do catálogo.
- Suporte para upload de **imagem de mostruário** por produto.
- Lógica de busca "live" (com debounce) e paginação em todas as listagens.

### 👥 **Módulo de Clientes**
- CRUD completo para clientes (Pessoa Física e Jurídica).
- Formulário inteligente com busca automática de dados de CNPJ e CEP via API externa (BrasilAPI).
- Arquitetura com múltiplos endereços por cliente para maior escalabilidade.

### 📝 **Módulo de Orçamentos**
- Fluxo de criação moderno via modal, ágil e intuitivo.
- Edição "ao vivo" na tabela de itens, com recálculo automático de totais e margem de lucro.
- Geração de **PDFs profissionais** e customizados com os dados e logo da empresa.
- Campos de **Status, Forma de Pagamento, Forma de Entrega e Origem da Negociação** totalmente customizáveis pelo administrador.
- Lista de orçamentos com linha expansível para visualização rápida dos itens.

### 🏭 **Módulo de Produção**
- Geração **automática** de Ordens de Produção a partir de orçamentos com status "Aprovado".
- Tela dedicada para a equipe de produção gerenciar o fluxo de trabalho.
- Gestão de **Status de Produção** customizáveis pelo administrador.
- Visualização rápida dos itens de cada ordem de produção.

### 📈 **Módulo de Estoque**
- Sistema de **movimentações de estoque** para rastreabilidade total (entradas e saídas).
- **Baixa de estoque automática** em vendas aprovadas.
- Formulário dedicado para registro de novas entradas (compras) e saídas manuais (perdas, defeitos).
- Atualização automática do **preço de custo** do produto baseada na última compra.
- Sistema de **estorno** para corrigir movimentações incorretas de forma segura e auditável.

### 👤 **Módulo de Usuários e Perfil**
- Painel completo para o administrador gerenciar os funcionários (CRUD de usuários).
- Atribuição de Funções customizáveis para cada usuário.
- Página de **"Meu Perfil"** para que cada usuário possa alterar suas próprias informações e senha.

### ⚙️ **Módulo de Configurações (Painel do Admin)**
- Painel de Controle do Admin com interface de abas para gerenciar:
  - **Dados da Empresa:** Informações de contato e upload de logotipo.
  - **Funções & Permissões:** CRUD completo para criar e editar cargos e definir o que cada um pode fazer.
  - **Ajustes do Orçamento:** CRUDs para gerenciar as opções de Status, Pagamento, Entrega e Origem da Negociação.
  - **Ajustes da Produção:** CRUD para gerenciar os Status do fluxo de produção.

---

## 💻 Stack Tecnológica

- **Backend (API):**
  - Laravel 11
  - PHP 8.2+
  - Laravel Sanctum (Autenticação)
  - Spatie Laravel Permission (Papéis e Permissões)
  - `barryvdh/laravel-dompdf` (Geração de PDFs)
  - MySQL

- **Frontend (Web):**
  - React 18+
  - Vite
  - TypeScript
  - Mantine UI (Biblioteca de Componentes)
  - Mantine Charts
  - Mantine Form
  - React Router
  - Axios

- **Ambiente:**
  - Laragon (para Windows)
  - Git & GitHub (Versionamento)

---

## 🚀 Como Rodar o Projeto Localmente

**Pré-requisitos:** [Laragon](https://laragon.org/download/) (ou outro ambiente com PHP 8.2+, Composer e Node.js) e Git.

1.  **Clonar o Repositório:**
    ```bash
    git clone [https://github.com/CakeWebDev/sgi-cakewebdev.git](https://github.com/CakeWebDev/sgi-cakewebdev.git)
    cd sgi-cakewebdev
    ```

2.  **Configurar o Backend (API):**
    ```bash
    # Navegar para a pasta da API
    cd api

    # Instalar dependências
    composer install

    # Criar o arquivo de ambiente e gerar a chave
    copy .env.example .env
    php artisan key:generate

    # No arquivo .env, configure sua conexão com o banco de dados (MySQL)

    # Criar as tabelas e popular com dados de teste
    php artisan migrate:fresh --seed

    # Criar o link simbólico para os arquivos públicos
    php artisan storage:link
    
    # Iniciar o servidor da API
    php artisan serve
    ```

3.  **Configurar o Frontend (Web):**
    ```bash
    # Abrir um NOVO terminal e navegar para a pasta web
    cd web

    # Instalar dependências
    npm install

    # Criar o arquivo de ambiente
    # (Se não existir, crie um .env a partir do .env.example se houver, ou crie um .env novo)
    # Adicione a linha: VITE_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
    
    # Iniciar o servidor de desenvolvimento
    npm run dev
    ```

4.  **Acessar e Testar:**
    * O frontend estará disponível em `http://localhost:5173` (ou outra porta).
    * Use os usuários de teste (ex: `admin@sgi.test`) com a senha `password`.

---

## 🍰 Sobre a Cake Web Dev

Este projeto foi desenvolvido com dedicação pela **Cake Web Dev** como parte do nosso portfólio de soluções de software customizadas. Ele demonstra nossa capacidade de construir aplicações full-stack complexas, seguras e com foco na experiência do usuário.