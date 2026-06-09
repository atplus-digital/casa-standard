---
status: accepted
date: 2026-06-09
builds-on: []
superseded-by: null
deciders: [maicon]
---

# Pendências e reservas de NNNN moram em docs/BACKLOG.md quando não há tracker

## Contexto e problema

O STANDARD mandava decisão de negócio não tomada para o issue tracker — e o repo-piloto não
tem tracker. O agente de adoção inventou `docs/context/BACKLOG.md`, que viola a taxonomia do
§4: capítulo de contexto é estado **imperativo e atemporal**; backlog é lista de pendências.
Ao mesmo tempo, faltava lugar canônico para registrar **reservas de numeração `NNNN`** — a
mitigação de colisão de ids entre PRs paralelos que o §5 cobrava sem dizer onde registrar
(o piloto reservou ADRs 0013–0018 por conta própria, sem lugar oficial).

## Direcionadores da decisão

- A fronteira conceitual dos capítulos (§4) é o que evita multi-fonte-da-verdade — não se fura.
- Repo sem tracker é caso real; exigir tracker é atrito de adoção desproporcional.
- Reserva de `NNNN` precisa de um ledger versionado junto dos docs que numera.

## Opções consideradas

### Opção 1 — Exigir issue tracker
**Prós:** pendência fica onde pendência costuma morar.
**Contras:** dependência externa para adotar o padrão; o piloto já demonstrou o atrito.

### Opção 2 — Backlog como capítulo de contexto
**Prós:** nenhuma estrutura nova.
**Contras:** quebra a fronteira imperativo/atemporal; o agente carregaria todo-list como estado.

### Opção 3 — `docs/BACKLOG.md` na raiz de docs/, fora das camadas validadas
**Prós:** lugar canônico; capítulos ficam puros; versionado junto dos docs; o ledger de
`NNNN` mora no mesmo arquivo.
**Contras:** mais um arquivo a conhecer (mitigado: o router aponta).

## Decisão

Opção 3. `docs/BACKLOG.md` é o lugar oficial para (a) decisões pendentes em repo sem tracker
e (b) o ledger de reservas de `NNNN`. Conteúdo livre, **não validado** pelo `docs-check`
como camada documental. Havendo tracker, ele continua preferível para (a); o ledger (b)
fica no arquivo mesmo assim.

## Consequências

- `docs/context/` mantém a pureza taxonômica; `BACKLOG.md` nunca vive lá.
- O §5 ganha destino concreto para a reserva de números.
- O arquivo é opcional: só existe quando há pendência ou reserva.

## Confirmação

```bash
test ! -e docs/context/BACKLOG.md   # exit 0: backlog nunca é capítulo de contexto
```

## Notas

Aprendizado do piloto console-platon (adoção de 2026-06-09).
