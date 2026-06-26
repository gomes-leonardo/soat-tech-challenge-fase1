# Relatorio de Seguranca / Analise de Vulnerabilidades

**Projeto:** Auto Repair Shop OS Management System — SOAT Tech Challenge Fase 1
**Data do scan:** 25/06/2026

## Ferramentas utilizadas

| Ferramenta | Objetivo | Comando | Executado |
|------------|----------|---------|-----------|
| npm audit | Scan de vulnerabilidades em dependencias | `npm audit --audit-level=high` | Sim (local + CI) |
| Trivy | Scan de vulnerabilidades da imagem de container | `trivy image soat-tech-challenge:latest` | Sim, no CI (`.github/workflows/ci.yml`, job `security`). Localmente requer Docker daemon ativo. |
| Semgrep (SAST) | Analise estatica do codigo-fonte | `npx semgrep --config auto src/` | Requer a CLI standalone do Semgrep (Python). Como complemento foi feita revisao manual de SAST (abaixo). |

## Resultados

### 1. npm audit (dependencias)

Execucao em 25/06/2026:

**Total: 48 vulnerabilidades — 0 critical, 8 high, 37 moderate, 3 low.**

As 8 de severidade **high** sao todas em **dependencias transitivas** (nenhuma importada diretamente pelo codigo da aplicacao):

| Pacote | Origem (transitiva de) | Natureza | Tratamento |
|--------|------------------------|----------|------------|
| `@nestjs/cli` | ferramenta de build/dev | webpack/glob/inquirer | Risco aceito (apenas dev/build, fora do bundle de producao) |
| `@nestjs/platform-express` → `multer`, `express` | runtime (NestJS) | DoS no `multer` (upload) | Risco aceito: a API **nao expoe upload de arquivos**, superficie nao alcancavel. Mitigar com bump de minor do NestJS quando disponivel. |
| `undici` | runtime (transitiva) | smuggling/DoS via Fetch/WebSocket | Risco aceito: a aplicacao **nao usa** `fetch`/WebSocket do undici diretamente. |
| `lodash`, `glob`, `picomatch`, `tmp` | build/test (testcontainers, schematics) | prototype pollution / ReDoS / path traversal | Risco aceito: apenas em tooling de dev/test, fora do runtime de producao. |

**Conclusao:** nenhuma vulnerabilidade afeta a superficie de ataque direta da API (controllers, validacao, auth). O `npm audit fix` simples nao resolve sem upgrades major das ferramentas; o risco e aceito e revisado a cada atualizacao de dependencias no CI.

### 2. Trivy (imagem de container)

Executado no pipeline de CI (job `security`) a cada push/PR para `main`, com severidade `CRITICAL,HIGH`. A imagem base e `node:20-alpine` (multi-stage, sem devDependencies no estagio final). Para rodar localmente:

```bash
docker compose build app
trivy image soat-tech-challenge:latest
```

### 3. SAST (revisao manual do codigo-fonte)

Nenhum finding critico identificado. Boas praticas verificadas:

- Sem `eval`, `child_process`/exec, ou construcao dinamica de SQL — todo acesso a dados passa pelo TypeORM com query builder/parametros (sem SQL injection).
- Sem segredos commitados em codigo de runtime (apenas exemplos em `.env.example` e defaults explicitos de dev).
- Validacao de entrada centralizada (`class-validator` + `ValidationPipe` global com `whitelist` + `forbidNonWhitelisted`).
- Dados sensiveis (CPF/CNPJ, placa) validados em Value Objects no dominio.

## Medidas de seguranca implementadas

1. **Autenticacao:** JWT (Passport) em todas as APIs administrativas; `JwtAuthGuard` por controller. Secret via `ConfigService`/variavel de ambiente.
2. **Senhas:** hash com bcrypt (salt rounds = 10); senha em texto nunca persistida.
3. **Validacao de entrada:** `class-validator` + `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted` + `transform`).
4. **Validacao de dados sensiveis:** CPF/CNPJ com digito verificador e placa (formatos antigo + Mercosul) validados em Value Objects imutaveis.
5. **Endpoint publico protegido:** `/consult` exige `clientId` + CPF/CNPJ correspondente e tem **rate limiting** (fixed-window, 20 req/min por `clientId`, resposta `429` + `Retry-After`) contra forca-bruta/abuso.
6. **Tratamento de erros:** `DomainExceptionFilter` evita vazamento de stack traces.
7. **Banco em producao:** `synchronize` desativado; schema criado por **migrations versionadas** (rodadas no boot), evitando alteracoes de schema nao controladas.
8. **Menor privilegio:** imagem Docker roda com usuario nao-root.
9. **CI de seguranca:** `npm audit` + Trivy a cada push/PR.

## Riscos conhecidos e aceitos (escopo de MVP academico)

- **Admin seed padrao (`admin@oficina.com` / `admin123`)** e **defaults de `JWT_SECRET`/credenciais no `docker-compose.yml`**: convenientes para avaliacao/demo, **devem ser trocados em producao** (via variaveis de ambiente/secret manager). Documentado aqui como decisao consciente.
- **Vulnerabilidades transitivas** de tooling (webpack, undici, lodash, tmp, etc.) nao incluidas no runtime de producao ou em features nao utilizadas — aceitas e monitoradas no CI.
- **Sem RBAC fino:** ha um unico papel administrativo no MVP. O scaffold de `roles` existe, mas nao ha segregacao de permissoes entre admins.
