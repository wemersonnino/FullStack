# Normas Internas de Segurança de Dados e Desenvolvimento Seguro

Estas normas são de leitura obrigatória para todos os desenvolvedores do projeto **Escala**. Elas orientam a arquitetura técnica e o fluxo de desenvolvimento para garantir conformidade com a LGPD e mitigar vulnerabilidades descritas no OWASP Top 10.

---

## 1. Regras de Senhas e Armazenamento Credenciais

1. **Senhas dos Usuários:**
   * Comprimento mínimo de **8 caracteres**.
   * Devem ser armazenadas obrigatoriamente utilizando hashing adaptativo forte. A implementação padrão do projeto utiliza **BCrypt** com fator de custo configurado de forma segura.
   * **NUNCA** registre a senha em logs da aplicação, mensagens de erro, ou a envie de volta em respostas HTTP de APIs (JSON).

2. **Secrets, Tokens e Chaves de API:**
   * **PROIBIDO** armazenar chaves privadas de criptografia, segredos de JWT ou chaves de provedores externos (Google SSO, Stripe, ReCAPTCHA) diretamente no código-fonte.
   * Utilize arquivos de configuração parametrizados com variáveis de ambiente injetadas por ferramentas de CI/CD ou Secret Managers em ambientes de nuvem.

---

## 2. Controle de Acessos e Multi-tenancy (Isolamento de Dados)

1. **Defesa em Profundidade por Tenant:**
   * Toda entidade persistida que represente dados de clientes e operações de negócios deve possuir um vínculo explícito com a entidade `Company` através do campo `company_id`.
   * **Regra de Consulta:** Todos os Controllers e Queries criados precisam filtrar os resultados usando o identificador de empresa extraído do token JWT autenticado do usuário requisitante. **NUNCA** confie em identificadores enviados livremente no corpo da requisição que não sejam validados contra a sessão do usuário.

2. **Princípio do Menor Privilégio (RBAC/ReBAC):**
   * Usuários comuns não devem visualizar dados pessoais ou de escalas de outros departamentos, a não ser que façam parte do escopo de visibilidade autorizado pelo serviço de políticas (`PolicyService`).
   * Modificações e exclusões de recursos estruturais (como setores, projetos e dados comerciais) devem ser restritas aos perfis `OWNER` e `ADMIN`.

---

## 3. Conformidade com a LGPD (Proteção de Dados Pessoais)

1. **Minimização de Dados:**
   * Não colete ou armazene dados pessoais além do estritamente necessário para a geração de escalas e cálculo de presença de ponto.
   * Informações de auditoria e logs trabalhistas não devem revelar dados sensíveis de forma aberta para usuários do mesmo tenant, exceto gestores e pessoal de RH devidamente autorizados.

2. **Trilha de Auditoria Append-Only:**
   * Os logs gerados por ações de usuários (criações, edições, exclusões e acessos anômalos) devem ser inseridos de forma incremental e contínua.
   * É estritamente **proibida** a existência de endpoints ou lógica no código que permita a deleção física ou atualização de registros da tabela `audit_logs`.
