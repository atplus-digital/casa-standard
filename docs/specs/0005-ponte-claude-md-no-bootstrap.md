---
status: implemented
date: 2026-07-05
builds-on: [ADR-0009, ADR-0004]
implemented-by:
  - scripts/casa-init
  - scripts/test-casa-init
  - docs/templates/CLAUDE.template.md
  - CLAUDE.md
---

# casa-init garante a ponte CLAUDE.md para o router em todo repo adotante

## Objetivo

Todo repo com CASA instalado é legível pelo Claude Code sem passo manual: o `casa-init`
garante um `CLAUDE.md` cuja primeira linha útil importa o router (`@AGENTS.md`). O router
continua sendo a fonte única (ADR-0009).

## Fluxo

1. Após tratar a identidade do router (SPEC-0001, passo 3), o `casa-init` verifica
   `CLAUDE.md` no destino.
2. Ausente → cria a partir de `docs/templates/CLAUDE.template.md` e relata `criado`.
3. Presente contendo `@AGENTS.md` → relata `em dia`; nenhum byte muda.
4. Presente sem `@AGENTS.md` → preservado byte a byte; `AVISO` orienta adicionar a linha.

## Contrato

- `CLAUDE.md` do destino é **identidade do repo**: o `casa-init` nunca o sobrescreve nem o
  edita — nem mesmo para inserir o import (contraste com o router, cujos metadados
  tool-owned são atualizados; na ponte nada é tool-owned após a criação).
- `docs/templates/CLAUDE.template.md` é **toolchain**: distribuído e atualizado em
  `docs/templates/` do adotante como os demais templates.
- Saída segue o vocabulário da SPEC-0001: `criado | em dia | AVISO`.
- Aplica-se a T0 e T1 — todo repo com router.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | `CLAUDE.md` não existe no destino | criá-lo do template, com `@AGENTS.md` presente |
| 2 | `CLAUDE.md` existe e contém `@AGENTS.md` | não alterar nenhum byte e relatar `em dia` |
| 3 | `CLAUDE.md` existe sem `@AGENTS.md` | não alterar nenhum byte e emitir `AVISO` |
| 4 | rodado duas vezes seguidas sem mudança na origem | a segunda execução não altera nenhum byte (EARS-10 da SPEC-0001 cobre a ponte) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-casa-init   # exit 0 — cenários 1–4 acima verdes
python3 scripts/docs-check    # exit 0 — o próprio repo segue verde
```

## Revisão humana

- Texto do template legível para quem abre o `CLAUDE.md` sem conhecer o CASA: fica claro
  que o router é o `AGENTS.md` e que instruções específicas do Claude Code entram abaixo.

## Verificação

```text
2026-07-05 · bash scripts/test-casa-init → 28 PASS / 0 FAIL (SPEC-0005 casos 1–4 + regressões SPEC-0001), exit 0
2026-07-05 · python3 scripts/docs-check → 14 docs · 0 erro(s) · 0 aviso(s), exit 0
2026-07-05 · bash scripts/test-docs-check → 11 PASS / 0 FAIL · bash scripts/test-install → 11 PASS / 0 FAIL
```
