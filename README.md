# Portal PKS

Catálogo de imóveis para corretores: busca por nome, fotos, informações
completas, cópia rápida de texto formatado e download de um ZIP (fotos + ficha
em PDF) por imóvel. **A busca é pública — o corretor não precisa de login**,
só vê os imóveis marcados como disponíveis. O lado admin (com login) permite
cadastrar, editar e excluir imóveis, subir fotos por drag & drop, escolher a
foto de capa, reordenar e marcar um imóvel como alugado (o que já o esconde
automaticamente da busca pública).

## Stack

- **Next.js** (App Router, TypeScript) + **Tailwind CSS**
- **Supabase**: Postgres (dados), Auth (login só para `admin`) e Storage (fotos)
- **react-dropzone**, **jszip**, **@react-pdf/renderer**

## Configuração inicial

### 1. Criar o projeto no Supabase

1. Crie uma conta/projeto em [supabase.com](https://supabase.com) (tem plano
   gratuito, suficiente para este volume de imóveis).
2. No **SQL Editor** do projeto, rode nesta ordem o conteúdo de:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
     cria as tabelas (`profiles`, `properties`, `property_photos`), as
     políticas de RLS e o bucket privado `property-photos` no Storage.
   - [`supabase/migrations/0002_public_broker_access.sql`](supabase/migrations/0002_public_broker_access.sql) —
     ajusta a RLS para permitir que qualquer pessoa (sem login) veja os
     imóveis com status "disponível"; o admin continua vendo tudo.

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com os dados do seu
projeto Supabase (**Settings → API**):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Criar o(s) usuário(s) admin

Corretores não precisam de conta. Só quem gerencia os imóveis (o admin)
precisa de login, criado direto pelo **Supabase Dashboard → Authentication →
Users → Add user**, com em "User Metadata":

```json
{ "role": "admin", "name": "Nome da pessoa" }
```

Um trigger no banco (`handle_new_user`) cria automaticamente a linha
correspondente em `profiles` com esse role.

### 4. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — é a página pública de
entrada, com um botão **"Acessar imóveis"** (não precisa de login) e um link
discreto **"Área administrativa"** que leva ao `/login`. Entre com um usuário
admin para cadastrar imóveis em `/admin/imoveis`.

## Deploy

O jeito mais simples é publicar na [Vercel](https://vercel.com/new), apontando
para este repositório e configurando as mesmas duas variáveis de ambiente
(`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) no painel do
projeto.

## Estrutura

```
app/
  page.tsx                       -- página pública de entrada ("Acessar imóveis")
  (broker)/imoveis/               -- busca pública (só disponíveis) e detalhe do imóvel
  admin/imoveis/                 -- CRUD de imóveis + upload/gestão de fotos (requer login)
  login/                         -- autenticação (só admin)
  api/properties/[id]/export/    -- gera o ZIP (fotos + ficha em PDF) sob demanda
components/                      -- componentes de UI compartilhados
lib/
  supabase/                      -- clients (browser/server/middleware) e helpers de storage
  pdf/                            -- template da ficha em PDF
  format.ts, types.ts, auth.ts
supabase/migrations/
  0001_init.sql                  -- schema, RLS e bucket de fotos
  0002_public_broker_access.sql  -- RLS pública para imóveis disponíveis
```

## Próximos passos possíveis

- Tela de gestão de usuários admin (convidar sem usar o Dashboard do Supabase).
- Filtros de busca além do nome (bairro, faixa de preço).
