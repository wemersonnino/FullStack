# Documentação UML e Arquitetura - Escala SaaS

Este documento detalha a estrutura de classes, componentes e banco de dados do projeto, abstraindo detalhes de implementação.

## 1. Visão Geral da Arquitetura
A plataforma utiliza o padrão **BFF (Backend For Frontend)** e **Arquitetura Hexagonal** no frontend para isolar o domínio de mudanças externas.

### Fluxo de Comunicação
`UI Components <-> BFF (Next.js Routes) <-> Application Services <-> Adapters <-> Spring Boot API`

---

## 2. UML Frontend (Camadas Hexagonais)

### Camada de Domínio (Core Models)
```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  roles: string[];
  address: Address;
}

interface Company {
  id: string;
  name: string;
  cnpj: string;
  latitude: number;
  longitude: number;
}

interface TeamInvitation {
  token: string;
  email: string;
  roleName: string;
}
```

### Camada de Aplicação (Services)
*   **UserService:** Orquestra autenticação e perfil.
*   **CompanyService:** Gere dados das unidades e geofencing.
*   **InvitationService:** Processa convites e onboarding.
*   **ReportService:** Gera e exporta dados financeiros.

### Camada de Infraestrutura (Adapters)
*   **BackendAdapter:** Gerencia o `fetch` para o Spring Boot com Bearer Token.
*   **MapAdapter:** Encapsula Leaflet/Google Maps.
*   **ExternalService:** Integração com BrasilAPI.

---

## 3. UML Backend (Spring Boot Core)

### Diagrama de Classes (Entidades Principais)
*   **User:** (id, username, email, password, theme, company_id)
*   **Company:** (id, name, slug, cnpj, latitude, longitude, allowed_radius)
*   **TeamInvitation:** (id, email, token, expires_at, company_id, invited_by)
*   **Employee:** (id, full_name, email, user_id, company_id)
*   **WorkShift:** (id, start_time, end_at, employee_id, company_id)

### Camada de Serviço
*   **AuthenticationService:** Register/Login com suporte a multi-tenancy.
*   **CheckInService:** Motor de validação de geofencing (Haversine).
*   **ReportService:** Agregação de dados para folha de pagamento.

---

## 4. Diagrama de Banco de Dados (PostgreSQL)

| Tabela | Colunas Chave | Relacionamentos |
|:---|:---|:---|
| **companies** | id (PK), slug (UK), cnpj, geom_lat, geom_lng | 1:N com users, 1:N com invitations |
| **users** | id (PK), email (UK), company_id (FK) | N:N com roles, 1:1 com employee |
| **team_invitations** | id (PK), token (UK), company_id (FK) | N:1 com companies |
| **work_shifts** | id (PK), employee_id (FK), company_id (FK) | N:1 com employees |
| **roles** | id (PK), name | N:N com users |

---

## 5. O Papel do Strapi (CMS)
Nesta arquitetura, o **Strapi** atua exclusivamente como um provedor de conteúdo dinâmico de marketing e UI:
*   **Menus:** Itens de navegação do header público.
*   **Banners:** Carrosséis promocionais na Landing Page.
*   **Artigos:** Conteúdo do Blog de Gestão.
*   **Footer:** Links e textos institucionais.
*   **Vantagem:** O gestor de marketing pode mudar textos da Home sem pedir alteração no código Java ou Next.js.
