---
status: implemented
date: 2026-06-13
builds-on: [ADR-0007, ADR-0003]
implemented-by:
  - scripts/docs-check
  - scripts/test-docs-check
  - .github/workflows/docs-check.yml
  - docs/templates/docs-check.workflow.yml
  - docs/templates/AGENTS.template.md
  - STANDARD.md
---

# docs-check valida os invariantes mínimos do contrato CASA 1.1

## Objetivo

O `docs-check` deixa de validar apenas a camada ADR/Spec e passa a proteger também os
invariantes mínimos do contrato CASA: router íntegro, Specs finais sem pendências
estruturais, paths reais de implementação e imutabilidade de ADR aceito no CI.

## Fluxo

```bash
python3 scripts/docs-check [--root .] [--emit-index]
python3 scripts/docs-check --adoption [--emit-baseline] --base-ref origin/main  # SPEC-0009
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main
```

1. Valida o router (`AGENTS.md`) antes dos docs: metadados CASA, DoD global e ponteiros de
   contexto.
2. Valida ADRs/Specs como antes: frontmatter, grafo, status, índices e higiene.
3. Aplica as regras fortes de Spec quando `status` é `accepted` ou `implemented`.
4. Quando `--check-adr-immutability` é usado, compara ADRs modificados contra `--base-ref`
   e rejeita qualquer mudança de corpo em ADR que já estava aceito/superado/deprecated.

## Contrato

- `AGENTS.md` é obrigatório e precisa declarar `casa-repo-id`, `casa-tier`,
  `casa-version` e `casa-standard-ref` em bloco `yaml`.
- O DoD global do router precisa existir e conter ao menos uma linha executável em bloco
  de código.
- Ponteiros `docs/context/*.md` no mapa de contexto precisam existir.
- Spec `accepted`/`implemented` não pode ter checkbox aberto em `## Questões em aberto`.
- Spec `accepted`/`implemented` precisa ter DoD com comando real, sem placeholder.
- Spec `implemented` precisa ter `implemented-by` não vazio, sem placeholder e com paths
  existentes no repo.
- O lint de imutabilidade permite ADR novo e mudanças de frontmatter/bloco
  `VERDADE ATUAL`; alteração de corpo em ADR já aceito é erro.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | repo novo criado pelo `casa-init` | passar no `docs-check` sem criar capítulos de contexto falsos |
| 2 | router não declara `casa-version` | falhar apontando o metadado ausente |
| 3 | router aponta para `docs/context/INFRA.md` inexistente | falhar apontando o ponteiro quebrado |
| 4 | Spec `accepted` mantém `- [ ]` em questões abertas | falhar porque a Spec não chegou decidida |
| 5 | Spec `accepted` mantém `<placeholder>` no DoD | falhar porque o DoD não é executável |
| 6 | Spec `implemented` aponta `implemented-by` para path inexistente | falhar apontando o path |
| 7 | ADR aceito tem corpo alterado com `--check-adr-immutability` | falhar apontando imutabilidade violada |
| 8 | ADR aceito só ganha `VERDADE ATUAL`/frontmatter de supersessão | passar no lint de imutabilidade |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-docs-check        # exit 0 — cenários acima verdes
python3 scripts/docs-check          # exit 0 — o próprio repo segue verde
```

## Revisão humana

- As mensagens de erro ajudam um adotante a corrigir o router/Spec sem ler o código?
- O lint de imutabilidade continua simples o bastante para não virar política opaca.

## Verificação

```text
2026-06-13 · bash scripts/test-docs-check → 8 PASS / 0 FAIL (EARS 1–8 cobertos), exit 0
2026-06-13 · python3 scripts/docs-check → 10 docs · 0 erro(s) · 0 aviso(s), exit 0
2026-06-13 · python3 scripts/docs-check --check-adr-immutability --base-ref origin/main → 10 docs · 0 erro(s) · 0 aviso(s), exit 0
```
