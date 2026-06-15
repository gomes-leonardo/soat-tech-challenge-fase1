# Security / Vulnerability Report

## Tools Used

| Tool | Purpose | Command |
|------|---------|---------|
| npm audit | Dependency vulnerability scan | `npm audit --audit-level=high` |
| Semgrep | Static Application Security Testing (SAST) | `npx semgrep --config auto src/` |
| Trivy | Container image vulnerability scan | `trivy image soat-tech-challenge:latest` |

## Findings

### npm audit

<!-- TODO(you): paste scan output and triage -->

| Severity | Package | Description | Fixed? |
|----------|---------|-------------|--------|
| | | | |

### Semgrep (SAST)

<!-- TODO(you): paste scan output and triage -->

| Severity | Rule | File | Description | Fixed? |
|----------|------|------|-------------|--------|
| | | | | |

### Trivy (Container)

<!-- TODO(you): paste scan output and triage -->

| Severity | CVE | Package | Description | Fixed? |
|----------|-----|---------|-------------|--------|
| | | | | |

## Remediation Summary

<!-- TODO(you): describe what was fixed, what was accepted as risk, and why -->

## Screenshots

<!-- TODO(you): add screenshots of scan results -->
