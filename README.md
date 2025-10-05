# SGI Cake Web Dev - Sistema de Gestão Integrado (v1.0)

Um Sistema de Gestão Integrado (ERP/CRM) moderno, construído do zero com uma stack full-stack, projetado para ser flexível e atender às necessidades de pequenas e médias empresas. Este projeto, desenvolvido como parte do portfólio da **Cake Web Dev**, demonstra a criação de uma aplicação robusta, segura e com uma experiência de usuário rica.

O sistema foi modelado para ser altamente customizável, com um foco inicial nas necessidades de uma **gráfica**, lidando com produtos físicos, serviços e um fluxo de produção e financeiro completo.

---

## ✨ Funcionalidades Principais (v1.0)

O SGI conta com um conjunto completo de módulos integrados para gerenciar as operações de um negócio do início ao fim.

- **🔑 Autenticação & Permissões Dinâmicas:** Sistema de login seguro e um painel de controle onde o administrador pode criar Funções (cargos) e definir permissões granulares para cada ação no sistema.

- **📊 Dashboard Inteligente:** Painel com KPIs financeiros, gráficos de performance e alertas operacionais (estoque baixo, orçamentos parados). Os dados são filtráveis por período e se adaptam ao perfil do usuário logado.

- **📦 Módulo de Produtos & Serviços:** CRUD completo que diferencia **produtos físicos** (com controle de estoque) e **serviços** (sem estoque), com gestão de categorias e imagens.

- **👥 Módulo de Clientes:** CRUD para Pessoas Físicas e Jurídicas, com busca de dados por CNPJ/CEP e um fluxo de **Cadastro Rápido** no momento da venda.

- **📝 Módulo de Orçamentos:**
  - Fluxo de criação ágil com seções retráteis.
  - Exigência de CPF/CNPJ apenas no momento da **aprovação**, reduzindo o atrito inicial.
  - **Personalização por Item:** Adição de observações e upload de arquivos para cada item do orçamento.
  - Geração de PDFs profissionais e envio por **E-mail** ou **WhatsApp**.

- **🏭 Módulo de Produção:** Geração **automática** de Ordens de Produção a partir de orçamentos aprovados, com tela de gerenciamento de status para a equipe de produção.

- **📈 Módulo de Estoque:** Sistema de movimentações para rastreabilidade, com baixa **automática** em vendas e atualização do preço de custo na compra.

- **💰 Módulo Financeiro:**
  - **Contas a Pagar e a Receber** com CRUD completo.
  - Geração **automática** de Contas a Receber a partir de pedidos concluídos.
  - **Gestão de Parcelas:** O sistema lê a "Condição de Pagamento" e cria as parcelas automaticamente.
  - Lógica para registro de **pagamentos parciais e totais** em parcelas individuais.
  - **Automação de Status:** Um comando agendado que marca contas como "Vencidas" diariamente.

- **📈 Módulo de Relatórios Gerenciais:**
  - Página dedicada com análises de negócio em abas e com filtros de data.
  - Relatórios de **Resumo de Vendas**, **Vendas por Cliente** e **Fluxo de Caixa (Previsto vs. Realizado)**.
  - Exportação de todos os relatórios operacionais e gerenciais para **CSV**.

- **👤 Módulo de Usuários e ⚙️ Configurações:** Painéis completos para o administrador gerenciar usuários, cargos, permissões e todas as opções customizáveis do sistema.

---

## 📸 Telas do Sistema

*Uma visão geral da interface limpa e funcional do SGI.*

**Dashboard Principal**
![Dashboard](docs/images/1.png)

**Página de Orçamentos**
![Orçamentos](docs/images/2.png)

**Página de Produção**
![Produção](docs/images/3.png)

**Página de Produtos**
![Produtos](docs/images/4.png)

**Página de Estoque**
![Estoque](docs/images/5.png)

**Página de Clientes**
![Clientes](docs/images/6.png)

**Módulo Financeiro (Contas a Receber com Parcelas)**
![Financeiro](docs/images/7.png)

**Página de Configurações**
![Configurações](docs/images/8.png)

**Página de Funções**
![Funções](docs/images/9.png)

**Página de Gestão de Usuários**
![Usuários](docs/images/10.png)

---

## 🔮 Roadmap de Futuras Melhorias

- **Testes Automatizados:** Escrever uma suíte de testes para a API (com Pest) para garantir a estabilidade e a manutenibilidade do sistema a longo prazo.
- **Refinamentos no Financeiro:** Criar mais relatórios gerenciais e explorar a possibilidade de conciliação bancária.
- **Dashboard 2.0:** Adicionar novas métricas, como "Ranking de Vendedores" e um "Funil de Vendas".

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