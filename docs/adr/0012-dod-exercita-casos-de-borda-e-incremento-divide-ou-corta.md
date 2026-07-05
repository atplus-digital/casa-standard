---
status: accepted
date: 2026-07-05
builds-on: [ADR-0007]
superseded-by: null
deciders: [maicon]
---

# DoD de Spec exercita os casos de borda; entrega incremental divide a spec ou corta o escopo

## Contexto e problema

O DoD executável (§7) é o único vínculo entre a Spec e o comportamento real do código — o
`docs-check` valida a doc, nunca o runtime. Quando o DoD é genérico, o gate fica verde e o
contrato mente. Dois sintomas de campo (levantamento de 2026-07-05):

1. **Spec `implemented` cujo código ignora o que ela define.** qualimonitor#45/#46:
   `incident_config` (quorum, hysteresis, cooldown) e `interval_seconds` definidos em spec,
   coletados na UI, gravados no banco — e ignorados pelo runtime. A SPEC-0009 de lá enumera
   13 casos de borda em EARS e tem DoD que é subconjunto do DoD global do repo
   (typecheck/lint/test/build): nada nele exercita quorum. Gate verde, contrato falso.
2. **Spec `accepted`/`implemented` com entrega deliberadamente parcial.** linee-chat
   SPEC-0002: "migração completa de schema — hoje parcial". A spec guarda-chuva
   meio-entregue não tem estado honesto no vocabulário — "o que conta como pronto" vira
   interpretação. Em contraste, a SPEC-0018 do mesmo repo pratica o corte limpo: "Fora do
   escopo (decidido)" apontando backfill para o backlog.

## Direcionadores da decisão

- Critério de aceite é comando, não parágrafo (Princípio 4) — mas comando **genérico**
  fecha o loop do repo, não o da spec.
- Fechamento atômico (§5.2/§9) e agrupamento fora das docs (§3): incremento é papel de
  PR/tracker, não de spec eternamente meio-implementada.
- Honestidade do padrão: norma não-mecanizável entra marcada como revisão humana (o §5.2
  já faz isso com a propagação de gotchas), nunca fingindo ser gate.
- A referência não pode se desmentir: check que gera aviso falso permanente no próprio
  `casa-standard` ensina o agente a ignorar avisos.

## Opções consideradas

### Opção 1 — Só prosa normativa, sem ADR
**Prós:** PR mínimo.
**Contras:** seria o primeiro bump de contrato sem registro causal (1.1→1.4 todos têm ADR);
o ADR-0008 já fixa a leitura "mudança normativa entra como qualquer mudança do §10: ADR".

### Opção 2 — Prosa + aviso mecânico "DoD ⊆ DoD global" no docs-check
**Prós:** mecaniza o sinal; na medição de campo (80 specs, 5 repos), "subconjunto" acha 15
casos incluindo o motivador, com 2–3 falsos-positivos toleráveis.
**Contras:** refutada pelo dogfood — no próprio `casa-standard` o DoD global é a **união**
dos testes específicos das specs (`test-casa-init` exercita a SPEC-0001 e está no DoD
global): todas as 6 specs daqui são subconjunto **legítimo** e gerariam aviso falso
permanente na referência. Isentar por lista ou por `implemented-by` seria heurística
ad-hoc — complexidade esperta, não automação confiável.

### Opção 3 — Prosa normativa marcada como revisão humana + heurística registrada como extensão futura
**Prós:** a regra entra no contrato com o mecanismo de verificação honesto (revisão humana
do PR, mesmo padrão do fechamento §5.2); o obstáculo da heurística fica documentado para
quem retomar (issue #16).
**Contras:** verificação depende de gente até alguém desenhar um check que não se desminta.

## Decisão

Opção 3, em duas regras:

1. **§7 — DoD exercita a spec.** Cada caso de borda enumerado deve ter linha de DoD — ou
   teste referenciado por ela — que o exercite; DoD cujos comandos são todos genéricos do
   repo (subconjunto do DoD global do router) é **sinal de spec sem fechamento próprio**.
   Rastreabilidade sugerida: citar os números dos casos no comentário da linha
   (`npm test -- --run dns   # casos 1–4`). O vínculo caso↔comando **não é mecanizável** e
   fica na revisão humana do PR.
2. **§5.2 — incremento divide ou corta.** Entrega incremental **divide a spec** (cada
   incremento entregável vira spec com fechamento atômico próprio) **ou corta o incremento
   para fora do contrato** (`## Fora do escopo` decidido + registro em backlog/tracker).
   Spec guarda-chuva meio-implementada não existe. Ao dividir spec já aceita, a original
   vira `deprecated` (spec não usa `superseded-by`; §6/§8) e as partes a citam em
   `builds-on`.

Aplicabilidade: specs novas e specs tocadas (o mesmo critério de migração do §10: doc
tocado, doc migrado). O estoque existente não fica retroativamente fora da letra.

## Consequências

- O caso qualimonitor#45 teria sido barrado na revisão do PR da spec: 13 casos EARS e
  nenhum comando que os exercite é agora não-conformidade nomeada.
- linee-chat SPEC-0002 tem caminho definido: dividir (migração de schema vira spec própria)
  ou cortar (registrar o resto como fora do contrato e fechar o que está entregue).
- A heurística de aviso fica **contemplada e bloqueada** (issue #16): implementá-la exige
  resolver o falso-positivo do repo-referência sem isenção ad-hoc.

## Confirmação

```bash
python3 scripts/docs-check    # exit 0 — o repo segue verde; nenhuma validação nova
grep -q "subconjunto do DoD global" STANDARD.md   # a regra está no contrato (§7)
grep -q "divide a spec" STANDARD.md               # e o corte incremental também (§5.2)
```

## Notas

Gatilho: issue #16, com evidência de qualimonitor#45/#46 e linee-chat (SPEC-0002/0018), e
medição da revisão adversarial de 2026-07-05 ("idêntico ao DoD global": 0/80 specs — sinal
inerte; "subconjunto": 15/80 incluindo o caso motivador). A rejeição da heurística no gate
está na Opção 2.
