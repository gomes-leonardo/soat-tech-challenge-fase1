# Auto Repair Shop OS Management System

Sistema de gerenciamento de ordens de servico para oficina mecanica — SOAT Tech Challenge Fase 1 (POS TECH FIAP).

**Autor:** Leonardo Rodrigues Gomes e Vinicius Takedi

## Arquitetura

Monolito NestJS com **Domain-Driven Design** em camadas:

```
src/
  domain/          -> Entidades, Value Objects, regras de negocio (zero imports de framework)
  application/     -> Casos de uso, DTOs, orquestracao
  infrastructure/  -> TypeORM entities, implementacoes de repositorio, auth, config
  interfaces/http/ -> Controllers, guards, filtros, modules
```

### Principios aplicados

- **Inversao de Dependencia (SOLID - D):** O dominio define contratos (classes abstratas como `ClientRepository`). A infraestrutura implementa. O dominio nunca importa TypeORM, NestJS ou qualquer framework.
- **Entidades ricas:** Regras de negocio vivem nas entidades, nao nos controllers ou use cases. Ex: a `ServiceOrder` valida suas proprias transicoes de status.
- **Value Objects imutaveis:** `CpfCnpj`, `Plate`, `BudgetLine` validam-se na criacao e nao mudam depois.
- **Price Freezing:** O orcamento congela precos no momento da criacao, protegendo o cliente de alteracoes posteriores no catalogo.
- **Repository Port pattern:** Classes abstratas no dominio, implementacoes concretas na infraestrutura, bind via modulo NestJS.

### Justificativa do banco de dados

**PostgreSQL 16** foi escolhido por:

- **JSONB nativo:** Usado para historico de status da OS (`status_history`) e linhas do orcamento (`lines`), evitando tabelas auxiliares para dados que sao sempre lidos em conjunto
- **Transacoes ACID:** Essencial para operacoes de estoque (decremento atomico) e consistencia entre orcamento e OS
- **Tipos ricos:** UUID como PK, DECIMAL(10,2) para valores monetarios, constraints de unicidade (CPF/CNPJ, placa, SKU)
- **Maturidade:** Ecossistema estavel com TypeORM 0.3, suporte a locking otimista/pessimista

Alternativas consideradas:

- **MySQL:** Suporte inferior a JSONB e UUIDs nativos
- **MongoDB:** Sem transacoes ACID multi-documento de forma simples, desnecessario para um dominio relacional
- **SQLite:** Insuficiente para concorrencia e producao

## Endpoints da API

Todos os endpoints (exceto `/auth` e `/consult`) requerem autenticacao JWT via header `Authorization: Bearer <token>`.

### Autenticacao

| Metodo | Rota             | Descricao           |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Registrar admin     |
| POST   | `/auth/login`    | Login (retorna JWT) |

### Clientes

| Metodo | Rota           | Descricao                                |
| ------ | -------------- | ---------------------------------------- |
| POST   | `/clients`     | Cadastrar cliente                        |
| GET    | `/clients`     | Listar clientes (filtro por `?cpfCnpj=`) |
| GET    | `/clients/:id` | Buscar por ID                            |
| PUT    | `/clients/:id` | Atualizar cliente                        |
| DELETE | `/clients/:id` | Remover cliente                          |

### Veiculos

| Metodo | Rota                         | Descricao                  |
| ------ | ---------------------------- | -------------------------- |
| POST   | `/vehicles`                  | Cadastrar veiculo          |
| GET    | `/vehicles`                  | Listar veiculos            |
| GET    | `/vehicles/:id`              | Buscar por ID              |
| GET    | `/vehicles/client/:clientId` | Buscar veiculos do cliente |
| PUT    | `/vehicles/:id`              | Atualizar veiculo          |
| DELETE | `/vehicles/:id`              | Remover veiculo            |

### Pecas (Estoque)

| Metodo | Rota               | Descricao             |
| ------ | ------------------ | --------------------- |
| POST   | `/parts`           | Cadastrar peca        |
| GET    | `/parts`           | Listar pecas          |
| GET    | `/parts/:id`       | Buscar por ID         |
| PUT    | `/parts/:id`       | Atualizar peca        |
| PATCH  | `/parts/:id/stock` | Ajustar estoque (+/-) |
| DELETE | `/parts/:id`       | Remover peca          |

### Servicos

| Metodo | Rota            | Descricao         |
| ------ | --------------- | ----------------- |
| POST   | `/services`     | Cadastrar servico |
| GET    | `/services`     | Listar servicos   |
| GET    | `/services/:id` | Buscar por ID     |
| PUT    | `/services/:id` | Atualizar servico |
| DELETE | `/services/:id` | Remover servico   |

### Ordens de Servico

| Metodo | Rota                         | Descricao                                      |
| ------ | ---------------------------- | ---------------------------------------------- |
| POST   | `/service-orders`            | Criar OS                                       |
| GET    | `/service-orders`            | Listar (filtro por `?status=` ou `?clientId=`) |
| GET    | `/service-orders/:id`        | Buscar por ID                                  |
| PATCH  | `/service-orders/:id/status` | Alterar status                                 |
| PUT    | `/service-orders/:id`        | Atualizar descricao                            |
| DELETE | `/service-orders/:id`        | Remover OS                                     |

### Orcamentos

| Metodo | Rota                           | Descricao               |
| ------ | ------------------------------ | ----------------------- |
| POST   | `/budgets`                     | Criar orcamento         |
| GET    | `/budgets/:id`                 | Buscar por ID           |
| GET    | `/budgets/service-order/:soId` | Listar orcamentos da OS |
| PATCH  | `/budgets/:id/approve`         | Aprovar orcamento       |
| PATCH  | `/budgets/:id/refuse`          | Recusar orcamento       |
| DELETE | `/budgets/:id`                 | Remover orcamento       |

### Consulta Publica (sem autenticacao)

| Metodo | Rota                      | Descricao                            |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/consult/:clientId?cpf=` | Consultar OS do cliente (valida CPF) |

> Protegido por **rate limiting** (fixed-window, 20 req/min por `clientId`) para mitigar abuso/forca-bruta no par `clientId` + CPF/CNPJ. Excedido o limite, responde `429 Too Many Requests` com header `Retry-After`.

## Maquina de Status da OS

```
Recebida -> Em diagnostico -> Aguardando aprovacao -> Em execucao -> Finalizada -> Entregue

Excecoes:
  Em execucao -> Aguardando aprovacao  (re-orcamento)
  Em execucao <-> Pausado              (pausa por estoque)
  Aguardando aprovacao -> Encerrada sem execucao (recusa do cliente)
```

**Regras de negocio (automacoes):**

- A transicao para `EM_EXECUCAO` so e permitida se a OS tiver um orcamento aprovado (`budgetId` setado).
- **Orcamento automatico:** ao criar um orcamento, o sistema busca preco e descricao do catalogo (`Service.basePrice` / `Part.unitPrice`) pelo `referenceId` e **congela** esses valores. O cliente da API informa apenas `type`, `referenceId` e `quantity` — nunca o preco.
- **Status automatico:** criar um orcamento move a OS para `AGUARDANDO_APROVACAO` (e, no re-orcamento a partir de `EM_EXECUCAO`, limpa o vinculo anterior e retorna a OS para `AGUARDANDO_APROVACAO`). Recusar um orcamento encerra a OS (`ENCERRADA_SEM_EXECUCAO`).
- **Baixa de estoque na aprovacao:** ao aprovar o orcamento, o sistema verifica a disponibilidade de todas as pecas e da baixa no estoque (reserva). Se faltar estoque, a aprovacao e bloqueada (estoque nunca fica negativo) ate que seja registrada entrada.
- **Price freezing:** o valor de servicos e pecas e congelado no orcamento, preservado mesmo que o catalogo mude depois.

## Como executar

### Pre-requisitos

- Node.js 20+
- Docker e docker-compose

### Com Docker (recomendado)

```bash
docker-compose up -d
```

A API estara disponivel em `http://localhost:3000` e o Swagger em `http://localhost:3000/api-docs`.

> **Schema:** o container roda com `NODE_ENV=production` e executa as **migrations automaticamente no boot** (`migrationsRun`), criando todo o schema na primeira subida. Nenhum passo manual de migration e necessario. Em desenvolvimento local (`NODE_ENV=development`) o TypeORM usa `synchronize` para agilidade.

### Desenvolvimento local

```bash
# 1. Instalar dependencias
npm install

# 2. Subir apenas o PostgreSQL
docker-compose up -d db

# 3. Configurar variaveis de ambiente
cp .env.example .env

# 4. Rodar em modo desenvolvimento
npm run start:dev
```

### Credenciais de admin (desenvolvimento)

```text
Email: admin@oficina.com
Senha: admin123
```

Para obter um JWT:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oficina.com","password":"admin123"}'
```

## Testes

```bash
# Testes unitarios
npm run test:unit

# Testes de integracao (requer Docker para testcontainers)
npm run test:integration

# Todos os testes
npm test

# Cobertura
npm run test:cov
```

**Status atual:** 256 testes unitarios passando, cobrindo entidades de dominio, value objects e todos os use cases. A cobertura dos dominios criticos (`src/domain` + `src/application`) e validada por `coverageThreshold` (minimo 80%) no Jest — atualmente acima de 90% em todas as metricas. Os testes de integracao (testcontainers, exigem Docker) cobrem persistencia, fluxo de re-orcamento, transicoes de status e a consulta publica.

## Seguranca

Relatorio completo de vulnerabilidades em [SECURITY.md](SECURITY.md).

Medidas implementadas:

- Autenticacao JWT com Passport
- Senhas hasheadas com bcrypt (salt rounds = 10)
- ValidationPipe global com whitelist
- DomainExceptionFilter (sem vazamento de stack traces)
- Dockerfile com usuario nao-root
- Variaveis de ambiente via ConfigService

## Documentacao da API

Swagger UI disponivel em `/api-docs` com a aplicacao rodando. Todas as rotas documentadas com exemplos de request/response.

## Checklist de entregaveis

- [x] Event Storming + documentacao DDD (Miro)
- [x] APIs RESTful documentadas via Swagger
- [x] CRUD completo: Clientes, Veiculos, Pecas, Servicos, OS, Orcamentos
- [x] Autenticacao JWT nas APIs de admin
- [x] Validacao de CPF/CNPJ + placa (formatos antigo e Mercosul)
- [x] Endpoint publico de consulta de OS por cliente
- [x] Maquina de status da OS com transicoes validadas + transicoes automaticas (criar/recusar orcamento)
- [x] Orcamento gerado automaticamente do catalogo, com congelamento de preco e re-orcamento
- [x] Baixa de estoque na aprovacao do orcamento (estoque nunca negativo)
- [x] Rate limiting no endpoint publico de consulta
- [x] Testes unitarios (256 passando) + integracao + cobertura >=80% nos dominios criticos (coverageThreshold)
- [x] Dockerfile multi-stage + docker-compose com migrations automaticas no boot
- [x] README com instrucoes de execucao + justificativa do banco
- [x] Relatorio de seguranca/vulnerabilidades (SECURITY.md)
- [ ] Repositorio privado com acesso ao usuario `soat-architecture`
