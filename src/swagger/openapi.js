export function createOpenApiSpec() {
  const protocol = process.env.API_PROTOCOL ?? 'http'
  const host = process.env.API_HOST ?? 'localhost'
  const port = process.env.API_PORT ?? '8080'

  return {
    openapi: '3.0.3',
    info: {
      title: 'Rocketseat Blog IA API',
      description:
        'API HTTP para um blog com geração de posts assistida por IA. Cria rascunhos via OpenAI, persiste no PostgreSQL e expõe endpoints para aprovar, rejeitar e listar publicações.',
      version: '1.0.0',
    },
    servers: [{ url: `${protocol}://${host}:${port}` }],
    tags: [{ name: 'Posts', description: 'Operações de posts do blog' }],
    paths: {
      '/posts': {
        get: {
          tags: ['Posts'],
          summary: 'Lista posts publicados',
          description:
            'Retorna posts aprovados, não rejeitados e com `published_at` menor ou igual ao momento atual.',
          parameters: [
            {
              name: 'include',
              in: 'query',
              description:
                'Use `all` para incluir rascunhos e posts não publicados (requer autenticação).',
              schema: { type: 'string', enum: ['all'] },
            },
          ],
          responses: {
            200: {
              description: 'Lista de posts',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Post' },
                      },
                    },
                    required: ['data'],
                  },
                },
              },
            },
            403: {
              description:
                'Autenticação inválida ou ausente para `include=all`',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'Forbidden' },
                },
              },
            },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      '/posts/{id}': {
        get: {
          tags: ['Posts'],
          summary: 'Busca um post publicado pelo ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'V1StGXR8_Z5jdHi6B-myT',
            },
          ],
          responses: {
            200: {
              description: 'Post encontrado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Post' },
                    },
                    required: ['data'],
                  },
                },
              },
            },
            404: {
              description: 'Post não encontrado ou ainda não publicado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'Post not found' },
                },
              },
            },
          },
        },
      },
      '/posts/draft': {
        post: {
          tags: ['Posts'],
          summary: 'Gera um rascunho de post com IA',
          description:
            'Usa um agente Mastra + OpenAI para redigir título e conteúdo em Markdown a partir de uma ideia.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idea: {
                      type: 'string',
                      description: 'Ideia ou tema para o post',
                      example:
                        'Como usar Node.js para criar APIs performáticas',
                    },
                  },
                  required: ['idea'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Rascunho criado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Post' },
                    },
                    required: ['data'],
                  },
                },
              },
            },
            500: {
              description: 'Erro na geração ou persistência',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                },
              },
            },
          },
        },
      },
      '/posts/{id}/approve': {
        patch: {
          tags: ['Posts'],
          summary: 'Aprova e publica um post',
          description:
            'Define `approved_at` e `published_at` para o momento atual.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'V1StGXR8_Z5jdHi6B-myT',
            },
          ],
          responses: {
            200: {
              description: 'Post aprovado e publicado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Post' },
                    },
                    required: ['data'],
                  },
                },
              },
            },
            404: {
              description: 'Post não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'Post not found' },
                },
              },
            },
          },
        },
      },
      '/posts/{id}/reject': {
        delete: {
          tags: ['Posts'],
          summary: 'Rejeita um post',
          description:
            'Define `rejected_at` e remove `approved_at` e `published_at`.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'V1StGXR8_Z5jdHi6B-myT',
            },
          ],
          responses: {
            200: {
              description: 'Post rejeitado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Post' },
                    },
                    required: ['data'],
                  },
                },
              },
            },
            404: {
              description: 'Post não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'Post not found' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'V1StGXR8_Z5jdHi6B-myT' },
            title: { type: 'string', example: 'Título do post' },
            content: {
              type: 'string',
              description: 'Conteúdo em Markdown',
              example: '# Conteúdo em Markdown',
            },
            published_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            created_at: { type: 'string', format: 'date-time' },
            approved_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            rejected_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
          required: ['id', 'title', 'content', 'created_at'],
        },
        ErrorMessage: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description:
            'Chave de API configurada em `API_KEY`. Obrigatória apenas para `GET /posts?include=all`.',
        },
      },
    },
  }
}
