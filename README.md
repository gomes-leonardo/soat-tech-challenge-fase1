# Auto Repair Shop OS Management System

Sistema de gerenciamento de ordens de serviço para oficina mecânica — SOAT Tech Challenge Fase 1.

## Arquitetura

Monolito NestJS com Domain-Driven Design em camadas:

```
src/
  domain/          → Entidades, Value Objects, regras de negócio (sem imports de framework)
  application/     → Casos de uso, DTOs, portas (interfaces de repositório)
  infrastructure/  → TypeORM entities, implementações de repositório, config
  interfaces/http/ → Controllers, guards, filtros, schemas de request/response
```

### Justificativa da escolha do banco de dados

**PostgreSQL 16** foi escolhido por:

- Suporte nativo a JSONB (usado para histórico de status da OS)
- Transações ACID para integridade de estoque
- Constraints e tipos ricos (UUID, DECIMAL, ENUM via VARCHAR)
- Ecossistema maduro com TypeORM
- Locking pessimista/otimista para controle de concorrência

<!-- TODO(you): expanda esta seção com sua própria análise comparativa
     entre PostgreSQL, MySQL, MongoDB e justifique a escolha considerando
     os requisitos do domínio (transações, integridade referencial, etc.) -->

## Como executar

### Pré-requisitos

- Node.js 20+
- Docker e docker-compose
- npm

### Com Docker (recomendado)

```bash
docker-compose up -d
```

A API estará disponível em `http://localhost:3000` e o Swagger em `http://localhost:3000/api-docs`.

### Desenvolvimento local

```bash
# 1. Instalar dependências
npm install

# 2. Subir apenas o PostgreSQL
docker-compose up -d db

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Rodar em modo desenvolvimento
npm run start:dev
```

### Executar testes

```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração (requer Docker para testcontainers)
npm run test:integration

# Testes e2e
npm run test:e2e

# Modo watch (TDD)
npm run test:watch

# Cobertura
npm run test:cov
```

### Credenciais de admin (desenvolvimento)

```
Email: admin@oficina.com
Senha: admin123
```

Para obter um JWT:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oficina.com","password":"admin123"}'
```

## Máquina de Status da OS

```
Recebida → Em diagnóstico → Aguardando aprovação → Em execução → Finalizada → Entregue

Exceções:
  Em execução → Aguardando aprovação  (re-orçamento)
  Em execução ↔ Pausado               (pausa por estoque)
  Aguardando aprovação → Encerrada sem execução (recusa)
```

## Lacunas de aprendizado (GAPs)

Este projeto contém lacunas intencionais para aprendizado. Os testes já estão escritos e falhando — sua missão é implementar o código para fazê-los passar.

### GAP A — Vehicle / Plate
- `src/domain/vehicle/plate.vo.ts` → validação de placa (formato antigo e Mercosul)
- `src/domain/vehicle/vehicle.entity.ts` → entidade com invariantes
- Testes: `test/unit/domain/vehicle/`

### GAP B — Budget
- `src/domain/budget/budget.entity.ts` → orçamento com preço congelado, versionamento
- `src/domain/budget/budget-line.vo.ts` → linha de orçamento
- Testes: `test/unit/domain/budget/`

### GAP C — Rate Limiting
- `src/interfaces/http/guards/rate-limit.guard.ts` → guard de rate limiting
- Testes: `test/unit/interfaces/guards/rate-limit.guard.spec.ts`

### GAP D — Integration Tests
- `test/integration/part/stock-concurrency.integration.spec.ts`
- `test/integration/consult/public-consult.integration.spec.ts`
- `test/integration/budget/re-budget-flow.integration.spec.ts`

### Workflow TDD

```bash
npm run test:watch    # Veja os testes falhando (vermelho)
# Implemente o código
# Veja os testes passando (verde)
```

## Segurança

Para rodar scans de segurança localmente:

```bash
# Auditoria de dependências
npm audit --audit-level=high

# SAST
npx semgrep --config auto src/

# Container scan (após build)
docker build -t soat-tech-challenge:latest .
trivy image soat-tech-challenge:latest
```

Veja `SECURITY.md` para o template do relatório de vulnerabilidades.

## Documentação da API

Swagger disponível em `/api-docs` quando a aplicação está rodando.

## Checklist de entregáveis

- [ ] Event Storming + DDD docs (Miro)
- [ ] APIs RESTful documentadas via Swagger
- [x] Autenticação JWT nas APIs de admin
- [ ] Validação de CPF/CNPJ + placa
- [ ] Testes unitários + integração, 80% cobertura nos domínios críticos
- [x] Dockerfile + docker-compose
- [x] README com instruções de execução + justificativa do banco
- [ ] Relatório de segurança/vulnerabilidades
- [ ] Repositório privado com acesso ao usuário `soat-architecture`
