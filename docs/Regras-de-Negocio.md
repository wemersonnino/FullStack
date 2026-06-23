# Regras de Negócio - Plataforma Escala SaaS

Este documento descreve as regras lógicas e restrições que regem o funcionamento do sistema.

## 1. Gestão de Multi-Tenancy (Empresas)
*   **Isolamento Total:** Um usuário autenticado só pode visualizar, criar ou editar dados pertencentes ao seu `company_id`.
*   **Propriedade (Ownership):** Cada empresa deve ter pelo menos um usuário com a role `OWNER` (Dono do Tenant, hierarquia máxima).
*   **Identificação Única:** Cada empresa é identificada por um `slug` único e um CNPJ válido (suportando o novo formato alfanumérico).

## 2. Onboarding e Convites
*   **Convite por Email:** O administrador (`OWNER`/`ADMIN`) envia um convite vinculado a um email e uma role específica.
*   **Expiração:** Links de convite expiram automaticamente após 7 dias corridos.
*   **Vínculo Obrigatório:** Ao aceitar um convite, o novo usuário é automaticamente vinculado à empresa do remetente, não podendo criar uma nova empresa no mesmo fluxo.

## 3. Ponto Eletrônico por Geolocalização (Geofencing)
*   **Âncora de Localização:** A empresa deve configurar as coordenadas (latitude/longitude) da unidade física para habilitar o ponto digital.
*   **Raio de Tolerância:** O registro de ponto só é aceito se a distância entre o colaborador e a âncora for menor ou igual ao `allowedRadius` definido (padrão 200m).
*   **Validação Cruzada:** O sistema deve registrar o IP do dispositivo e o Fingerprint do navegador para auditoria de fraude.
*   **Haversine Formula:** O cálculo de distância deve ser realizado no servidor utilizando a fórmula de Haversine para precisão esférica.

## 4. Hierarquia e Delegação de Autoridade (ReBAC)
*   **Níveis de Hierarquia (Modelo Jethro):**
    1.  **OWNER (Dono do Tenant):** Poder absoluto sobre a conta e faturamento da empresa.
    2.  **ADMIN (TI / Administrador):** Responsável por dar permissões, gerenciar usuários, cadastros e atribuir gestores.
    3.  **MANAGER_1000 (Gestor de Mil / Diretor):** Responsável por grandes unidades operacionais ou departamentos inteiros.
    4.  **MANAGER_100 (Gestor de Cem / Gerente):** Responsável por setores específicos.
    5.  **MANAGER_50 (Gestor de Cinquenta / Coordenador):** Responsável por equipes ou postos de trabalho.
    6.  **MANAGER_10 (Gestor de Dez / Supervisor/Líder):** Responsável por equipes pequenas ou escalas diretas.
*   **Responsabilidade de Permissões:** O cadastro de gestores e atribuição de permissões de gestão (atribuição sobre setores, postos ou equipes) é restrita a usuários com perfil de administrador/TI (`ADMIN`/`OWNER`).
*   **Limite de Ação do Gestor:** Um gestor só pode realizar ações de edição, criação e exclusão de escalas para funcionários sob sua alocação direta.
*   **Aprovação Administrativa:** Movimentar, adicionar ou excluir subordinados de equipes, postos ou setores por parte de um gestor exige permissão explícita ou aprovação em fluxo de trabalho pelos perfis `ADMIN`/`OWNER`.

## 5. Central de Notificações, Mensageria e Concorrência
*   **Controle de Concorrência:** Uma escala não pode ser alterada simultaneamente por mais de um usuário. O sistema deve validar a versão do registro (`@Version`) e rejeitar atualizações conflitantes.
*   **Solicitações e Mensageria:**
    *   Gestores podem solicitar permissões adicionais temporárias ou permanentes para o `ADMIN`/`OWNER`.
    *   Subordinados podem solicitar trocas de turno com colegas ou com o gestor.
    *   A troca de mensagens segue fluxos: Gestor ↔ Admin, Gestor ↔ Subordinado e Subordinado ↔ Subordinado.
*   **Interface Dinâmica de Mensagens:** A visualização de uma mensagem no modal de detalhes muda dinamicamente conforme sua classe (ex: se for solicitação de permissão, exibe botões de "Permitir" e checkbox de ações; se for troca de turno, exibe botões "Aceitar" / "Recusar").

## 6. Integração com WhatsApp/Telegram e IA
*   **Captura e Análise de Mensagens:** A aplicação escutará canais oficiais (WhatsApp/Telegram) vinculados a cada empresa.
*   **Processamento por IA:** A IA processará conversas para identificar solicitações de troca de turno ou avisos de faltas/atrasos.
*   **Busca de Substitutos:** Em caso de ausência relatada no chat, a IA buscará automaticamente colaboradores qualificados próximos geograficamente (integrado ao geofencing) e com disponibilidade de banco de horas para sugerir o substituto ao gestor.
*   **Sincronização com RH e Calendário:** Todas as trocas aprovadas devem atualizar automaticamente o calendário de escalas e ser comunicadas ao departamento de RH para fechamento de folha.

## 7. Trilha de Auditoria
*   **Rastreabilidade Total:** Todas as ações críticas (criação de escalas, login, alteração de permissões, trocas de turno e batidas de ponto) devem gravar logs de auditoria detalhados e assinados na empresa correspondente.

