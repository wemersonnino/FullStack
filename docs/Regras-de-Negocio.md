# Regras de Negócio - Plataforma Escala SaaS

Este documento descreve as regras lógicas e restrições que regem o funcionamento do sistema.

## 1. Gestão de Multi-Tenancy (Empresas)
*   **Isolamento Total:** Um usuário autenticado só pode visualizar, criar ou editar dados pertencentes ao seu `company_id`.
*   **Propriedade (Ownership):** Cada empresa deve ter pelo menos um usuário com a role `OWNER`.
*   **Identificação Única:** Cada empresa é identificada por um `slug` único e um CNPJ válido (suportando o novo formato alfanumérico).

## 2. Onboarding e Convites
*   **Convite por Email:** O administrador (`OWNER`/`MANAGER`) envia um convite vinculado a um email e uma role específica.
*   **Expiração:** Links de convite expiram automaticamente após 7 dias corridos.
*   **Vínculo Obrigatório:** Ao aceitar um convite, o novo usuário é automaticamente vinculado à empresa do remetente, não podendo criar uma nova empresa no mesmo fluxo.

## 3. Ponto Eletrônico por Geolocalização (Geofencing)
*   **Âncora de Localização:** A empresa deve configurar as coordenadas (latitude/longitude) da unidade física para habilitar o ponto digital.
*   **Raio de Tolerância:** O registro de ponto só é aceito se a distância entre o colaborador e a âncora for menor ou igual ao `allowedRadius` definido (padrão 200m).
*   **Validação Cruzada:** O sistema deve registrar o IP do dispositivo e o Fingerprint do navegador para auditoria de fraude.
*   **Haversine Formula:** O cálculo de distância deve ser realizado no servidor utilizando a fórmula de Haversine para precisão esférica.

## 4. Gestão de Escalas e Trocas
*   **Conflito de Horário:** O sistema não deve permitir que um colaborador seja escalado para dois turnos sobrepostos na mesma empresa.
*   **Descanso Obrigatório:** Deve haver um intervalo mínimo (conforme legislação vigente) entre o fim de um turno e o início do próximo.
*   **Aprovação de Trocas:** Trocas de turno solicitadas por funcionários (`USER`) requerem obrigatoriamente a aprovação de um `MANAGER` ou `OWNER`.

## 5. Financeiro e Folha de Pagamento
*   **Cálculo de Adicional Noturno:** Horas trabalhadas entre 22:00 e 05:00 devem ser contabilizadas com o percentual de adicional noturno configurado.
*   **Horas Extras:** Qualquer tempo que exceda a carga horária semanal definida no contrato do colaborador deve ser exportado como hora extra.

## 6. Papéis e Permissões (RBAC)
*   **OWNER:** Acesso total à gestão da empresa, financeiro, convites e configurações de sistema.
*   **MANAGER:** Gestão operacional de escalas, colaboradores e aprovação de trocas.
*   **USER:** Visualização de própria escala, solicitação de trocas e registro de ponto.
