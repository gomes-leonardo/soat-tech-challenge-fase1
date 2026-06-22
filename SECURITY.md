# Security / Vulnerability Report

## Tools Used

| Tool | Purpose | Command |
|------|---------|---------|
| npm audit | Dependency vulnerability scan | `npm audit --audit-level=high` |
| Semgrep | Static Application Security Testing (SAST) | `npx semgrep --config auto src/` |
| Trivy | Container image vulnerability scan | `trivy image soat-tech-challenge:latest` |

## Findings

### npm audit

Scan executado em: Junho/2026

| Severity | Package | Description | Fixed? |
|----------|---------|-------------|--------|
| High | undici (<7.8.0) | Fetch network-error leak via CORS request | Risco aceito (dep transitiva do testcontainers, apenas dev) |
| High | webpack (5.49-5.104) | buildHttp SSRF bypass via URL userinfo | Risco aceito (dep transitiva do @nestjs/cli, apenas dev/build) |
| Moderate | uuid (<11.1.1) | Missing buffer bounds check em v3/v5 | Risco aceito (dep transitiva do dockerode/testcontainers) |
| Moderate | cookie (<1.0.2) | Insufficient input validation | Risco aceito (dep transitiva, sem impacto direto) |

**Total:** 48 vulnerabilidades (3 low, 37 moderate, 8 high)

**Nota:** Todas as vulnerabilidades high/moderate estao em dependencias transitivas de ferramentas de desenvolvimento (`@nestjs/cli`, `testcontainers`). Nenhuma afeta o codigo de producao diretamente.

### Semgrep (SAST)

Analise estatica do codigo-fonte.

| Severity | Rule | File | Description | Fixed? |
|----------|------|------|-------------|--------|
| - | - | - | Nenhum finding critico identificado | N/A |

**Nota:** O projeto segue boas praticas de seguranca:
- Senhas hasheadas com bcrypt (salt rounds = 10)
- Autenticacao JWT com secret via variavel de ambiente
- ValidationPipe global para sanitizacao de input
- Guards de autenticacao em todas as rotas protegidas
- Endpoint publico (`/consult`) valida identidade via CPF/CNPJ

### Trivy (Container)

Scan da imagem Docker nao executado (requer build da imagem com Docker daemon ativo).

Para executar manualmente:
```bash
docker compose build app
trivy image soat-tech-challenge:latest
```

## Remediation Summary

### O que foi corrigido
- **JWT Secret:** Migrado de `process.env` hardcoded para `ConfigService` com injecao de dependencia, evitando mismatch entre assinatura e validacao.
- **SQL Logging:** Desabilitado em todos os ambientes para evitar vazamento de dados sensiveis nos logs.

### O que foi aceito como risco
- Vulnerabilidades em dependencias transitivas de ferramentas de desenvolvimento (webpack, undici, uuid via testcontainers/dockerode). Essas dependencias nao sao incluidas no bundle de producao e nao afetam a superficie de ataque da aplicacao em runtime.

### Medidas de seguranca implementadas
1. **Autenticacao:** JWT com Passport, bcrypt para hash de senhas
2. **Validacao de entrada:** `class-validator` com `ValidationPipe` global (whitelist + forbidNonWhitelisted)
3. **Tratamento de erros:** `DomainExceptionFilter` evita vazamento de stack traces
4. **Principio do menor privilegio:** Dockerfile roda com usuario nao-root (`node`)
5. **Separacao de camadas:** Dominio isolado de frameworks (inversao de dependencia)
