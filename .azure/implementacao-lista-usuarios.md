# Implementação - Lista de Usuários com Acesso ao Caso

## Resumo
Implementação completa da funcionalidade de listagem e remoção de usuários com acesso ao caso, integrando frontend com backend através de API routes, services e hooks.

## Arquivos Criados

### 1. API Routes (Next.js)

#### `/src/app/api/cases/[caseId]/users/route.ts`
- **Método**: GET
- **Endpoint**: `/api/cases/{caseId}/users`
- **Descrição**: Lista todos os usuários com acesso ao caso
- **Backend**: `/cases/{caseId}/users` (list_users_from_case)

#### `/src/app/api/cases/[caseId]/users/[userId]/route.ts`
- **Método**: DELETE
- **Endpoint**: `/api/cases/{caseId}/users/{userId}`
- **Descrição**: Remove acesso de um usuário específico ao caso
- **Backend**: `/cases/{caseId}/users/{userId}` (remove_user_case)

## Arquivos Modificados

### 2. Types (`src/types/User.ts`)
```typescript
export type UserIdName = {
  id: string;
  name: string;
};
```

### 3. Services (`src/services/caseService.ts`)

Adicionadas duas novas funções:

#### `getUsersWithAccess(caseId: string): Promise<UserIdName[]>`
- Busca lista de usuários com acesso ao caso
- Retorna array de objetos com id e name

#### `removeUserAccess(caseId: string, userId: string): Promise<void>`
- Remove acesso de um usuário ao caso
- Usa método DELETE

### 4. Hooks (`src/hooks/useCase.ts`)

Adicionados dois novos hooks:

#### `useUsersWithAccess(caseId: string)`
- Hook de query para buscar usuários
- **Query Key**: `['caseUsers', caseId]`
- **Enabled**: Apenas quando caseId existe
- **Refetch on window focus**: false

#### `useRemoveUserAccess()`
- Hook de mutation para remover acesso
- **Invalidações**:
  - `['caseUsers', caseId]` - atualiza lista
  - `['case', caseId]` - atualiza dados do caso

### 5. Componente ListPeople (`src/components/ListPeople/index.tsx`)

Ajustes finais:
- Tipo genérico explícito: `GenericTable<UserWithAccess>`
- Propriedades obrigatórias: `loading` e `variant`
- Estados de loading tratados adequadamente

### 6. Page Component (`src/app/casos/[id]/page.tsx`)

Integração completa:
```typescript
// Imports
import { useUsersWithAccess, useRemoveUserAccess } from '@/hooks/useCase';

// Hooks
const { data: usersWithAccess = [] } = useUsersWithAccess(caseId);
const removeUserMutation = useRemoveUserAccess();

// Implementação
<ListPeople
  caseId={caseId}
  users={usersWithAccess}
  onRemoveUser={(userId) => {
    removeUserMutation.mutate({ caseId, userId: userId.toString() });
  }}
/>
```

### 7. Testes (`test/app/casos/[id]/page.test.tsx`)

Adicionados mocks para os novos hooks:
```typescript
vi.mock('@/hooks/useCase', () => ({
  // ... hooks existentes
  useUsersWithAccess: vi.fn(),
  useRemoveUserAccess: vi.fn(),
}));

// No beforeEach
(useUsersWithAccess as Mock).mockReturnValue({
  data: [],
  isLoading: false,
  isError: false,
});

(useRemoveUserAccess as Mock).mockReturnValue({
  mutate: vi.fn(),
});
```

## Fluxo de Dados

```
Frontend (Page)
    ↓
useUsersWithAccess Hook
    ↓
caseService.getUsersWithAccess()
    ↓
Next.js API Route: /api/cases/[caseId]/users
    ↓
Backend API: /cases/{caseId}/users
    ↓
Python: list_users_from_case()
    ↓
Retorna: List[UserIdName]
```

### Fluxo de Remoção

```
Frontend (ListPeople - click remove)
    ↓
useRemoveUserAccess Hook (mutation)
    ↓
caseService.removeUserAccess()
    ↓
Next.js API Route: DELETE /api/cases/[caseId]/users/[userId]
    ↓
Backend API: DELETE /cases/{caseId}/users/{userId}
    ↓
Python: remove_user_case()
    ↓
Invalidação de queries: ['caseUsers', caseId] e ['case', caseId]
```

## Funcionalidades Implementadas

✅ **Listagem de usuários com acesso**
  - Busca automática ao carregar página
  - Exibição em tabela usando GenericTable
  - Estado de loading

✅ **Remoção de acesso**
  - Botão de ação com ícone de lixeira
  - Mutation com invalidação automática de cache
  - Atualização da lista após remoção

✅ **Integração com backend**
  - API routes criadas seguindo padrão Next.js
  - Tipagem completa com TypeScript
  - Tratamento de erros com throwIfError

✅ **Testes**
  - Mocks atualizados para os novos hooks
  - 42 testes do page component passando

## Próximos Passos (Opcional)

1. **Adicionar usuários ao caso**
   - Criar endpoint POST `/api/cases/[caseId]/users`
   - Hook `useAddUserAccess`
   - Modal ou dropdown para selecionar usuário

2. **Melhorias de UX**
   - Confirmação antes de remover usuário
   - Mensagens de sucesso/erro
   - Loading states mais detalhados

3. **Validações**
   - Verificar permissões antes de remover
   - Impedir remoção do próprio responsável
   - Mensagens de erro específicas

## Tecnologias Utilizadas

- **React 19.1.0** - Interface do usuário
- **Next.js 15.4.6** - Framework e API Routes
- **TypeScript** - Tipagem estática
- **React Query (@tanstack/react-query)** - Gerenciamento de estado assíncrono
- **Vitest** - Testes unitários
- **Python FastAPI** - Backend (endpoints já existentes)

## Estrutura de Dados

### UserIdName (Type)
```typescript
{
  id: string;
  name: string;
}
```

### UserWithAccess (Component Type)
```typescript
{
  id: string | number;
  name: string;
  email?: string;
}
```

## Status

✅ **Implementação Completa**
- Backend endpoints confirmados
- API routes criadas
- Services implementados
- Hooks configurados
- Componente integrado
- Testes atualizados
- Tipagem completa
