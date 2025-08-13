# SGI Cake Web Dev - Sistema de Gestão Integrado

Um Sistema de Gestão Integrado (ERP/CRM) moderno, construído do zero com uma stack full-stack, projetado para ser flexível e atender às necessidades de pequenas e médias empresas. Este projeto, desenvolvido como parte do portfólio da **Cake Web Dev**, demonstra a criação de uma aplicação robusta, segura e com uma experiência de usuário rica.

O sistema foi inicialmente modelado para atender às necessidades de uma **gráfica**, lidando com produtos físicos, serviços e um fluxo de produção.

---

## ✨ Funcionalidades Principais

O SGI conta com um conjunto completo de módulos integrados para gerenciar as operações de um negócio do início ao fim.

### 🔑 **Autenticação & Permissões (RBAC)**
- Sistema de login seguro.
- Controle de Acesso Baseado em Papéis (Role-Based Access Control) com 3 níveis:
  - **Admin:** Acesso total ao sistema.
  - **Vendedor:** Acesso focado nos módulos de vendas (Clientes, Orçamentos).
  - **Produção:** Acesso focado nos módulos operacionais (Estoque, Ordens de Produção).

### 📊 **Dashboard**
- Painel de controle inicial com visão geral do negócio.
- Gráficos e estatísticas dinâmicas que se adaptam ao perfil do usuário.
- **Admin:** Vê todos os dados.
- **Vendedor:** Vê apenas dados de seus próprios orçamentos e pedidos.
- **Produção:** Vê apenas dados relacionados às ordens de produção.

### 📦 **Módulo de Produtos**
- CRUD completo para produtos e serviços.
- Suporte para upload de imagem por produto.
- Lógica de busca "live" (com debounce) e paginação.
- Campo de preço com formatação de moeda inteligente.
- Possibilidade de definição de "Categorias" dos produtos.

### 📝 **Módulo de Orçamentos**
- Fluxo de criação moderno via modal, em duas etapas (Cabeçalho -> Itens).
- Edição "ao vivo" na tabela de itens, com recálculo automático de totais.
- Lógica interdependente para edição de Preço de Venda vs. Margem de Lucro.
- Geração de **PDFs profissionais** com dados da empresa e do cliente.
- Lista de orçamentos com linha expansível para visualização rápida dos itens.

### 🏭 **Módulo de Produção**
- Geração **automática** de Ordens de Produção a partir de orçamentos aprovados.
- Tela dedicada para a equipe de produção, com permissões específicas.
- Gestão de status dos pedidos (Pendente, Em Produção, Concluído).
- Impressão de Ordem de Serviço e Protocolo de Entrega.
- Lista de ordens com linha expansível para visualização rápida dos itens.

### 📈 **Módulo de Estoque**
- Tabela de **movimentações de estoque** (entradas e saídas) para rastreabilidade total.
- **Baixa de estoque automática** em vendas aprovadas.
- Formulário dedicado para registro de novas entradas (compras) e saídas manuais (perdas, defeitos).
- Atualização do **preço de custo** do produto baseada na última compra.
- Sistema de **estorno** para corrigir movimentações incorretas de forma segura e auditável.

### 👥 **Módulo de Clientes**
- CRUD completo para clientes (Pessoa Física e Jurídica).
- Formulário inteligente com busca automática de dados de CNPJ e CEP via API externa (BrasilAPI).
- Arquitetura com endereços separados para maior escalabilidade.
- Busca "live" e paginação.

### 👤 **Módulo de Usuários**
- Painel completo para o administrador gerenciar os funcionários e seus acessos ao sistema.
- Criação, edição e exclusão de usuários com papéis definidos ('Vendedor', 'Produção').
- Acesso à página e suas ações restrito apenas para o perfil de admin, com regras de segurança.
- Validação de dados robusta, incluindo confirmação de senha para maior segurança no cadastro.
- Página de "Meu Perfil" para que cada usuário possa alterar suas próprias informações e senha.

### ⚙️ **Módulo de Configurações**
- Página dedicada para o `admin` configurar as principais funcionalidades do sistema.

---

## 💻 Stack Tecnológica

- **Backend (API):**
  - Laravel 11
  - PHP 8.2+
  - Laravel Sanctum (Autenticação de API)
  - Laravel Policies (Autorização)
  - `barryvdh/laravel-dompdf` (Geração de PDFs)
  - MySQL

- **Frontend (Web):**
  - React 18+
  - Vite
  - TypeScript
  - Mantine UI v7 (Biblioteca de Componentes)
  - Mantine Charts
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

    # Instalar dependências do PHP
    composer install

    # Criar o arquivo de ambiente e gerar a chave
    copy .env.example .env
    php artisan key:generate

    # (Opcional, se usar SQLite) Criar o arquivo do banco
    touch database/database.sqlite

    # Criar as tabelas e popular com dados de teste
    php artisan migrate:fresh --seed

    # Criar o link simbólico para os arquivos públicos (logos, imagens)
    php artisan storage:link
    
    # Iniciar o servidor da API
    php artisan serve
    ```

3.  **Configurar o Frontend (Web):**
    ```bash
    # Abrir um NOVO terminal e navegar para a pasta web
    cd web

    # Instalar dependências do JavaScript
    npm install

    # Criar o arquivo de ambiente
    copy .env.example .env

    # Abra o .env e configure a URL da API (ex: VITE_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api))
    
    # Iniciar o servidor de desenvolvimento
    npm run dev
    ```

4.  **Acessar e Testar:**
    * O frontend estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).
    * Use os usuários de teste criados pelo seeder (ex: `admin@sgi.test`, `vendedor_alpha@sgi.test`, etc.) com a senha `password`.

---

## 🍰 Sobre a Cake Web Dev

Este projeto foi desenvolvido com dedicação pela **Cake Web Dev** como parte do nosso portfólio de soluções de software customizadas. Ele demonstra nossa capacidade de construir aplicações full-stack complexas, seguras e com foco na experiência do usuário.