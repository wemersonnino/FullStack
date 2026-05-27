# Projeto Escala - Diretrizes de Desenvolvimento

## Arquitetura
Este projeto segue a **Arquitetura Hexagonal (Ports and Adapters)** com um padrão de **BFF (Backend For Frontend)**.

### Princípios Core:
- **Independência de Framework:** A lógica de negócio deve ser isolada de detalhes técnicos como Strapi, Next.js ou Spring Boot.
- **Testabilidade:** O sistema deve ser testável sem depender de agentes externos.
- **Desacoplamento:** O frontend consome o BFF, que orquestra a comunicação entre o Strapi (CMS/Conteúdo) e o Java Spring Boot (Auth/Regras de Negócio complexas).

## Stack Tecnológica
- **Frontend/BFF:** Next.js 15+ (TypeScript), Next-Auth, Tailwind CSS, Radix UI.
- **Backend CMS:** Strapi v5 (Gestão de Conteúdo: Artigos, Banners, Escalas).
- **Backend Auth/Core (Se necessário):** Java Spring Boot (Gestão de Usuários, Roles, Permissões).

## Fluxo de Autenticação e Autorização
1. O Frontend (Next.js) utiliza o **Next-Auth** para gerenciar a sessão.
2. O Login é processado pelo backend (preferencialmente Strapi ou Spring Boot conforme definido na estratégia).
3. O Token gerado deve ser utilizado para autenticar requisições subsequentes ao Strapi para buscar dados de escalas (`shift`, `shift-swap`, `work-schedule`).

## Entidades e Funcionalidades Recentes
- **Usuários e Perfil:** A entidade `user-account` foi expandida para suportar upload de avatar (media), endereço, cargo e função. Existe integração real com o sistema de upload do Strapi pelo BFF (`/api/bff/upload`).
- **Empresas (N:N):** Foi implementada a entidade `company` (Empresa), que possui relacionamento muitos-para-muitos (N:N) com `user-account`. Usuários podem pertencer a várias empresas/projetos. A gestão de empresas ocorre no Dashboard Admin.
- **Gestão de Escalas/Calendário (Em desenvolvimento):**
  - **Múltiplas Views:** Mensal, Semanal e Anual.
  - **Roles:** ADMIN pode criar, editar, visualizar todos; FUNCIONARIO/USER/MEMBER pode apenas visualizar sua própria escala.
  - **Frontend:** Componentes modulares (`EscalaCalendar`, `EscalaMonthView`, `EscalaUserTable`, etc.) no App Router.
  - **BFF:** Validação de permissões nas rotas da API (`/api/bff/escala`).

## Gestão de Escalas
- **Strapi:** Armazena as entidades de escala.
- **Frontend:** Consome via BFF, aplicando filtros de permissão baseados no usuário logado.

## Convenções
- Usar DTOs para transferência de dados.
- Mapeadores (Mappers) para converter respostas da API para interfaces internas.
- Manter o diretório `src/app` para rotas e `src/services` para lógica de comunicação.
