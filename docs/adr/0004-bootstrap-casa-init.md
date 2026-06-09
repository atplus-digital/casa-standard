---
status: accepted
date: 2026-06-09
builds-on: [ADR-0001]
superseded-by: null
deciders: [maicon]
---

# Bootstrap e atualização de repo adotante é script idempotente no casa-standard

## Contexto e problema

O §10 cobria adoção em repo existente como ritual manual e nada cobria projeto novo. Clonar
o `casa-standard` traz a *identidade* do repo-padrão (o `AGENTS.md` dele, os ADRs dele, o
BACKLOG dele), não o esqueleto de um projeto. Cópia manual deixa ponteiro quebrado — o
template do router referenciava `STANDARD.md`, que não existe no repo de destino. E não
havia mecanismo de **atualização** da toolchain (`docs-check`, templates) nos repos que já
adotaram: cada repo congela na versão do dia da cópia.

## Direcionadores da decisão

- Automação > disciplina: "como começar/atualizar" deve ser comando, não checklist.
- Um fato mora num arquivo só: nada de segundo repo-template para manter em sincronia.
- Cobrir **todos** os estados de repo: vazio, novo, legado, com docs ADR/SDD pré-existentes.
- Nunca destruir nem decidir pelo adotante: conteúdo é dele; julgamento de migração é humano.
- Preparar a governança de versão (extensão A.4) com custo zero hoje.

## Opções consideradas

### Opção 1 — Checklist manual no README
**Prós:** custo zero de implementação.
**Contras:** disciplina sem validação; o piloto mostrou que lacuna vira improviso.

### Opção 2 — Repo template do GitHub ("Use this template")
**Prós:** UX nativa para greenfield.
**Contras:** segunda fonte da verdade (templates/validador em dois repos, sincronia
apodrece); não cobre repo existente nem atualização de toolchain.

### Opção 3 — Script idempotente no próprio casa-standard (`casa-init`)
**Prós:** fonte única (mora ao lado do que distribui); cobre novo, legado e atualização
com o mesmo comando; testável no CI do padrão (o CI passa a *provar* que todo repo nasce
verde).
**Contras:** mais um script para manter — mitigado pelo teste de cenários no CI.

## Decisão

Opção 3. `scripts/casa-init <destino>` instala e atualiza a infraestrutura CASA com três
regras de propriedade: **toolchain é da ferramenta** (docs-check, pre-commit, templates —
sobrescreve quando difere); **identidade é do repo** (`AGENTS.md` é criado do template só
se ausente e nunca sobrescrito — exceto a linha `casa-standard-ref`, que a ferramenta
possui e carimba); **gate conforme ADR-0001** (remote → CI; sem remote → hook; sem `.git`
→ orienta). Migração de conteúdo permanece humana (§10): o script diagnostica via
`docs-check` e aponta, não decide. Comportamento detalhado: SPEC-0001.

## Consequências

- Projeto novo nasce verde com um comando; repo adotado atualiza a toolchain rodando de novo.
- O router de todo repo adotante ganha `casa-standard-ref` — semente da extensão A.4
  (saber quem está com toolchain defasada vira query, não auditoria).
- O CI do casa-standard testa os cenários de bootstrap (`scripts/test-casa-init`).
- O workflow de CI distribuído vira template (`docs/templates/docs-check.workflow.yml`),
  separado do workflow do próprio casa-standard.

## Confirmação

```bash
test -x scripts/casa-init && scripts/test-casa-init >/dev/null   # exit 0: bootstrap existe e cenários passam
```

## Notas

Gatilho: pergunta real de adoção ("se eu clonar, levo o AGENTS.md do casa-standard junto").
Primeira reserva de NNNN feita pelo ledger do `docs/BACKLOG.md` (ADR-0002).
