---
status: proposed
date: 2026-07-05
builds-on: [ADR-0008, ADR-0005]
superseded-by: null
deciders: [maicon]
---

# Resolução cross-repo local-first e onde mora a spec de integração

> **ADR em discussão** (`proposed`): abre a conversa do Apêndice A.3, cujo sintoma
> apareceu. As questões do final estão abertas de propósito — decidir aqui, no PR.

## Contexto e problema

O Apêndice A.3 previu verificação cross-repo do grafo com gatilho claro: "decisões
compartilhadas começarem a quebrar". O sintoma apareceu na suíte linee (2026-07-05):

- **linee-chat#100** travou a governança em "onde mora a spec da malha Chat-Pipe?" e
  fechou decidindo especificar **nos dois lados** — chat `SPEC-0017` ⇄ pipe `SPEC-0002`,
  com `builds-on` cross-repo formando **ciclo** e fatos do Pipe restatados no lado chat
  (lifecycle de `ticket_external_links`, idempotência) — espelhamento parcial que o
  Princípio 2 proíbe, feito por falta de guidance.
- **linee-chat#99**: o DoD valida contrato de payload entre três repos **manualmente**
  contra fixtures.
- O `docs-check` trata `repo:SPEC-NNNN` como **aviso não-verificado** — e só olha
  frontmatter (`builds-on`/`superseded-by`): as referências que motivaram a issue #18
  vivem em prosa/DoD e são **invisíveis** ao validador hoje. Rename ou supersessão do
  outro lado passa em silêncio.

## Direcionadores da decisão

- **Determinismo do gate** (critério do ADR-0008): o resultado do CI não pode ser função
  do branch que o checkout vizinho por acaso tem aberto, nem de rede.
- Sem serviço central, sem lock distribuído (ADR-0005; mesma recusa da issue #12).
- Um fato mora num arquivo só (Princípio 2): contrato compartilhado não se espelha.
- O que já existe primeiro: `docs/index.json` é gerado por `--emit-index` em todo repo —
  é o índice que A.3 pediu, faltando só o mapa de onde encontrá-lo.

## Opções consideradas

### Opção 1 — Status quo (aviso não-verificado)
**Prós:** zero custo. **Contras:** o sintoma já custou uma issue de governança e validação
manual de contrato; refs quebradas envelhecem em silêncio.

### Opção 2 — Índice federado / serviço central (letra original do A.3)
**Prós:** resolveria atraso absoluto. **Contras:** infraestrutura nova, rede no gate,
ponto único — contra ADR-0005/0006 e o determinismo do ADR-0008.

### Opção 3 — Resolução local-first opcional, dev-side; guidance de localização no §5
**Prós:** usa o `docs/index.json` que já existe; opt-in por **declaração** (mapa
`casa-repo-id → caminho local | URL raw`, nunca descoberta por presença — ADR-0008); sem
mapa, comportamento atual intacto. **Contras:** resolução contra checkout local é
não-determinística (worktree do vizinho em branch arbitrário) — por isso é ferramenta de
conveniência do dev, **não gate**; no CI (sem irmãos) permanece o aviso atual.

## Decisão (proposta)

Opção 3, em duas partes:

1. **Resolução local-first opcional.** Um repo pode declarar um mapa
   `casa-repo-id → caminho local | URL raw` (local a definir — ver questões). Com o mapa,
   `docs-check --resolve-cross-repo` resolve referências `repo:(ADR|SPEC)-NNNN` do
   **frontmatter** contra o `docs/index.json` de cada irmão: alvo inexistente → erro no
   modo manual; alvo `superseded`/`deprecated` → **aviso** (verdade de outro repo, mesma
   severidade de hoje). **Escopo explícito**: só frontmatter — referência em prosa/DoD
   continua invisível e fora da promessa deste ADR. O resolvedor **tolera ciclos**
   (malha bidirecional legítima os produz). O gate do CI **não muda**.
2. **Guidance de localização (§5, na aceitação).** Spec de integração mora no repo que
   **serve** aquela direção do contrato (quem expõe a API/evento). Malha bidirecional:
   cada direção mora com quem a serve; o **envelope/overview compartilhado mora num único
   repo escolhido** e os demais **apontam via `repo:SPEC-NNNN` — nunca restatam** (o
   espelhamento parcial da malha Chat-Pipe é o anti-exemplo a corrigir).

## Consequências (se aceito)

- O caso linee-chat#100 ganha resposta de método: escolher o repo do envelope, remover os
  fatos restatados do outro lado, apontar.
- Rename/supersessão cross-repo deixa de ser fé para quem roda a resolução local.
- A validação de payload/fixtures (linee-chat#99) **continua sendo DoD dos repos
  envolvidos** — grafo documental não versiona payload; fica explicitamente fora.
- A.3 é reescrito para refletir o modo local-first (a letra atual fala em "índices
  remotos ou federado").

## Confirmação

```bash
# na aceitação: cenários de resolução no test-docs-check (mapa presente/ausente,
# alvo ok/inexistente/superseded, ciclo) + §5/A.3 atualizados no mesmo PR
python3 scripts/docs-check   # exit 0: o repo segue verde
```

## Questões em aberto (decidir na conversa deste PR)

1. **Onde mora o mapa?** Campo registrado no router (bloco yaml) vs. arquivo próprio
   declarado no router. O bloco yaml do router é fechado (`ROUTER_REQUIRED` + validação);
   campo novo ali é mudança de contrato — arquivo próprio (ex.: `docs/casa-siblings.yml`)
   declarado no router parece menor.
2. **URL raw no modo manual**: aceitar rede fora do gate, ou local-only na primeira
   versão?
3. **Severidade de alvo inexistente** no modo manual: erro (proposto) ou aviso?
4. **Staleness**: o resolvedor deve avisar idade/branch do checkout irmão consultado?

## Notas

Gatilho: issue #18 (Refs — a issue fecha quando este ADR sair de `proposed`, com §5/A.3
atualizados no mesmo PR). Evidência de campo e correções de desenho: revisão adversarial
de 2026-07-05 (caso bidirecional, ciclos, escopo frontmatter-only, dev-side vs gate).
Reservado e criado pelo `docs-reserve` (SPEC-0007).
