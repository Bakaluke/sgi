# SGI Cake Web Dev - Sistema de Gestão Integrado

Um Sistema de Gestão Integrado (ERP/CRM) moderno, construído do zero com uma stack full-stack, projetado para ser flexível e atender às necessidades de pequenas e médias empresas. Este projeto, desenvolvido como parte do portfólio da **Cake Web Dev**, demonstra a criação de uma aplicação robusta, segura e com uma experiência de usuário rica.

O sistema foi modelado para ser altamente customizável, com um foco inicial nas necessidades de uma **gráfica**, lidando com produtos físicos e um fluxo de produção completo.

---

## ✨ Funcionalidades Principais

O SGI conta com um conjunto completo de módulos integrados para gerenciar as operações de um negócio do início ao fim.

### 🔑 **Autenticação & Permissões Dinâmicas**
- Sistema de login seguro com autenticação via API (Laravel Sanctum).
- **Sistema de Funções e Permissões** dinâmico (baseado em Spatie), permitindo que o administrador crie novos cargos (ex: "Gerente") e defina permissões granulares para cada ação no sistema.

### 📊 **Dashboard Inteligente e Interativo**
- Painel de controle com visão geral do negócio através de gráficos dinâmicos.
- **KPIs financeiros** (Valor Aprovado, Ticket Médio, Previsão) e alertas de estoque baixo.
- **Filtros de período de tempo** interativos ("Este Mês", "Mês Passado", etc.).
- Gráficos se adaptam automaticamente ao perfil do usuário (`Admin`, `Vendedor`, `Produção`).

### 📦 **Módulo de Produtos**
- CRUD completo para produtos físicos (com plano para expansão para serviços).
- Gestão de **Categorias de Produtos** customizáveis.
- Suporte para upload de imagem de mostruário por produto.
- Lógica de busca "live" (com debounce) e paginação.

### 👥 **Módulo de Clientes**
- CRUD completo para clientes (Pessoa Física e Jurídica).
- Formulário inteligente com busca automática de dados de CNPJ e CEP via API externa.
- Funcionalidade de **"Cadastro Rápido"** diretamente do fluxo de criação de orçamentos.

### 📝 **Módulo de Orçamentos**
- Fluxo de criação moderno via modal, ágil e intuitivo.
- **Personalização por Item:** Adição de observações detalhadas e upload de arquivos de referência (arte, etc.) para cada item individualmente.
- Edição de itens em modal com recálculo automático de totais e margem de lucro.
- Geração de **PDFs profissionais** e customizados com os dados e logo da empresa.
- Campos de **Status, Pagamento, Entrega e Origem da Negociação** totalmente customizáveis pelo administrador.

### 🏭 **Módulo de Produção**
- Geração **automática** de Ordens de Produção a partir de orçamentos aprovados.
- Tela dedicada para a equipe de produção gerenciar o fluxo de trabalho.
- Gestão de **Status de Produção** customizáveis.
- Impressão de **Ordem de Serviço** e **Protocolo de Entrega** detalhados, incluindo observações e anexos dos itens.

### 📈 **Módulo de Estoque**
- Sistema de **movimentações de estoque** para rastreabilidade total.
- **Baixa de estoque automática** em vendas aprovadas.
- Formulário para registro de entradas (compras) e saídas manuais (perdas, defeitos).
- Atualização automática do **preço de custo** do produto baseada na última compra.
- Sistema de **estorno** para corrigir movimentações de forma segura e auditável.

### 👤 **Módulo de Usuários e Perfil**
- Painel completo para o administrador gerenciar os funcionários (CRUD de usuários).
- Atribuição de Funções customizáveis para cada usuário.
- Página de **"Meu Perfil"** para que cada usuário possa alterar suas próprias informações e senha.

### ⚙️ **Módulo de Configurações (Painel do Admin)**
- Painel de Controle com interface de abas aninhadas para gerenciar:
  - **Dados da Empresa:** Informações de contato, endereço e logotipo.
  - **Funções & Permissões:** CRUD completo para criar e editar cargos e definir o que cada um pode fazer no sistema.
  - **Ajustes do Orçamento:** CRUDs para gerenciar as opções de Status, Pagamento, Entrega e Origem da Negociação.
  - **Ajustes da Produção:** CRUD para gerenciar os Status do fluxo de produção.

---

## 🔮 Roadmap de Futuras Implementações (v1.0+)

Com a base sólida da v0.3 concluída, o plano para a v1.0 e além inclui:

- **Módulo Financeiro:** A próxima grande etapa.
  - Geração automática de **Contas a Receber** a partir de pedidos concluídos.
  - Gestão de **Contas a Pagar**.
  - Fluxo de caixa e relatórios financeiros básicos.
  - Gestão de parcelas e vencimentos.

- **Evolução do Catálogo (Produtos vs. Serviços):**
  - Refatorar o módulo de produtos para diferenciar claramente entre **produtos físicos** (que controlam estoque) e **serviços** (que não controlam), essencial para o modelo de negócio de uma gráfica.

- **Melhorias de Comunicação:**
  - Implementar a funcionalidade de envio de Orçamentos e outros documentos diretamente por **E-mail** e **WhatsApp** a partir do sistema.

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