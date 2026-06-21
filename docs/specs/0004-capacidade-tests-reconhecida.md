---
status: implemented
date: 2026-06-20
builds-on: [ADR-0008]
implemented-by:
  - scripts/docs-check
  - scripts/test-docs-check
  - docs/templates/context.TESTS.template.md
  - scripts/casa-init
  - STANDARD.md
---

# docs-check reconhece o capítulo TESTS declarado no router e exige comando canônico

> Convenções compartilhadas: `STANDARD.md` §4 (capítulos de contexto) e §8 (o que o CI
> valida). Esta spec não as repete — só define o comportamento do primeiro capítulo
> reconhecido do registry fechado introduzido pelo ADR-0008.

## Objetivo

Declarar `docs/context/TESTS.md` no Mapa de contexto do router deixa de garantir apenas que
o arquivo existe e passa a garantir que ele cumpra seu papel: listar ao menos um comando
canônico de teste. O gatilho é a **declaração no router**; a regra mora no `docs-check`
(registry fechado `RECOGNIZED_CHAPTERS`), nunca no repo adotante.

## Fluxo

1. `validate_router` extrai os ponteiros `docs/context/*.md` citados no router (regra
   pré-existente: cada um precisa existir).
2. Para cada ponteiro que existe e está no registry fechado de capítulos reconhecidos,
   aplica o invariante de conteúdo da capacidade.
3. Capacidade `TESTS` (`docs/context/TESTS.md`): exige ao menos uma linha executável em
   bloco de código (mesmo critério de `executable_lines` usado no DoD global).

## Contrato

- O conjunto de capítulos reconhecidos é **fechado** (`RECOGNIZED_CHAPTERS`) e mora no
  `docs-check`; estender exige ADR no `casa-standard` (ADR-0008).
- O gatilho é a declaração do ponteiro no router, nunca a presença física do arquivo.
- Capítulo **não** reconhecido declarado segue valendo só a regra de existência.
- A capacidade `TESTS` falha o gate quando o capítulo declarado não tem comando em bloco
  de código; a mensagem aponta o capítulo reconhecido e orienta listar o comando ou
  remover o ponteiro.
- O template `docs/templates/context.TESTS.template.md` é distribuído pelo `casa-init`.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | router declara `TESTS.md` e o capítulo tem comando canônico | passar (test-docs-check EARS-9) |
| 2 | router declara `TESTS.md` e o capítulo só tem prosa | falhar apontando o capítulo reconhecido (EARS-10) |
| 3 | router declara `TESTS.md` mas o arquivo não existe | falhar como ponteiro quebrado (regra pré-existente, EARS-3) |
| 4 | router declara capítulo NÃO reconhecido (INFRA.md) sem comando | passar — registry fechado só exige existência (EARS-11) |
| 5 | repo novo do `casa-init` sem capítulos declarados | passar sem capítulos falsos (EARS-1) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-docs-check        # exit 0 — EARS 9–11 da capacidade TESTS verdes
python3 scripts/docs-check          # exit 0 — o próprio repo segue verde
scripts/test-casa-init              # exit 0 — bump de versão e distribuição do template ok
```

## Revisão humana

- A mensagem de erro orienta o adotante a corrigir o capítulo TESTS sem ler o código?
- O registry permanece fechado e auditável (ler o `docs-check` revela tudo que o gate checa).

## Verificação

```text
2026-06-20 · bash scripts/test-docs-check → 11 PASS / 0 FAIL (EARS 9–11 cobrem a capacidade TESTS), exit 0
2026-06-20 · python3 scripts/docs-check → 12 docs · 0 erro(s) · 0 aviso(s), exit 0
2026-06-20 · bash scripts/test-casa-init → 23 PASS / 0 FAIL (router criado/atualizado em casa-version 1.2), exit 0
```
