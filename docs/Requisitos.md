# Requisitos do Sistema - Engenharia de Software

Este documento define as especificações técnicas da plataforma seguindo os padrões de arquitetura de software.

## 1. Requisitos Funcionais (RF)
| ID | Descrição | Prioridade |
|:---|:---|:---|
| RF01 | O sistema deve permitir o registro de novas empresas (Tenants) com geração automática de admin (OWNER). | Alta |
| RF02 | O sistema deve permitir o envio de convites para colaboradores com definição de cargo/role. | Alta |
| RF03 | O sistema deve capturar a localização GPS do usuário ao registrar o ponto. | Crítica |
| RF04 | O sistema deve validar se o usuário está dentro da cerca virtual (Geofencing) da empresa antes de aceitar o ponto. | Crítica |
| RF05 | O sistema deve gerar relatórios de folha de pagamento mensais com exportação para CSV. | Média |
| RF06 | O sistema deve fornecer um dashboard com KPIs de absenteísmo e trocas pendentes. | Alta |
| RF07 | O sistema deve permitir que o gestor defina o raio permitido para geofencing via mapa interativo. | Média |
| RF08 | O sistema deve suportar o cadastro de CNPJ no novo formato alfanumérico brasileiro. | Crítica |

## 2. Requisitos Não-Funcionais (RNF)
| ID | Categoria | Descrição |
|:---|:---|:---|
| RNF01 | **Arquitetura** | O sistema deve seguir a Arquitetura Hexagonal (Ports and Adapters) no Frontend/BFF. |
| RNF02 | **Segurança** | As senhas devem ser criptografadas utilizando BCrypt no banco de dados. |
| RNF03 | **Disponibilidade** | O sistema deve ser projetado para rodar em clusters escaláveis (AWS ECS/EKS). |
| RNF04 | **Multi-Tenancy** | O isolamento de dados deve ser garantido em nível de aplicação e banco de dados (company_id). |
| RNF05 | **Performance** | O carregamento do Dashboard não deve exceder 2 segundos (Parallel Routes / Streaming). |
| RNF06 | **Portabilidade** | A camada de infraestrutura de mapas deve ser abstrata para permitir troca de Leaflet por Google Maps sem refatoração de domínio. |
| RNF07 | **Usabilidade** | A interface deve ser responsiva e adaptada para dispositivos móveis para registro de ponto. |
| RNF08 | **Internacionalização** | O sistema deve suportar localização (i18n) para PT-BR e EN-US (Mensagens e Moedas). |

## 3. Tecnologias e Padrões
*   **Backend Core:** Java Spring Boot 3.x
*   **Frontend/BFF:** Next.js 15+ (App Router, Parallel Routes)
*   **Database:** PostgreSQL (Relacional)
*   **CMS (UI Content):** Strapi v5 (Apenas para Menus, Banners e Artigos)
*   **Segurança:** Next-Auth (JWT) + Spring Security
*   **Mapas:** Leaflet / OpenStreetMap
