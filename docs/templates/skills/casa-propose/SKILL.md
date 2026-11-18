---
name: casa-propose
description: Transforma uma necessidade em ADR ou Spec CASA pronta para revisão — decide pelo gatilho do STANDARD §3, reserva o número com scripts/docs-reserve, escreve casos de borda EARS e um DoD com comandos reais do repo. Use quando a tarefa envolve decisão estrutural, ou comportamento novo ou alterado com contrato observável.
---

# CASA · propor

Etapas 1–3 do ciclo (STANDARD §9 do casa-standard). Contexto ainda não mapeado? Rode
`casa-explore` antes.

1. **Gatilho (§3):** decisão estrutural → ADR. Contrato observável (API, fluxo de usuário,
   casos de borda que importam) → Spec. Nenhum dos dois → não escreva documento.
2. **Reserve e crie do template:** `python3 scripts/docs-reserve adr "título"` ou
   `python3 scripts/docs-reserve spec "título"`. Nunca escolha o número à mão.
3. **ADR** (`status: proposed`): contexto, direcionadores, opções com prós e contras, a
   decisão em uma frase, consequências e `## Confirmação` com um comando que verifica a
   decisão na prática. Estado atual não entra no ADR — vai para capítulo de contexto.
4. **Spec** (`status: draft`): ADRs que a fundamentam em `builds-on`; Fluxo, Contrato e
   Casos de borda numerados, de preferência em EARS ("QUANDO gatilho, o sistema DEVE
   resposta"). O que não dá para decidir vai para `## Questões em aberto` como `- [ ]` — e
   bloqueia a implementação daquele ponto.
5. **DoD (§7):** comandos REAIS do repo, com critério binário no comentário; todo caso de
   borda coberto por uma linha ou por um teste que ela roda (`# casos 1–4`). DoD só com os
   comandos genéricos do router é spec sem fechamento próprio.
6. Rode `python3 scripts/docs-check` até verde. Pare aqui: aceitar (`proposed → accepted`,
   `draft → accepted`) é decisão humana, no PR.

Entrega grande demais para um fechamento só? Divida em specs ou mova parte para
`## Fora do escopo` (casa-standard:ADR-0012).
