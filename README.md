# SGI Cake Web Dev - Sistema de Gestão Integrado

Um Sistema de Gestão Integrado (ERP/CRM) moderno, construído do zero com uma stack full-stack, projetado para ser flexível e atender às necessidades de pequenas e médias empresas. Este projeto, desenvolvido como parte do portfólio da **Cake Web Dev**, demonstra a criação de uma aplicação robusta, segura e com uma experiência de usuário rica.

O sistema foi modelado para ser altamente customizável, com um foco inicial nas necessidades de uma **gráfica**, lidando com produtos físicos, serviços e um fluxo de produção e financeiro completo.

---

## ✨ Funcionalidades Principais

O SGI conta com um conjunto completo de módulos integrados para gerenciar as operações de um negócio do início ao fim.

### 🔑 **Autenticação & Permissões Dinâmicas**
- Sistema de login seguro com autenticação via API (Laravel Sanctum).
- **Sistema de Funções e Permissões** dinâmico (baseado em Spatie), permitindo que o administrador crie novos cargos e defina permissões granulares para cada ação no sistema.

### 📊 **Dashboard Inteligente e Interativo**
- Painel de controle com visão geral do negócio, incluindo KPIs financeiros, gráficos de performance e alertas operacionais (ex: estoque baixo, orçamentos parados).
- Filtros de período de tempo interativos para análise de dados.
- Gráficos e dados se adaptam automaticamente ao perfil do usuário logado.

### 📦 **Módulo de Produtos (Produtos & Serviços)**
- CRUD completo para **produtos físicos** (com controle de estoque) e **serviços** (sem controle de estoque).
- Gestão de **Categorias de Produtos** e upload de imagem de mostruário.
- Lógica de busca "live" (com debounce) e paginação.

### 👥 **Módulo de Clientes**
- CRUD completo para clientes (Pessoa Física e Jurídica).
- Formulário inteligente com busca automática de CNPJ e CEP via API externa.
- Funcionalidade de **"Cadastro Rápido"** diretamente do fluxo de criação de orçamentos.

### 📝 **Módulo de Orçamentos**
- Fluxo de criação e edição moderno via modal.
- **Personalização por Item:** Adição de observações detalhadas e upload de arquivos de referência para cada item.
- Edição de itens em modal com recálculo automático de totais e margem de lucro.
- Geração de **PDFs profissionais** (Orçamento, Ordem de Serviço, Protocolo de Entrega).
- Dados de negócio (Status, Pagamento, Entrega, etc.) totalmente customizáveis pelo administrador.

### 🏭 **Módulo de Produção**
- Geração **automática** de Ordens de Produção a partir de orçamentos aprovados.
- Tela dedicada para a equipe de produção gerenciar o fluxo de trabalho com status customizáveis.

### 📈 **Módulo de Estoque**
- Sistema de **movimentações de estoque** (entradas, saídas, vendas, estornos) para rastreabilidade total.
- **Baixa de estoque automática** apenas para produtos físicos em vendas aprovadas.
- Atualização automática do **preço de custo** do produto baseada na última compra.

### 💰 **Módulo Financeiro**
- Geração **automática** de **Contas a Receber** a partir de pedidos concluídos, com lógica para criação de **parcelas** baseada em Condições de Pagamento customizáveis.
- CRUD completo para **Contas a Pagar**.
- Lógica para registro de **pagamentos parciais e totais**.
- **Automação de Status:** Um comando agendado (cron job) que marca contas como "Vencidas" automaticamente.

### 📈 **Módulo de Relatórios Gerenciais**
- Página dedicada com múltiplos relatórios em abas.
- Filtros de data para análises de performance em períodos customizados.
- Relatórios implementados: **Resumo de Vendas (KPIs)**, **Vendas por Cliente** e **Fluxo de Caixa (Previsto vs. Realizado)**.
- Exportação de dados operacionais e gerenciais para **CSV**.

### 👤 **Módulo de Usuários e Perfil**
- Painel para o administrador gerenciar funcionários e atribuir Funções.
- Página de **"Meu Perfil"** para cada usuário alterar suas próprias informações.

### ⚙️ **Módulo de Configurações (Painel do Admin)**
- Painel de Controle completo para gerenciar todas as opções customizáveis do sistema, incluindo Funções, Permissões, Status, Formas e Condições de Pagamento, etc.

---

## 🔮 Roadmap de Futuras Implementações

- **Testes Automatizados:**
  - Escrever testes de API (com Pest) para garantir a estabilidade do backend a longo prazo.
- **Melhorias de Comunicação:**
  - Implementar a funcionalidade de envio de documentos diretamente por **E-mail** e/ou **WhatsApp**.

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
  - Mantine Charts & Dates
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