# Hub de Imóveis

Catálogo interno de imóveis para corretores: busca por nome, fotos, informações
completas, cópia rápida de texto formatado e download de um ZIP (fotos + ficha
em PDF) por imóvel. O lado admin permite cadastrar, editar e excluir imóveis,
subir fotos por drag & drop, escolher a foto de capa e reordenar.

## Stack

- **Next.js** (App Router, TypeScript) + **Tailwind CSS**
- **Supabase**: Postgres (dados), Auth (login com roles `admin`/`broker`) e
  Storage (fotos)
- **react-dropzone**, **jszip**, **@react-pdf/renderer**

## Configuração inicial

### 1. Criar o projeto no Supabase

1. Crie uma conta/projeto em [supabase.com](https://supabase.com) (tem plano
   gratuito, suficiente para este volume de imóveis).
2. No **SQL Editor** do projeto, rode o conteúdo de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Isso cria as tabelas (`profiles`, `properties`, `property_photos`), as
   políticas de RLS (leitura para qualquer usuário logado, escrita só para
   admin) e o bucket privado `property-photos` no Storage.

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

### 3. Criar os usuários (admin e corretores)

Ainda não há uma tela de "convidar usuário" — os usuários são criados direto
pelo **Supabase Dashboard → Authentication → Users → Add user**:

- Para um usuário **admin** (equipe que gerencia os imóveis), em "User
  Metadata" adicione:
  ```json
  { "role": "admin", "name": "Nome da pessoa" }
  ```
- Para um **corretor**, pode deixar em branco (o padrão é `broker`) ou
  informar:
  ```json
  { "role": "broker", "name": "Nome do corretor" }
  ```

Um trigger no banco (`handle_new_user`) cria automaticamente a linha
correspondente em `profiles` com o role escolhido.

### 4. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será redirecionado
para `/login`. Entre com um usuário admin para acessar `/admin/imoveis` e
cadastrar o primeiro imóvel (com fotos). Qualquer usuário logado (admin ou
broker) acessa `/imoveis` para buscar e baixar.

## Deploy

O jeito mais simples é publicar na [Vercel](https://vercel.com/new), apontando
para este repositório e configurando as mesmas duas variáveis de ambiente
(`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) no painel do
projeto.

## Estrutura

```
app/
  (broker)/imoveis/            -- listagem (busca por nome) e detalhe do imóvel
  admin/imoveis/                -- CRUD de imóveis + upload/gestão de fotos
  login/                        -- autenticação
  api/properties/[id]/export/   -- gera o ZIP (fotos + ficha em PDF) sob demanda
components/                      -- componentes de UI compartilhados
lib/
  supabase/                      -- clients (browser/server/middleware) e helpers de storage
  pdf/                            -- template da ficha em PDF
  format.ts, types.ts, auth.ts
supabase/migrations/0001_init.sql -- schema, RLS e bucket de fotos
```

## Próximos passos possíveis

- Tela de gestão de usuários (convidar corretores/admins sem usar o Dashboard
  do Supabase).
- Filtros de busca além do nome (bairro, faixa de preço).
- Identidade visual da empresa (logo, cores) — hoje o visual é neutro.
