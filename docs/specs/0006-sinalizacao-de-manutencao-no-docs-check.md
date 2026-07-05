---
status: implemented
date: 2026-07-05
builds-on: [ADR-0010, ADR-0011]
implemented-by:
  - scripts/docs-check
  - scripts/test-docs-check
---

# docs-check sinaliza manutenção: coerência de versão de contrato e localização do backlog

## Objetivo

O gate passa a **informar** (sem travar) dois desvios de manutenção que hoje envelhecem em
silêncio: declaração de contrato (`casa-version`) incoerente com a toolchain instalada
(ADR-0010) e backlog no lugar errado (`docs/context/`, ADR-0011).

## Fluxo

1. Na validação do router, se `casa-version` tem formato válido, compara `(major, minor)`
   da declaração com `CONTRACT_VERSION` (constante do próprio `docs-check`) e emite aviso
   em divergência — direção da mensagem depende de qual lado está atrás.
2. Após a validação do router, lista `docs/context/` (se existir) e emite aviso para
   qualquer arquivo cujo nome em lowercase seja `backlog.md`.
3. Avisos entram no canal normal (`AVISO:`) e **não afetam o exit code**.

## Contrato

- `CONTRACT_VERSION` no `docs-check` = versão de contrato CASA que a toolchain implementa;
  deve ser idêntica à `CASA_VERSION` do `casa-init` do mesmo snapshot — sincronia guardada
  por cenário de teste no CI do casa-standard (`test-casa-init`).
- Comparação por `(major, minor)`; componente de patch não sinaliza.
- A checagem de localização compara nomes por listagem de diretório (determinística em
  filesystems case-sensitive e case-insensitive), nunca por `exists()`.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | o router declara `casa-version` menor que `CONTRACT_VERSION` | avisar contrato atrás: ler o CHANGELOG do casa-standard e atualizar a declaração quando o repo cumprir o contrato novo |
| 2 | o router declara `casa-version` maior que `CONTRACT_VERSION` | avisar toolchain atrás: rodar `scripts/casa-init` de um snapshot atual |
| 3 | declaração e `CONTRACT_VERSION` iguais em `(major, minor)` | nenhum aviso de versão |
| 4 | `casa-version` com formato inválido | apenas o erro de formato existente — o aviso de coerência não dispara por cima |
| 5 | existe arquivo `backlog.md` (qualquer case) em `docs/context/` | avisar localização: mover para `docs/BACKLOG.md` e atualizar os ponteiros do router |
| 6 | `docs/BACKLOG.md` na raiz de `docs/` (lugar certo) | nenhum aviso de localização |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-docs-check    # exit 0 — casos 1–6 acima verdes
bash scripts/test-casa-init     # exit 0 — constantes casa-init/docs-check sincronizadas
python3 scripts/docs-check      # exit 0 — o próprio repo segue verde e sem avisos
```

## Revisão humana

- Texto dos avisos: acionável para quem nunca leu o ADR-0010/0011 (diz o que fazer, não só
  o que está errado).

## Verificação

```text
2026-07-05 · bash scripts/test-docs-check → 18 PASS / 0 FAIL (SPEC-0006 casos 1–6 + regressões SPEC-0003/0004), exit 0
2026-07-05 · bash scripts/test-casa-init → 31 PASS / 0 FAIL (constantes sincronizadas; promessa preservada), exit 0
2026-07-05 · python3 scripts/docs-check → 17 docs · 0 erro(s) · 0 aviso(s), exit 0
```
