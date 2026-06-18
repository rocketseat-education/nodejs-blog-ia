# Rocketseat Blog IA — Node.js

API HTTP para um blog com geração de posts assistida por IA. A aplicação recebe uma ideia, usa um agente (Mastra + OpenAI) para redigir título e conteúdo em Markdown, persiste rascunhos no PostgreSQL e expõe endpoints para aprovar, rejeitar e listar publicações.

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js 24 (LTS Krypton) | Runtime |
| `node:http` | Servidor HTTP nativo |
| PostgreSQL 17 | Banco de dados |
| Mastra + OpenAI (`gpt-4o-mini`) | Geração de conteúdo com IA |
| Zod | Validação do output estruturado |
| Postgrator | Migrations |
| Docker / Docker Compose | Infra local e imagem de produção |

## Arquitetura

```
Cliente HTTP
    │
    ▼
Router (src/http/router.js)
    │
    ├── GET    /posts
    ├── GET    /posts/:id
    ├── POST   /posts/draft        → createPostDraft (IA)
    ├── PATCH  /posts/:id/approve
    └── DELETE /posts/:id/reject
            │
            ▼
    Post Repository (PostgreSQL)
```

**Fluxo de um post:**

1. `POST /posts/draft` — cria um rascunho via IA (`approved_at` e `published_at` nulos).
2. `PATCH /posts/:id/approve` — aprova e publica o post imediatamente.
3. `DELETE /posts/:id/reject` — rejeita o post (remove aprovação e publicação).
4. `GET /posts` — lista apenas posts aprovados e já publicados.
5. `GET /posts/:id` — retorna um post publicado pelo ID.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 24+ (use `nvm use` — versão definida em `.nvmrc`)
- [Docker](https://www.docker.com/) e Docker Compose (para PostgreSQL local)
- Chave da API OpenAI

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env.local
```

| Variável | Descrição | Exemplo |
|---|---|---|
| `API_HOST` | Host do servidor HTTP | `localhost` |
| `API_PORT` | Porta do servidor HTTP | `8080` |
| `API_PROTOCOL` | Protocolo (apenas informativo no log) | `http` |
| `API_KEY` | Chave para rotas administrativas | `sua-chave-secreta` |
| `OPENAI_API_KEY` | Chave da API OpenAI | `sk-...` |
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://postgres:postgres@localhost:5432/blog` |

> Em produção, injete essas variáveis pelo orquestrador (Docker, Kubernetes, Railway, etc.) — nunca commite arquivos `.env`.

## Setup local

Setup completo em um comando (cria `.env.local`, sobe o Postgres e roda migrations):

```bash
npm install
npm run local:setup
```

Ou passo a passo:

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de ambiente
npm run env:setup
# Edite .env.local e defina OPENAI_API_KEY e API_KEY

# 3. Subir PostgreSQL
npm run infra:up

# 4. Rodar migrations
npm run migrate:up

# 5. Iniciar em modo desenvolvimento (hot reload)
npm run dev
```

O servidor ficará disponível em `http://localhost:8080`.

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor com `--watch` e `.env.local` |
| `npm run start` | Inicia o servidor em modo produção |
| `npm run local:setup` | Setup completo do ambiente local |
| `npm run env:setup` | Copia `.env.example` → `.env.local` |
| `npm run infra:up` | Sobe o PostgreSQL via Docker Compose |
| `npm run infra:down` | Para e remove os containers |
| `npm run migrate:up` | Aplica migrations pendentes |
| `npm run migrate:down` | Reverte todas as migrations |
| `npm run build` | Constrói a imagem Docker |
| `npm run lint` | Executa o oxlint |
| `npm run lint:fix` | Corrige problemas do oxlint |
| `npm run format` | Formata o código com oxfmt |
| `npm run format:check` | Verifica formatação sem alterar arquivos |

## Endpoints

Base URL: `http://localhost:8080` (local)

Todas as respostas são `application/json`.

### `GET /posts`

Lista posts publicados (aprovados, não rejeitados, com `published_at <= agora`).

**Query params:**

| Param | Valores | Descrição |
|---|---|---|
| `include` | `all` | Retorna todos os posts (incluindo rascunhos). Requer autenticação. |

**Exemplo — posts públicos:**

```bash
curl http://localhost:8080/posts
```

**Resposta `200`:**

```json
{
  "data": [
    {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "title": "Título do post",
      "content": "# Conteúdo em Markdown",
      "published_at": "2026-06-17T12:00:00.000Z",
      "created_at": "2026-06-17T11:00:00.000Z",
      "approved_at": "2026-06-17T12:00:00.000Z",
      "rejected_at": null
    }
  ]
}
```

**Exemplo — todos os posts (admin):**

```bash
curl -H "Authorization: Bearer sua-api-key" \
  "http://localhost:8080/posts?include=all"
```

**Respostas de erro:**

| Status | Condição |
|---|---|
| `403` | `include=all` sem `Authorization: Bearer <API_KEY>` válido |

---

### `GET /posts/:id`

Retorna um post publicado pelo ID.

```bash
curl http://localhost:8080/posts/V1StGXR8_Z5jdHi6B-myT
```

**Respostas:**

| Status | Corpo |
|---|---|
| `200` | `{ "data": { ... } }` |
| `404` | `{ "message": "Post not found" }` |

---

### `POST /posts/draft`

Gera um rascunho de post com IA a partir de uma ideia.

**Body:**

```json
{
  "idea": "Como usar Node.js para criar APIs performáticas"
}
```

```bash
curl -X POST http://localhost:8080/posts/draft \
  -H "Content-Type: application/json" \
  -d '{"idea": "Como usar Node.js para criar APIs performáticas"}'
```

**Respostas:**

| Status | Corpo |
|---|---|
| `201` | `{ "data": { ... } }` — rascunho criado |
| `500` | `{ "message": "..." }` — erro na geração ou persistência |

---

### `PATCH /posts/:id/approve`

Aprova e publica um post imediatamente (`approved_at` e `published_at` definidos para agora).

```bash
curl -X PATCH http://localhost:8080/posts/V1StGXR8_Z5jdHi6B-myT/approve
```

**Respostas:**

| Status | Corpo |
|---|---|
| `200` | `{ "data": { ... } }` |
| `404` | `{ "message": "Post not found" }` |

---

### `DELETE /posts/:id/reject`

Rejeita um post (`rejected_at` definido; `approved_at` e `published_at` removidos).

```bash
curl -X DELETE http://localhost:8080/posts/V1StGXR8_Z5jdHi6B-myT/reject
```

**Respostas:**

| Status | Corpo |
|---|---|
| `200` | `{ "data": { ... } }` |
| `404` | `{ "message": "Post not found" }` |

---

### Autenticação

A rota `GET /posts?include=all` exige o header:

```
Authorization: Bearer <API_KEY>
```

O valor deve corresponder exatamente à variável `API_KEY` configurada no ambiente. A comparação é feita em tempo constante para evitar timing attacks.

## Banco de dados

### Schema (`posts`)

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `VARCHAR(21)` | PK (nanoid) |
| `title` | `TEXT` | Título do post |
| `content` | `TEXT` | Conteúdo em Markdown |
| `published_at` | `TIMESTAMPTZ` | Data de publicação |
| `created_at` | `TIMESTAMPTZ` | Data de criação |
| `approved_at` | `TIMESTAMPTZ` | Data de aprovação |
| `rejected_at` | `TIMESTAMPTZ` | Data de rejeição |

### Migrations

As migrations ficam em `src/database/migrations/` e são executadas com [Postgrator](https://github.com/rickbergfalk/postgrator):

```bash
# Aplicar
npm run migrate:up

# Reverter tudo
npm run migrate:down
```

Em produção, rode as migrations **antes** de subir a nova versão da aplicação (ou como job de deploy).

## Build

A imagem Docker é multi-stage, instala apenas dependências de produção e roda como usuário não-root:

```bash
npm run build
# equivalente a:
# docker build -t rocketseat-blog-ia-nodejs:latest .
```

A imagem expõe a porta `8080` e define por padrão:

- `NODE_ENV=production`
- `API_HOST=0.0.0.0`
- `API_PORT=8080`

## Publicação em produção

### 1. Provisionar PostgreSQL

Use um serviço gerenciado (RDS, Supabase, Neon, etc.) ou um container PostgreSQL dedicado. Anote a `DATABASE_URL`.

### 2. Configurar variáveis de ambiente

Defina no ambiente de produção:

```
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=8080
API_PROTOCOL=https
API_KEY=<chave-secreta-forte>
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@host:5432/blog
```

### 3. Rodar migrations

Com a `DATABASE_URL` de produção configurada:

```bash
node node_modules/.bin/postgrator migrate
```

Ou execute o mesmo comando a partir de um container temporário com acesso ao banco.

### 4. Construir e publicar a imagem

```bash
docker build -t rocketseat-blog-ia-nodejs:latest .

# Exemplo: tag e push para um registry
docker tag rocketseat-blog-ia-nodejs:latest seu-registry/rocketseat-blog-ia-nodejs:latest
docker push seu-registry/rocketseat-blog-ia-nodejs:latest
```

### 5. Executar o container

```bash
docker run -d \
  --name blog-api \
  -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/blog" \
  -e OPENAI_API_KEY="sk-..." \
  -e API_KEY="sua-chave-secreta" \
  rocketseat-blog-ia-nodejs:latest
```

### Checklist de produção

- [ ] PostgreSQL acessível pela aplicação
- [ ] Migrations aplicadas
- [ ] `OPENAI_API_KEY` e `API_KEY` configuradas
- [ ] Porta `8080` exposta (ou mapeada via reverse proxy)
- [ ] HTTPS terminado no reverse proxy (Nginx, Caddy, load balancer)
- [ ] Backups do banco configurados

## Estrutura do projeto

```
.
├── src/
│   ├── index.js                    # Entry point do servidor
│   ├── http/
│   │   ├── router.js               # Roteador HTTP
│   │   ├── read-json-body.js       # Parser de body JSON
│   │   └── verify-api-key.js       # Validação da API key
│   ├── routes/
│   │   └── posts.js                # Rotas de posts
│   ├── repositories/
│   │   └── post-repository.js      # Acesso ao banco
│   ├── services/
│   │   └── create-post-draft.js    # Geração de rascunho com IA
│   ├── mastra/
│   │   ├── index.js                # Configuração Mastra
│   │   └── agents/
│   │       └── post-writer-agent.js
│   └── database/
│       ├── pool.js                 # Pool de conexões pg
│       └── migrations/             # SQL migrations
├── docker-compose.yml              # PostgreSQL local
├── Dockerfile                      # Imagem de produção
├── .env.example                    # Template de variáveis
└── package.json
```

## Licença

ISC
