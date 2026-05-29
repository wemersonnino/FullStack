# Projeto Escala - Diretrizes de Desenvolvimento

## Arquitetura
Este projeto segue rigorosamente a **Arquitetura Hexagonal (Ports and Adapters)** com um padrão de **BFF (Backend For Frontend)**.

### Inovações e Funcionalidades Premium
- **Ponto por Geolocalização (Geofencing):** Implementado com validação cruzada (GPS + IP). O backend Java utiliza a fórmula de Haversine para garantir precisão.
- **Integração de Mapas (Abstração Hexagonal):** O sistema utiliza uma camada de abstração para mapas. Atualmente integrado com **Leaflet/OpenStreetMap**, mas preparado para migração para **Google Maps SDK** sem alteração nos componentes de negócio.
- **Conformidade CNPJ Alfanumérico:** Todos os validadores e campos de entrada suportam o novo padrão de CNPJ alfanumérico brasileiro.
- **Integração BrasilAPI:** Busca automática de dados de empresas por CNPJ e endereços por CEP.

## Camadas do Frontend/BFF:
1.  **Interface de Usuário (UI):** Responsável apenas por renderizar componentes e capturar interações. **Não deve conter regras de negócio.** Consome o BFF via hooks ou chamadas diretas às rotas da API.
2.  **BFF (API Routes):** Funciona como a **Porta de Entrada (Input Port)**. Recebe requisições da UI, extrai credenciais/sessão e delega a execução para a camada de Aplicação (Services).
3.  **Serviços de Aplicação (Services):** Implementam os **Casos de Uso**. Orquestram a lógica, validam permissões de negócio e utilizam Adaptadores para persistência ou integração (ex: `ExternalDataService` para BrasilAPI).
4.  **Modelo de Domínio (Models):** Representa a "Verdade do Sistema". Interfaces e classes puras que definem os dados e regras centrais (ex: `GeoPoint`, `UserProfile`).
5.  **Adaptadores de Infraestrutura (Adapters):** Funcionam como a **Porta de Saída (Output Port)**. Realizam a comunicação com backends externos e provedores de tecnologia (ex: `LeafletMapAdapter`).
6.  **Mapeadores (Mappers):** Traduzem **DTOs** para as **Models** de domínio e vice-versa.

### Princípios Core:
- **Independência de Framework:** A lógica de negócio reside no `core/` e não deve depender de detalhes técnicos como Strapi, Next.js ou Spring Boot.
- **Desacoplamento:** O frontend consome o BFF, que orquestra a comunicação entre o **Java Spring Boot (Backend Principal)** e o **Strapi (CMS: Apenas Conteúdo UI)**.

## Stack Tecnológica
- **Frontend/BFF:** Next.js 15+ (TypeScript), Next-Auth, Tailwind CSS, Radix UI.
- **Backend CMS:** Strapi v5 (Gestão de Conteúdo: Artigos, Banners, Menus, Footers).
- **Backend Core (Principal):** Java Spring Boot (Gestão de Usuários, Roles, Permissões, Escalas, Batida de Ponto).

## Fluxo de Dados (Exemplo)
`UI (Component) -> BFF (Route) -> Service (Application) -> Adapter (Infrastructure) -> Spring Boot (API)`

## Gestão de Escalas e Regras de Negócio
- **Java Spring Boot:** Responsável por toda a persistência e lógica de escalas, geolocalização e cálculos de folha.
- **Strapi:** Utilizado apenas para gestão de conteúdo dinâmico da interface (CMS).
- **Frontend:** Unifica as respostas através do BFF seguindo a arquitetura hexagonal.
