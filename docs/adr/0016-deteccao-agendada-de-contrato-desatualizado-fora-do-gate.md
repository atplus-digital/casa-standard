---
status: accepted
date: 2026-07-06
builds-on: [ADR-0010, ADR-0006, ADR-0005]
superseded-by: null
deciders: [maicon]
---

# Detecção agendada de contrato desatualizado — rede fora do gate, aviso no tracker

## Contexto e problema

O ADR-0010 fechou o loop de coerência **interna** (declaração × toolchain instalada) e
rejeitou rede no `docs-check` (Opção 2 de lá): gate tem que ser determinístico, roda como
pre-commit hook em repo sem GitHub, e o padrão promete funcionar offline. A dívida ficou
nomeada no Apêndice A.5: **atraso absoluto** — repo coerente-mas-velho (toolchain 1.1 +
declaração 1.1) fica em silêncio até alguém lembrar de rodar `casa-init`. Lembrar é
disciplina. O estado da frota em 2026-07-05 é o sintoma: todos os adotantes entre 4 e 6
minors atrás, e o único mecanismo era auditoria manual (qualimonitor#18).

## Direcionadores da decisão

- Rede é aceitável **onde rede é natural e falha não bloqueia ninguém**: um job agendado
  no CI do host — nunca no gate de PR/commit.
- Notificação que ninguém lê é papel de parede: o destino do aviso é o **tracker** (item
  acionável, deduplicado, que fecha sozinho), exatamente onde o §3 põe rastreio
  operacional.
- Adaptador por host (ADR-0006): o mecanismo entra para quem tem host com adaptador
  (hoje: GitHub); os demais permanecem no A.5 (processo).
- Comparar por **versão de contrato**, nunca por SHA da toolchain: SHA muda a cada commit
  do casa-standard e geraria aviso perpétuo; contrato é o sinal que importa (ADR-0007).

## Opções consideradas

### Opção 1 — Rede no docs-check
Rejeitada no ADR-0010 e continua rejeitada: quebra determinismo do gate, flakiness em
pre-commit, promessa offline.

### Opção 2 — Aviso por idade do snapshot, sem rede ("toolchain tem >N meses")
**Prós:** local. **Contras:** não-determinístico (função do relógio: o mesmo commit muda
de resultado com o tempo) e semanticamente errado — velho ≠ desatualizado (o contrato
pode não ter mudado).

### Opção 3 — Workflow agendado no host + script testável + issue como notificação
**Prós:** rede fora do gate, em job cuja falha não bloqueia nada (exit 0 sempre);
notificação vira issue com label `casa-update` — criada quando atrás, **editada** (nunca
duplicada) enquanto atrás, **fechada automaticamente** quando o repo alcança; lógica num
script `sh` da toolchain (testável com stubs de `curl`/`gh`), workflow fino por cima;
distribuído pelo `casa-init` só a remotes GitHub, criado se ausente e nunca sobrescrito
(mesmo contrato do workflow do gate).
**Contras:** só cobre hosts com adaptador e exige o workflow instalado ao menos uma vez —
o repo que nunca rodou `casa-init` continua no A.5, e isso é insolúvel por definição.

## Decisão

Opção 3. Entram na toolchain: `scripts/casa-update-check` (POSIX sh; lê `casa-version` do
router, busca a versão vigente no `CHANGELOG.md` raw do casa-standard — fonte
sobrescrevível por `CASA_SOURCE_URL` para teste/fork — e mantém a issue) e
`docs/templates/casa-update-check.workflow.yml` (cron semanal + `workflow_dispatch`,
`permissions: issues: write`). Regras duras do script: **exit 0 sempre** que o mundo
externo falhar (rede fora, versões ilegíveis) — quem cobra a integridade do router é o
`docs-check`, não ele; declarado à frente do vigente é tratado como em dia (não é papel
dele julgar); uma issue por repo, por label.

## Consequências

- O ciclo de atualização fecha inteiro, cada peça no seu lugar: **workflow agendado**
  detecta atraso absoluto (rede, fora do gate) → **issue** manda rodar `casa-init` →
  `casa-init` atualiza a toolchain sem tocar a promessa (ADR-0010) → **aviso do
  docs-check** (local, determinístico) cobra a atualização deliberada da declaração.
- A.5 é atualizado: a metade "verificação externa ao gate" está paga para GitHub; a
  cadência de `casa-init` em host sem adaptador segue processo.
- O casa-standard **não** instala o workflow em si mesmo (é a fonte; comparação consigo
  seria no-op — e o `casa-init` recusa o self-destino desde a SPEC-0001).
- Custo aceito: segundo workflow na árvore dos adotantes; cron de repo público inativo
  por 60 dias é desativado pelo GitHub — o `workflow_dispatch` cobre reativação.

## Confirmação

```bash
bash scripts/test-update-check   # exit 0: cenários da SPEC-0008 com stubs verdes
bash scripts/test-casa-init      # exit 0: instalação do workflow por host coberta
python3 scripts/docs-check       # exit 0: o próprio repo segue verde
```

## Notas

Gatilho: issue #25, na sequência da pergunta "o docs-check não deveria consultar o GitHub?"
— a resposta é não (ADR-0010), e este ADR é o sim no lugar certo. Comportamento detalhado:
SPEC-0008. Reservado e criado pelo `docs-reserve`; a colisão de NNNN com o ADR-0015 do
PR #24 (branch paralela) ocorreu na criação deste doc e foi resolvida à mão — evidência
viva do escopo declarado no ADR-0013.
