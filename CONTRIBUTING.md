# Guia de Contribuição

Obrigado por considerar contribuir para o Web App Escala! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

1. [Como Contribuir](#como-contribuir)
2. [Padrões de Código](#padrões-de-código)
3. [Commits](#commits)
4. [Pull Requests](#pull-requests)
5. [Reportar Bugs](#reportar-bugs)
6. [Sugerir Melhorias](#sugerir-melhorias)

## Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório via GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/FullStack.git
cd FullStack

# Adicione o repositório original como upstream
git remote add upstream https://github.com/wemersonnino/FullStack.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 3. Faça suas Alterações

- Escreva código limpo e legível
- Siga os padrões do projeto
- Adicione testes quando aplicável
- Atualize a documentação se necessário

### 4. Teste suas Alterações

```bash
# Frontend
cd frontend
npm run build
npm run dev

# Backend
cd backend
npm run build
npm run develop
```

### 5. Commit e Push

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request

- Vá até o repositório no GitHub
- Clique em "New Pull Request"
- Descreva suas alterações detalhadamente
- Referencie issues relacionadas

## Padrões de Código

### TypeScript

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // implementação
};

// ❌ Evitar
const getUser = async (id) => {
  // sem tipos
};
```

### React/Next.js

```typescript
// ✅ Bom - Use componentes funcionais e hooks
export default function Component() {
  const [state, setState] = useState<Type>(initialValue);
  
  return <div>...</div>;
}

// ✅ Bom - Nomeie exports
export const ComponentName = () => {
  return <div>...</div>;
};
```

### Strapi

```typescript
// ✅ Use factories quando possível
export default factories.createCoreController('api::entity.entity');

// ✅ Adicione lógica customizada quando necessário
export default factories.createCoreController('api::entity.entity', ({ strapi }) => ({
  async customAction(ctx) {
    // lógica customizada
  }
}));
```

### Organização de Arquivos

```
frontend/
├── app/              # App Router do Next.js
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Componentes de UI base
│   ├── features/    # Componentes específicos de features
│   └── layout/      # Componentes de layout
├── lib/             # Utilitários e helpers
└── messages/        # Traduções i18n

backend/
└── src/
    └── api/
        └── entity/
            ├── content-types/
            ├── controllers/
            ├── services/
            └── routes/
```

## Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```bash
feat: adiciona página de gerenciamento de turnos
fix: corrige erro de autenticação no login
docs: atualiza README com instruções de deploy
style: formata código seguindo ESLint
refactor: reorganiza estrutura de componentes
test: adiciona testes para componente de escala
chore: atualiza dependências do projeto
```

### Formato

```
tipo(escopo opcional): descrição curta

Descrição detalhada opcional do que foi feito e por quê.

Refs: #123 (issue relacionada)
```

## Pull Requests

### Checklist

Antes de abrir um PR, certifique-se de:

- [ ] O código compila sem erros
- [ ] Todos os testes passam
- [ ] A documentação foi atualizada
- [ ] O código segue os padrões do projeto
- [ ] O commit segue o padrão Conventional Commits
- [ ] A branch está atualizada com a main

### Template de PR

```markdown
## Descrição
Breve descrição do que foi feito.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. ...

## Screenshots (se aplicável)
...

## Checklist
- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] Testes adicionados/atualizados
```

## Reportar Bugs

### Antes de Reportar

- Verifique se o bug já foi reportado
- Teste na versão mais recente
- Colete informações sobre o ambiente

### Template de Issue

```markdown
**Descrição**
Descrição clara do bug.

**Para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [e.g. Ubuntu 22.04]
- Browser: [e.g. Chrome 120]
- Node: [e.g. 20.10]
- Docker: [e.g. 24.0]

**Informações Adicionais**
Qualquer outro contexto relevante.
```

## Sugerir Melhorias

### Template de Feature Request

```markdown
**É relacionado a um problema?**
Descrição clara do problema.

**Solução Proposta**
Descrição clara da solução que você gostaria.

**Alternativas Consideradas**
Outras soluções que você considerou.

**Contexto Adicional**
Qualquer outro contexto ou screenshots.
```

## Boas Práticas

### Git

- Faça commits pequenos e frequentes
- Escreva mensagens de commit descritivas
- Mantenha seu fork atualizado
- Evite commits diretos na main

### Código

- Escreva código autodocumentado
- Adicione comentários quando necessário
- Evite código duplicado
- Use nomes descritivos para variáveis e funções

### TypeScript

- Use tipos sempre que possível
- Evite `any`
- Use interfaces para objetos complexos
- Aproveite recursos como generics e utility types

### React

- Mantenha componentes pequenos e focados
- Use hooks para lógica reutilizável
- Evite prop drilling (use Context ou Zustand)
- Otimize re-renders quando necessário

### Strapi

- Use factories quando possível
- Mantenha controllers magros
- Coloque lógica de negócio em services
- Valide dados na entrada

## Processo de Review

1. **Automated Checks**: CI/CD valida build e testes
2. **Code Review**: Revisão por maintainers
3. **Feedback**: Discussão e ajustes se necessário
4. **Merge**: Após aprovação, merge para main

## Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Leia a documentação
2. Procure em issues fechadas
3. Abra uma issue com a tag `question`
4. Entre em contato com os maintainers

## Código de Conduta

Este projeto adere ao [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

Participando, você concorda em manter um ambiente respeitoso e inclusivo.

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

Obrigado por contribuir! 🚀
